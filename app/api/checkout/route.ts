import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { items, direccion, metodo_pago, notas } = await request.json();

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  const { nombre, telefono, email, texto, detalle, barrio, ciudad } = direccion || {};
  if (!nombre || !telefono || !texto || !barrio) {
    return NextResponse.json({ error: "Faltan datos de contacto o dirección." }, { status: 400 });
  }

  // Filtrar items reales para validar precios y stock en base de datos
  const realIds = items
    .map((i: { id: string }) => i.id)
    .filter((id: string) => !id.startsWith("sample-"));

  let productosReales: any[] = [];
  if (realIds.length > 0) {
    const { data } = await supabase
      .from("productos")
      .select("id, nombre, precio, stock, activo")
      .in("id", realIds);
    productosReales = data || [];
  }

  // Validar stock antes de procesar el pedido
  for (const item of items) {
    if (item.id.startsWith("sample-")) continue;
    const real = productosReales.find((p) => p.id === item.id);
    if (!real) {
      return NextResponse.json(
        { error: `El producto "${item.nombre || item.id}" no existe en el catálogo.` },
        { status: 400 }
      );
    }
    if (real.stock !== undefined && real.stock !== null && real.stock < item.cantidad) {
      return NextResponse.json(
        { error: `No hay suficiente stock de "${real.nombre || item.nombre}". Disponible: ${real.stock} unidades.` },
        { status: 400 }
      );
    }
  }

  let total = 0;
  const itemsValidados: { producto_id: string; cantidad: number; precio_unitario: number }[] = [];

  for (const item of items) {
    if (item.id.startsWith("sample-")) {
      total += item.precio * item.cantidad;
      continue;
    }

    const real = productosReales.find((p) => p.id === item.id);
    const precio = real?.precio ?? item.precio;
    total += precio * item.cantidad;

    if (real) {
      itemsValidados.push({
        producto_id: real.id,
        cantidad: item.cantidad,
        precio_unitario: precio,
      });
    }
  }

  // Insertar en la tabla 'pedidos' con fallback si metodo_pago no existe aún en el schema
  const payloadPedido: Record<string, any> = {
    user_id: user?.id || null,
    total,
    estado: "pendiente",
    metodo_pago: metodo_pago || "efectivo",
    nombre,
    telefono,
    email: email || user?.email || null,
    direccion: texto,
    detalle_direccion: detalle || null,
    barrio,
    ciudad: ciudad || "Medellín",
    notas: notas || null,
  };

  let { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert(payloadPedido)
    .select()
    .single();

  // Si la columna metodo_pago aún no existe en la base de datos, reintentar guardándolo dentro de notas
  if (pedidoError && (pedidoError.message?.includes("metodo_pago") || pedidoError.code === "PGRST204")) {
    const fallbackPayload = { ...payloadPedido };
    delete fallbackPayload.metodo_pago;
    fallbackPayload.notas = `[Método de pago: ${(metodo_pago || "efectivo").toUpperCase()}] ${notas || ""}`.trim();

    const retry = await supabase
      .from("pedidos")
      .insert(fallbackPayload)
      .select()
      .single();

    pedido = retry.data;
    pedidoError = retry.error;
  }

  if (pedidoError || !pedido) {
    return NextResponse.json(
      { error: "No se pudo guardar el pedido: " + (pedidoError?.message || "Error desconocido") },
      { status: 500 }
    );
  }

  // Insertar los items asociados y descontar stock si hay productos reales en base de datos
  if (itemsValidados.length > 0) {
    await supabase
      .from("pedido_items")
      .insert(itemsValidados.map((i) => ({ ...i, pedido_id: pedido.id })));

    // Descontar stock de cada producto en la base de datos de forma segura
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

  // Enviar email si hay correo configurado
  if (email) {
    const { data: configRow } = await supabase
      .from("configuracion")
      .select("nombre_bodega")
      .limit(1)
      .maybeSingle();
    const nombreBodegaEmail = configRow?.nombre_bodega?.trim() || "Bodega Dnavits";

    await sendEmail(
      email,
      `Confirmación de tu pedido #${pedido.numero_orden || pedido.id.slice(0, 6)} - ${nombreBodegaEmail}`,
      `<p>Hola ${nombre},</p>
       <p>Tu pedido #${pedido.numero_orden || pedido.id.slice(0, 6)} por $${total.toLocaleString("es-CO")} fue recibido correctamente.</p>
       <p>Dirección de entrega: ${texto}, ${barrio}, ${ciudad || "Medellín"}.</p>
       <p>Tiempo estimado de entrega: 1 a 2 días hábiles.</p>
       <p>¡Gracias por elegir ${nombreBodegaEmail}!</p>`
    );
  }

  return NextResponse.json({
    pedidoId: pedido.id,
    numeroOrden: pedido.numero_orden,
    total,
  });
}
