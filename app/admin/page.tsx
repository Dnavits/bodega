import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PackageIcon, TrendingUpIcon, PlusIcon, BeerIcon } from "@/components/Icons";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const config = await getSiteConfig();

  // 1. Contador de productos
  const { count: totalProductos } = await supabase
    .from("productos")
    .select("*", { count: "exact", head: true });

  const { count: productosActivos } = await supabase
    .from("productos")
    .select("*", { count: "exact", head: true })
    .eq("activo", true);

  // 2. Pedidos y ventas de hoy
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const { data: pedidosRecientes } = await supabase
    .from("pedidos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: pedidosHoy } = await supabase
    .from("pedidos")
    .select("total")
    .gte("created_at", hoy.toISOString());

  const ingresosHoy = (pedidosHoy || []).reduce((sum, p) => sum + (p.total || 0), 0);

  // 3. Productos con bajo stock (< 10 unidades)
  const { data: bajoStock } = await supabase
    .from("productos")
    .select("id, nombre, stock, categoria")
    .lte("stock", 10)
    .order("stock", { ascending: true })
    .limit(5);

  return (
    <div className="space-y-8">
      {/* Encabezado del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-eyebrow text-accent">
            Panel de Control · {config.nombre_bodega || "Bodega Dnavits"}
          </span>
          <h1 className="font-inter font-black text-2xl sm:text-3xl text-ink mt-1">
            Resumen General de la Bodega
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-2 bg-ink hover:bg-ink-light text-white font-bold px-4 py-2.5 rounded-btn text-xs shadow-portrait transition-all active:scale-95"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Gestionar Productos</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Métrica 1: Ingresos de Hoy */}
        <div className="bg-canvas border border-hairline rounded-card p-5 shadow-card">
          <span className="text-xs uppercase font-bold text-ink-muted tracking-eyebrow">
            Ingresos de Hoy
          </span>
          <p className="font-inter font-black text-2xl text-emerald mt-1.5">
            ${ingresosHoy.toLocaleString("es-CO")}
          </p>
          <span className="text-[11px] text-ink-faint mt-1 block">
            {pedidosHoy?.length || 0} pedidos hoy
          </span>
        </div>

        {/* Métrica 2: Productos Activos */}
        <div className="bg-canvas border border-hairline rounded-card p-5 shadow-card">
          <span className="text-xs uppercase font-bold text-ink-muted tracking-eyebrow">
            Catálogo Activo
          </span>
          <p className="font-inter font-black text-2xl text-ink mt-1.5">
            {productosActivos ?? 0} / {totalProductos ?? 0}
          </p>
          <span className="text-[11px] text-emerald mt-1 block font-semibold">
            Visibles en la tienda
          </span>
        </div>

        {/* Métrica 3: Productos Bajo Stock */}
        <div className="bg-canvas border border-hairline rounded-card p-5 shadow-card">
          <span className="text-xs uppercase font-bold text-ink-muted tracking-eyebrow">
            Alerta de Inventario
          </span>
          <p className="font-inter font-black text-2xl text-accent mt-1.5">
            {bajoStock?.length ?? 0}
          </p>
          <span className="text-[11px] text-ink-faint mt-1 block">
            Bebidas con 10 o menos unidades
          </span>
        </div>

        {/* Métrica 4: Modo en Tiempo Real */}
        <div className="bg-canvas border border-hairline rounded-card p-5 shadow-card">
          <span className="text-xs uppercase font-bold text-ink-muted tracking-eyebrow">
            Sincronización
          </span>
          <p className="font-inter font-black text-lg text-accent mt-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span>En Vivo</span>
          </p>
          <span className="text-[11px] text-ink-faint mt-1 block">
            Actualización inmediata
          </span>
        </div>
      </div>

      {/* Tablas de Pedidos e Inventario Crítico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pedidos Recientes (8 cols) */}
        <div className="lg:col-span-8 bg-canvas border border-hairline rounded-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-inter font-bold text-base text-ink">
              Últimos Pedidos Recibidos
            </h3>
            <span className="text-xs text-ink-faint font-medium">
              Actualizado al momento
            </span>
          </div>

          {!pedidosRecientes || pedidosRecientes.length === 0 ? (
            <div className="text-center py-12 text-ink-faint text-xs">
              Aún no hay pedidos registrados en la base de datos.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-divider text-ink-faint uppercase tracking-eyebrow">
                    <th className="pb-3 font-semibold">Cliente</th>
                    <th className="pb-3 font-semibold">Dirección</th>
                    <th className="pb-3 font-semibold">Estado</th>
                    <th className="pb-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {pedidosRecientes.map((p) => (
                    <tr key={p.id} className="hover:bg-surface transition-colors">
                      <td className="py-3 font-semibold text-ink">
                        <p>{p.nombre}</p>
                        <p className="text-[10px] text-ink-faint font-normal">{p.telefono}</p>
                      </td>
                      <td className="py-3 text-ink-muted">
                        {p.direccion}, {p.barrio}
                      </td>
                      <td className="py-3">
                        <span className="inline-block bg-sky text-accent font-bold px-2 py-0.5 rounded-tag text-[10px] uppercase tracking-eyebrow">
                          {p.estado || "pendiente"}
                        </span>
                      </td>
                      <td className="py-3 text-right font-inter font-bold text-ink">
                        ${(p.total || 0).toLocaleString("es-CO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inventario por Agotarse (4 cols) */}
        <div className="lg:col-span-4 bg-canvas border border-hairline rounded-card p-6 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="font-inter font-bold text-base text-ink mb-1">
              Inventario Crítico
            </h3>
            <p className="text-xs text-ink-muted mb-5">
              Productos con necesidad de reposición.
            </p>

            {!bajoStock || bajoStock.length === 0 ? (
              <div className="text-center py-10 text-emerald text-xs font-semibold">
                ✓ Todo el inventario está con stock óptimo.
              </div>
            ) : (
              <div className="space-y-3">
                {bajoStock.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-surface border border-hairline rounded-card flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-ink">{prod.nombre}</p>
                      <span className="text-[10px] text-ink-faint uppercase tracking-eyebrow">{prod.categoria}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-tag bg-danger-soft text-danger border border-danger/20">
                      {prod.stock} disp.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/admin/productos"
            className="mt-6 block text-center w-full py-2.5 bg-canvas hover:bg-surface border border-hairline text-xs font-bold text-ink rounded-btn shadow-subtle transition-all"
          >
            Ver Todo el Inventario →
          </Link>
        </div>
      </div>
    </div>
  );
}
