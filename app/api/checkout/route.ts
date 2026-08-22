import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

// Ruta del servidor que crea el pedido. Por seguridad, todo se
// vuelve a validar aqui y nunca se confia en lo que mande el
// navegador: precios, stock, y que el correo de contacto haya
// pasado realmente por la verificacion de codigo.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión para pagar." }, { status: 401 });
  }

  const { items, direccion } = await request.json();

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  const { nombre, apellido, telefono, email, texto, detalle, barrio, ciudad } = direccion || {};
  if (!nombre || !apellido || !telefono || !email || !texto || !barrio || !ciudad) {
    return NextResponse.json({ error: "Faltan datos de contacto o dirección." }, { status: 400 });
  }

  const { data: codigoRegistro } = await supabase
    .from("codigos_verificacion")
    .select("verificado, expira_at")
    .eq("email", email)
    .single();

  if (!codigoRegistro?.verificado || new Date(codigoRegistro.expira_at) < new Date()) {
    return NextResponse.json({ error: "Verifica tu correo antes de continuar." }, { status: 400 });
  }

  const ids = items.map((i: { id: string }) => i.id);
  const { data: productosReales } = await supabase
    .from("productos")
    .select("id, precio, stock, activo")
    .in("id", ids);

  if (!productosReales) {
    return NextResponse.json({ error: "No se pudieron validar los productos." }, { status: 400 });
  }

  let total = 0;
  const itemsValidados = [];
  for (const item of items) {
    const real = productosReales.find((p) => p.id === item.id);
    if (!real || !real.activo || real.stock < item.cantidad) {
      return NextResponse.json(
        { error: `"${item.nombre}" ya no está disponible en esa cantidad.` },
        { status: 400 }
      );
    }
    total += real.precio * item.cantidad;
    itemsValidados.push({ producto_id: real.id, cantidad: item.cantidad, precio_unitario: real.precio });
  }

  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({
      user_id: user.id,
      total,
      estado: "pendiente",
      nombre,
      apellido,
      telefono,
      email,
      direccion: texto,
      detalle_direccion: detalle || null,
      barrio,
      ciudad
    })
    .select()
    .single();

  if (pedidoError || !pedido) {
    return NextResponse.json({ error: "No se pudo crear el pedido." }, { status: 500 });
  }

  await supabase
    .from("pedido_items")
    .insert(itemsValidados.map((i) => ({ ...i, pedido_id: pedido.id })));

  await sendEmail(
    email,
    "Confirmamos tu pedido - Bodega Dnavits",
    `<p>Hola ${nombre},</p>
     <p>Tu pedido #${pedido.id.slice(0, 8)} por $${total.toLocaleString("es-CO")} fue registrado
     correctamente y llega en 1 a 2 días hábiles a: ${texto}, ${barrio}, ${ciudad}.</p>
     <p>Gracias por comprar en Bodega Dnavits.</p>`
  );

  // --- Punto de conexion con Wompi ---
  // Cuando tengas tus llaves, aqui se genera la firma de integridad
  // (con WOMPI_EVENTS_SECRET, nunca en el navegador) y se devuelve
  // junto con el pedido.id como "reference" para el widget de pago.
  // Documentacion: https://docs.wompi.co/docs/colombia/widget-checkout-web/

  return NextResponse.json({ pedidoId: pedido.id, total });
}
