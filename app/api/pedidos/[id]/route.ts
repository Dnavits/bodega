import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminAccess } from "@/lib/admin-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const isAdmin = await getAdminAccess(user.email, user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Sin permisos de administrador" }, { status: 403 });
    }

    const { estado } = await request.json();
    const estadosValidos = ["pendiente", "en_proceso", "entregado"];

    if (!estado || !estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: `Estado inválido. Usa: ${estadosValidos.join(", ")}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("pedidos")
      .update({ estado })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "No se pudo actualizar el pedido." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, pedido: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
