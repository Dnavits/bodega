import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("productos").select("id, nombre, stock").limit(5);
  return NextResponse.json({ data, error: error ? error.message : null });
}
