import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServiceClient();
    
    // Últimos 3 pedidos
    const { data: ultimosPedidos } = await supabase
      .from("pedidos")
      .select("id, numero_orden_seq, total, created_at, mp_preference_id, mp_payment_id")
      .order("created_at", { ascending: false })
      .limit(3);

    // Items en pedido_items
    const { data: items, error: errItems } = await supabase
      .from("pedido_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    // Items en mp_preference_items
    const { data: prefItems, error: errPref } = await supabase
      .from("mp_preference_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    // Columnas de pedido_items
    return NextResponse.json({
      ultimosPedidos,
      items,
      errItems: errItems ? errItems.message : null,
      prefItems,
      errPref: errPref ? errPref.message : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
