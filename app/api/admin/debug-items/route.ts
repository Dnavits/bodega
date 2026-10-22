import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data: pedidos } = await supabase
      .from("pedidos")
      .select("id, numero_orden_seq, total, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: items } = await supabase
      .from("pedido_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      pedidos_count: pedidos?.length || 0,
      pedidos,
      items_count: items?.length || 0,
      items,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
