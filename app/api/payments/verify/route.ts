import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "No configurado" }, { status: 503 });
    }

    const body = await request.json();
    const { payment_id } = body;

    if (!payment_id) {
      return NextResponse.json({ error: "payment_id requerido" }, { status: 400 });
    }

    const mp = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(mp);

    let paymentData: any;
    try {
      paymentData = await paymentClient.get({ id: parseInt(payment_id) });
    } catch {
      return NextResponse.json({ error: "Pago no encontrado en MP" }, { status: 404 });
    }

    const mpStatus = paymentData.status;
    const mpPaymentId = paymentData.id?.toString();
    const mpPreferenceId = paymentData.preference_id;
    const metadata = paymentData.metadata || {};
    const totalAmount = paymentData.transaction_amount;

    if (mpStatus !== "approved") {
      return NextResponse.json({ ok: true, status: mpStatus, created: false });
    }

    const supabase = await createClient();

    // Idempotencia: si ya existe, devolver el pedido existente
    const { data: existente } = await supabase
      .from("pedidos")
      .select("id, numero_orden_seq")
      .eq("mp_payment_id", mpPaymentId)
      .maybeSingle();

    if (existente) {
      return NextResponse.json({ ok: true, created: false, pedidoId: existente.id, numeroOrden: existente.numero_orden_seq });
    }

    // Reconstruir items desde metadata
    let itemsRaw: { id: string; cantidad: number }[] = [];
    try {
      itemsRaw = JSON.parse(metadata.items_raw || "[]");
    } catch {
      itemsRaw = [];
    }

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
        itemsValidados.push({ producto_id: real.id, cantidad: item.cantidad, precio_unitario: real.precio });
      }
    }

    // Crear pedido
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
        user_id: null,
      })
      .select()
      .single();

    if (pedidoError || !pedido) {
      console.error("[Verify] Error creando pedido:", pedidoError);
      return NextResponse.json({ error: "Error creando pedido" }, { status: 500 });
    }

    // Items y stock
    if (itemsValidados.length > 0) {
      await supabase.from("pedido_items").insert(itemsValidados.map((i) => ({ ...i, pedido_id: pedido.id })));
      for (const item of itemsValidados) {
        const real = productosReales.find((p) => p.id === item.producto_id);
        if (real && typeof real.stock === "number") {
          await supabase.from("productos").update({ stock: Math.max(0, real.stock - item.cantidad) }).eq("id", real.id);
        }
      }
    }

    return NextResponse.json({ ok: true, created: true, pedidoId: pedido.id, numeroOrden: pedido.numero_orden_seq });
  } catch (err: any) {
    console.error("[Verify] Error inesperado:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
