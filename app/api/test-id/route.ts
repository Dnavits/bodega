import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();
  const { data: item } = await supabase
    .from("pedido_items")
    .select("producto_id")
    .eq("id", "8817d515-8c6e-46a1-a358-461678725ca4")
    .single();

  const { data: producto } = await supabase
    .from("productos")
    .select("*")
    .eq("id", item?.producto_id)
    .maybeSingle();

  const { count } = await supabase.from("productos").select("*", { count: "exact", head: true });

  return NextResponse.json({
    item_producto_id: item?.producto_id,
    producto_encontrado: producto,
    total_productos_en_db: count,
  });
}
