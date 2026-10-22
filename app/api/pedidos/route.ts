import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServiceClient();

    // 1. Obtener todos los pedidos
    const { data: pedidos, error: pErr } = await supabase
      .from("pedidos")
      .select("*, pedido_items(id, producto_id, nombre_producto, imagen_url, cantidad, precio_unitario)")
      .order("created_at", { ascending: false });

    if (pErr) {
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    // 2. Traer todos los productos para tener el catálogo completo en memoria
    const { data: todosLosProductos, error: prodErr } = await supabase
      .from("productos")
      .select("*");

    const productosMap = new Map((todosLosProductos || []).map((p) => [String(p.id).toLowerCase(), p]));

    // 3. Enriquecer los items de los pedidos
    const pedidosEnriquecidos = (pedidos || []).map((p) => ({
      ...p,
      pedido_items: (p.pedido_items || []).map((item: any) => {
        const prod = item.producto_id ? productosMap.get(String(item.producto_id).toLowerCase()) : null;
        return {
          ...item,
          _nombre: item.nombre_producto || prod?.nombre || "Producto",
          _imagen: item.imagen_url || prod?.imagen_url || null,
          _stock: prod?.stock !== undefined ? prod.stock : null,
        };
      }),
    }));

    return NextResponse.json({ pedidos: pedidosEnriquecidos });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
