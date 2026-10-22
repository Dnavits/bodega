import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = createServiceClient();

    // 1. Obtener todos los productos para mapear precios a producto_id
    const { data: prods } = await supabase.from("productos").select("id, precio, nombre");
    
    // Buscar productos de 28.000 (Corona) y 45.000 (Aguardiente) y 13.000 (si hay)
    const corona = prods?.find((p) => p.precio === 28000 || p.nombre.toLowerCase().includes("corona"));
    const antioqueno = prods?.find((p) => p.precio === 45000 || p.nombre.toLowerCase().includes("antioqueño"));
    const otro = prods?.find((p) => p.precio === 13000);

    // 2. Traer pedidos que no tienen items
    const { data: pedidos } = await supabase
      .from("pedidos")
      .select("id, numero_orden_seq, total, pedido_items(id)");

    const vacios = (pedidos || []).filter((p) => !p.pedido_items || p.pedido_items.length === 0);

    const itemsAInsertar: any[] = [];
    for (const ped of vacios) {
      let prodElegido = null;
      if (ped.total === 28000 && corona) prodElegido = corona;
      else if (ped.total === 45000 && antioqueno) prodElegido = antioqueno;
      else if (ped.total === 13000 && otro) prodElegido = otro;
      else if (corona) prodElegido = corona;

      if (prodElegido) {
        itemsAInsertar.push({
          pedido_id: ped.id,
          producto_id: prodElegido.id,
          nombre_producto: prodElegido.nombre,
          cantidad: 1,
          precio_unitario: ped.total,
        });
      }
    }

    if (itemsAInsertar.length > 0) {
      const { error } = await supabase.from("pedido_items").insert(itemsAInsertar);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      pedidos_reparados: itemsAInsertar.length,
      detalles: itemsAInsertar,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
