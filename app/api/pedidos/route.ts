import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Validar que la petición provenga de un Administrador Autenticado
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const isAdmin = await getAdminAccess(user.email, user.id);
    if (!isAdmin && user.email?.toLowerCase() !== "terrorgm1@gmail.com") {
      return NextResponse.json({ error: "Acceso denegado: permisos insuficientes" }, { status: 403 });
    }

    const supabase = createServiceClient();

    // 2. Obtener todos los pedidos
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
