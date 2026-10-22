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
        
        let imagenFinal = item.imagen_url || prod?.imagen_url || null;
        if (!imagenFinal && Array.isArray(prod?.imagenes) && prod.imagenes.length > 0) {
          imagenFinal = prod.imagenes[0];
        }

        // Si el producto en DB no tiene foto cargada por el admin aún, asignar foto temática por defecto
        if (!imagenFinal) {
          const n = (prod?.nombre || item.nombre_producto || "").toLowerCase();
          if (n.includes("corona")) {
            imagenFinal = "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=400&q=80";
          } else if (n.includes("aguardiente") || n.includes("antioqueño")) {
            imagenFinal = "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=400&q=80";
          } else if (n.includes("coca") || n.includes("cola")) {
            imagenFinal = "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80";
          } else if (n.includes("postobon") || n.includes("manzana")) {
            imagenFinal = "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=400&q=80";
          } else if (n.includes("cerveza") || n.includes("aguila")) {
            imagenFinal = "https://images.unsplash.com/photo-1608270192864-162e245a499d?auto=format&fit=crop&w=400&q=80";
          } else if (n.includes("agua")) {
            imagenFinal = "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80";
          } else {
            imagenFinal = "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=400&q=80";
          }
        }

        return {
          ...item,
          _nombre: item.nombre_producto || prod?.nombre || "Producto",
          _imagen: imagenFinal,
          _stock: prod?.stock !== undefined ? prod.stock : null,
        };
      }),
    }));

    return NextResponse.json({ pedidos: pedidosEnriquecidos });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
