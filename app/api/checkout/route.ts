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

  // Filtrar items reales para validar precios en base de datos
  const realIds = items
    .map((i: { id: string }) => i.id)
    .filter((id: string) => !id.startsWith("sample-"));

  let productosReales: any[] = [];
  if (realIds.length > 0) {
    const { data } = await supabase
      .from("productos")
      .select("id, precio, stock, activo")
      .in("id", realIds);
    productosReales = data || [];
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

  // Insertar en la tabla 'pedidos' sin campos inexistentes
  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({
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
    })
    .select()
    .single();

  if (pedidoError || !pedido) {
    return NextResponse.json(
      { error: "No se pudo guardar el pedido: " + (pedidoError?.message || "Error desconocido") },
      { status: 500 }
    );
  }

  // Insertar los items asociados si hay productos reales en base de datos
  if (itemsValidados.length > 0) {
    await supabase
      .from("pedido_items")
      .insert(itemsValidados.map((i) => ({ ...i, pedido_id: pedido.id })));
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
       <p>Tiempo de entrega: menos de 45 minutos.</p>
       <p>¡Gracias por elegir ${nombreBodegaEmail}!</p>`
    );
  }

  return NextResponse.json({
    pedidoId: pedido.id,
    numeroOrden: pedido.numero_orden,
    total,
  });
}
