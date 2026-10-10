import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Pasarela de pago no configurada en el servidor." },
        { status: 503 }
      );
    }

    const supabase = await createClient();

    // Verificar que la pasarela está activa en la configuración
    const { data: config } = await supabase
      .from("configuracion")
      .select("pasarela_activa, nombre_bodega")
      .eq("id", 1)
      .maybeSingle();

    if (!config?.pasarela_activa) {
      return NextResponse.json(
        { error: "La pasarela de pago está desactivada." },
        { status: 403 }
      );
    }

    const { items, direccion, notas } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
    }

    const { nombre, telefono, email, texto, detalle, barrio, ciudad } = direccion || {};
    if (!nombre || !telefono || !texto || !barrio) {
      return NextResponse.json(
        { error: "Faltan datos de contacto o dirección." },
        { status: 400 }
      );
    }

    // ── Validar precios desde la DB (nunca confiar en el cliente) ──
    const realIds = items
      .map((i: any) => i.id)
      .filter((id: string) => !id.startsWith("sample-"));

    let productosReales: any[] = [];
    if (realIds.length > 0) {
      const { data } = await supabase
        .from("productos")
        .select("id, nombre, precio, stock, activo")
        .in("id", realIds);
      productosReales = data || [];
    }

    // Validar stock y construir items para Mercado Pago
    const mpItems: {
      id: string;
      title: string;
      quantity: number;
      unit_price: number;
      currency_id: string;
    }[] = [];

    let total = 0;

    for (const item of items) {
      if (item.id.startsWith("sample-")) continue;

      const real = productosReales.find((p: any) => p.id === item.id);
      if (!real) {
        return NextResponse.json(
          { error: `Producto "${item.nombre || item.id}" no encontrado.` },
          { status: 400 }
        );
      }
      if (real.stock < item.cantidad) {
        return NextResponse.json(
          { error: `Stock insuficiente de "${real.nombre}". Disponible: ${real.stock}.` },
          { status: 400 }
        );
      }

      const precio = Math.round(real.precio); // MP requiere entero
      total += precio * item.cantidad;

      mpItems.push({
        id: real.id,
        title: real.nombre,
        quantity: item.cantidad,
        unit_price: precio,
        currency_id: "COP",
      });
    }

    if (mpItems.length === 0) {
      return NextResponse.json(
        { error: "No hay productos válidos en el carrito." },
        { status: 400 }
      );
    }

    // ── Guardar datos de entrega en metadata para el webhook ──
    const metadata = {
      nombre,
      telefono,
      email: email || "",
      direccion: texto,
      detalle_direccion: detalle || "",
      barrio,
      ciudad: ciudad || "Medellín",
      notas: notas || "",
      items_raw: JSON.stringify(
        items
          .filter((i: any) => !i.id.startsWith("sample-"))
          .map((i: any) => ({ id: i.id, cantidad: i.cantidad }))
      ),
    };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const nombreBodega = config?.nombre_bodega || "Bodega Dnavits";

    // ── Crear preferencia en Mercado Pago ──
    const mp = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(mp);

    const mpResponse = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: nombre,
          phone: { number: telefono },
          ...(email ? { email } : {}),
        },
        back_urls: {
          success: `${siteUrl}/pago/exitoso`,
          failure: `${siteUrl}/pago/fallido`,
          pending: `${siteUrl}/pago/pendiente`,
        },
        auto_return: "approved",
        notification_url: `${siteUrl}/api/payments/webhook`,
        statement_descriptor: nombreBodega,
        metadata,
        expires: true,
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      },
    });

    return NextResponse.json({
      preferenceId: mpResponse.id,
      initPoint: mpResponse.init_point, // URL de pago producción
      sandboxInitPoint: mpResponse.sandbox_init_point, // URL de pago sandbox
      total,
    });
  } catch (err: any) {
    console.error("[MP Create Preference] Error:", err);
    return NextResponse.json(
      { error: "Error al crear la preferencia de pago. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
