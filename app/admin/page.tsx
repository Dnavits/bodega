import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PackageIcon, TrendingUpIcon, PlusIcon, BeerIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

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
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-light">
            Panel de Control · Bodega Dnavits
          </span>
          <h1 className="font-roboto font-black text-2xl sm:text-3xl text-foam mt-1">
            Resumen General de la Bodega
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-vault-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-md"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Gestionar Productos</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas Estilo Shopify */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Métrica 1: Ingresos de Hoy */}
        <div className="bg-vault-900 border border-vault-800 rounded-2xl p-5">
          <span className="text-xs uppercase font-bold text-vault-100/50 tracking-wider">
            Ingresos de Hoy
          </span>
          <p className="font-roboto font-black text-2xl text-emerald-light mt-1.5">
            ${ingresosHoy.toLocaleString("es-CO")}
          </p>
          <span className="text-[11px] text-vault-100/40 mt-1 block">
            {pedidosHoy?.length || 0} pedidos generados hoy
          </span>
        </div>

        {/* Métrica 2: Productos Activos */}
        <div className="bg-vault-900 border border-vault-800 rounded-2xl p-5">
          <span className="text-xs uppercase font-bold text-vault-100/50 tracking-wider">
            Catálogo Activo
          </span>
          <p className="font-roboto font-black text-2xl text-foam mt-1.5">
            {productosActivos ?? 0} / {totalProductos ?? 0}
          </p>
          <span className="text-[11px] text-emerald-light mt-1 block font-medium">
            Visibles en la tienda
          </span>
        </div>

        {/* Métrica 3: Productos Bajo Stock */}
        <div className="bg-vault-900 border border-vault-800 rounded-2xl p-5">
          <span className="text-xs uppercase font-bold text-vault-100/50 tracking-wider">
            Alerta de Inventario
          </span>
          <p className="font-roboto font-black text-2xl text-amber-light mt-1.5">
            {bajoStock?.length ?? 0}
          </p>
          <span className="text-[11px] text-vault-100/40 mt-1 block">
            Bebidas con 10 o menos unidades
          </span>
        </div>

        {/* Métrica 4: Modo en Tiempo Real */}
        <div className="bg-vault-900 border border-vault-800 rounded-2xl p-5">
          <span className="text-xs uppercase font-bold text-vault-100/50 tracking-wider">
            Sincronización
          </span>
          <p className="font-roboto font-black text-lg text-ice mt-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-ice animate-pulse" />
            <span>En Vivo</span>
          </p>
          <span className="text-[11px] text-vault-100/40 mt-1 block">
            Cualquier cambio se refleja al instante
          </span>
        </div>
      </div>

      {/* Tablas de Pedidos e Inventario Crítico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pedidos Recientes (8 cols) */}
        <div className="lg:col-span-8 bg-vault-900 border border-vault-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-roboto font-bold text-base text-foam">
              Últimos Pedidos Recibidos
            </h3>
            <span className="text-xs text-vault-100/40 font-medium">
              Actualizado al momento
            </span>
          </div>

          {!pedidosRecientes || pedidosRecientes.length === 0 ? (
            <div className="text-center py-12 text-vault-100/40 text-xs">
              Aún no hay pedidos registrados en la base de datos.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-vault-800 text-vault-100/50 uppercase tracking-wider">
                    <th className="pb-3">Cliente</th>
                    <th className="pb-3">Dirección</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vault-800/60">
                  {pedidosRecientes.map((p) => (
                    <tr key={p.id} className="hover:bg-vault-850/50 transition-colors">
                      <td className="py-3 font-semibold text-foam">
                        <p>{p.nombre}</p>
                        <p className="text-[10px] text-vault-100/40 font-normal">{p.telefono}</p>
                      </td>
                      <td className="py-3 text-vault-100/70">
                        {p.direccion}, {p.barrio}
                      </td>
                      <td className="py-3">
                        <span className="inline-block bg-amber/15 text-amber-light font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
                          {p.estado || "pendiente"}
                        </span>
                      </td>
                      <td className="py-3 text-right font-roboto font-bold text-foam">
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
        <div className="lg:col-span-4 bg-vault-900 border border-vault-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-roboto font-bold text-base text-foam mb-1">
              Inventario Crítico
            </h3>
            <p className="text-xs text-vault-100/50 mb-5">
              Productos que necesitan reposición urgente.
            </p>

            {!bajoStock || bajoStock.length === 0 ? (
              <div className="text-center py-10 text-emerald-light text-xs font-semibold">
                ✓ Todo el inventario está con stock óptimo.
              </div>
            ) : (
              <div className="space-y-3">
                {bajoStock.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-vault-950 border border-vault-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-foam">{prod.nombre}</p>
                      <span className="text-[10px] text-vault-100/40 uppercase">{prod.categoria}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/30">
                      {prod.stock} disp.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/admin/productos"
            className="mt-6 block text-center w-full py-2.5 bg-vault-850 hover:bg-vault-800 border border-vault-700 text-xs font-bold text-foam rounded-xl transition-colors"
          >
            Ver Todo el Inventario →
          </Link>
        </div>
      </div>
    </div>
  );
}
