import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { count: productosActivos } = await supabase
    .from("productos")
    .select("*", { count: "exact", head: true })
    .eq("activo", true);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const { data: pedidosHoy } = await supabase
    .from("pedidos")
    .select("total")
    .gte("created_at", hoy.toISOString());

  const ingresosHoy = (pedidosHoy || []).reduce((sum, p) => sum + p.total, 0);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-6">Panel de administración</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-charcoal/10 rounded-xl p-4">
          <p className="text-xs text-charcoal/60">Productos activos</p>
          <p className="text-2xl font-medium mt-1">{productosActivos ?? 0}</p>
        </div>
        <div className="bg-white border border-charcoal/10 rounded-xl p-4">
          <p className="text-xs text-charcoal/60">Pedidos hoy</p>
          <p className="text-2xl font-medium mt-1">{pedidosHoy?.length ?? 0}</p>
        </div>
        <div className="bg-white border border-charcoal/10 rounded-xl p-4">
          <p className="text-xs text-charcoal/60">Ingresos hoy</p>
          <p className="text-2xl font-medium mt-1">${ingresosHoy.toLocaleString("es-CO")}</p>
        </div>
      </div>
      <a href="/admin/productos" className="text-sm text-bottle font-medium underline">
        Ir a gestionar productos →
      </a>
    </div>
  );
}
