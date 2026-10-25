import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminAccess } from "@/lib/admin-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);
    const { success } = checkRateLimit(`pedidos_patch_${ip}`, 30, 60 * 1000);
    if (!success) {
      return NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 });
    }

    const { id } = await params;
    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Identificador de pedido no válido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const isAdmin = await getAdminAccess(user.email, user.id);
    const isWhitelisted = user.email?.toLowerCase() === "terrorgm1@gmail.com";
    if (!isAdmin && !isWhitelisted) {
      return NextResponse.json({ error: "Sin permisos de administrador" }, { status: 403 });
    }

    const { estado } = await request.json().catch(() => ({}));
    const estadosValidos = ["pendiente", "en_proceso", "entregado", "confirmado", "en_camino", "cancelado"];

    if (!estado || typeof estado !== "string" || !estadosValidos.includes(estado)) {
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);
    const { success } = checkRateLimit(`pedidos_del_${ip}`, 30, 60 * 1000);
    if (!success) {
      return NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 });
    }

    const { id } = await params;
    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Identificador de pedido no válido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const isAdmin = await getAdminAccess(user.email, user.id);
    const isWhitelisted = user.email?.toLowerCase() === "terrorgm1@gmail.com";
    if (!isAdmin && !isWhitelisted) {
      return NextResponse.json({ error: "Sin permisos de administrador" }, { status: 403 });
    }

    // Borrar items del pedido primero (FK constraint)
    await supabase.from("pedido_items").delete().eq("pedido_id", id);

    const { error } = await supabase.from("pedidos").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: "No se pudo borrar el pedido." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
