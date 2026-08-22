import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Todas las escrituras pasan por RLS (ver supabase/schema.sql), asi
// que aunque alguien intente llamar esta ruta sin ser admin, Supabase
// rechaza el insert/update/delete a nivel de base de datos.

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const imagenes = [body.imagen_url_1, body.imagen_url_2, body.imagen_url_3].filter(
    (url): url is string => Boolean(url && url.trim())
  );

  const { error } = await supabase.from("productos").insert({
    nombre: body.nombre,
    precio: Number(body.precio),
    stock: Number(body.stock),
    categoria: body.categoria,
    imagenes,
    activo: true
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { id } = await request.json();

  const { error } = await supabase.from("productos").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
