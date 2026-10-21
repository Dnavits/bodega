import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "No configurado" }, { status: 503 });
    }

    // Mercado Pago envía los datos en la query string
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic") || searchParams.get("type");
    const id = searchParams.get("id") || searchParams.get("data.id");

    // Solo procesar notificaciones de tipo "payment"
    if (topic !== "payment" && topic !== "merchant_order") {
      return NextResponse.json({ ok: true });
    }

    if (!id) {
      return NextResponse.json({ error: "ID de pago no recibido" }, { status: 400 });
    }

    // ── Verificar el pago directamente con Mercado Pago ──
    // NUNCA confiar solo en la notificación — siempre verificar con la API
    const mp = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(mp);

    let paymentData: any;
    try {
      paymentData = await paymentClient.get({ id: parseInt(id) });
    } catch {
      // Si el pago no existe en MP, ignorar silenciosamente
      return NextResponse.json({ ok: true });
    }

    const mpStatus = paymentData.status; // 'approved' | 'pending' | 'rejected' | 'cancelled'
    const mpPaymentId = paymentData.id?.toString();
    const mpPreferenceId = paymentData.preference_id;
    const metadata = paymentData.metadata || {};
    const totalAmount = paymentData.transaction_amount;

    // Solo crear el pedido si el pago fue aprobado
    if (mpStatus !== "approved") {
      console.log(`[Webhook] Pago ${mpPaymentId} con estado ${mpStatus} — ignorado`);
      return NextResponse.json({ ok: true });
    }

    const supabase = createServiceClient();

    // Verificar que no exista ya un pedido con este payment_id (idempotencia)
    const { data: existente } = await supabase
      .from("pedidos")
      .select("id")
      .eq("mp_payment_id", mpPaymentId)
      .maybeSingle();

    if (existente) {
      console.log(`[Webhook] Pedido ya creado para pago ${mpPaymentId}`);
      return NextResponse.json({ ok: true });
    }

    // ── Reconstruir los items desde metadata ──
    let itemsRaw: { id: string; cantidad: number }[] = [];
    try {
      itemsRaw = JSON.parse(metadata.items_raw || "[]");
    } catch {
      itemsRaw = [];
    }

    // Validar precios desde DB otra vez (el pago ya fue aprobado pero verificamos)
    let productosReales: any[] = [];
    if (itemsRaw.length > 0) {
      const ids = itemsRaw.map((i) => i.id);
      const { data } = await supabase
        .from("productos")
        .select("id, nombre, precio, stock")
        .in("id", ids);
      productosReales = data || [];
    }

    const itemsValidados: { producto_id: string; cantidad: number; precio_unitario: number }[] = [];
    for (const item of itemsRaw) {
      const real = productosReales.find((p) => p.id === item.id);
      if (real) {
        itemsValidados.push({
          producto_id: real.id,
          cantidad: item.cantidad,
          precio_unitario: real.precio,
        });
      }
    }

    // ── Crear el pedido en Supabase ──
    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .insert({
        total: totalAmount,
        estado: "pendiente",
        metodo_pago: "mercadopago",
        mp_payment_id: mpPaymentId,
        mp_preference_id: mpPreferenceId,
        mp_status: mpStatus,
        transaction_id: `MP-${mpPaymentId}`,
        nombre: metadata.nombre || "",
        telefono: metadata.telefono || "",
        email: metadata.email || null,
        direccion: metadata.direccion || "",
        detalle_direccion: metadata.detalle_direccion || null,
        barrio: metadata.barrio || "",
        ciudad: metadata.ciudad || "Medellín",
        notas: metadata.notas || null,
        user_id: null, // Pagos de MP pueden ser anónimos
      })
      .select()
      .single();

    if (pedidoError || !pedido) {
      console.error("[Webhook] Error creando pedido:", pedidoError);
      return NextResponse.json({ error: "Error creando pedido" }, { status: 500 });
    }

    // ── Insertar items del pedido ──
    if (itemsValidados.length > 0) {
      await supabase
        .from("pedido_items")
        .insert(itemsValidados.map((i) => ({ ...i, pedido_id: pedido.id })));

      // Descontar stock
      for (const item of itemsValidados) {
        const real = productosReales.find((p) => p.id === item.producto_id);
        if (real && typeof real.stock === "number") {
          const nuevoStock = Math.max(0, real.stock - item.cantidad);
          await supabase
            .from("productos")
            .update({ stock: nuevoStock })
            .eq("id", item.producto_id);
        }
      }
    }

    console.log(`[Webhook] ✓ Pedido ${pedido.id} creado para pago MP ${mpPaymentId}`);
    return NextResponse.json({ ok: true, pedidoId: pedido.id });
  } catch (err: any) {
    console.error("[Webhook] Error inesperado:", err);
    // Siempre retornar 200 a MP para que no reintente indefinidamente
    return NextResponse.json({ ok: true });
  }
}
