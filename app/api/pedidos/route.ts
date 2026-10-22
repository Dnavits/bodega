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

    // 2. Enriquecer con productos
    const todosLosItems = (pedidos || []).flatMap((p) => p.pedido_items || []);
    const productoIds = [...new Set(todosLosItems.map((i: any) => i.producto_id).filter(Boolean))];

    let productosMap: Record<string, any> = {};
    if (productoIds.length > 0) {
      const { data: prods } = await supabase
        .from("productos")
        .select("id, nombre, imagen_url, stock")
        .in("id", productoIds);

      for (const pr of prods || []) {
        productosMap[pr.id] = pr;
      }
    }

    const pedidosEnriquecidos = (pedidos || []).map((p) => ({
      ...p,
      pedido_items: (p.pedido_items || []).map((item: any) => ({
        ...item,
        _nombre: item.nombre_producto || productosMap[item.producto_id]?.nombre || null,
        _imagen: item.imagen_url || productosMap[item.producto_id]?.imagen_url || null,
        _stock: productosMap[item.producto_id]?.stock ?? null,
      })),
    }));

    return NextResponse.json({ pedidos: pedidosEnriquecidos });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
