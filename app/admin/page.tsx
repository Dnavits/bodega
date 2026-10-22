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

  // 2. Cálculo completo de ingresos: Hoy, Esta semana, Semana pasada, Este mes, Mes anterior y Totales
  const { data: todosLosPedidos } = await supabase
    .from("pedidos")
    .select("total, created_at, estado");

  const ahora = new Date();

  // Inicio de Hoy (00:00)
  const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  // Inicio de Esta Semana (Lunes)
  const diaSemana = ahora.getDay(); // 0 domingo, 1 lunes...
  const diffLunes = (diaSemana + 6) % 7; // días transcurridos desde lunes
  const inicioEstaSemana = new Date(inicioHoy);
  inicioEstaSemana.setDate(inicioEstaSemana.getDate() - diffLunes);

  // Semana Pasada (Lunes a Domingo anterior)
  const inicioSemanaPasada = new Date(inicioEstaSemana);
  inicioSemanaPasada.setDate(inicioSemanaPasada.getDate() - 7);
  const finSemanaPasada = new Date(inicioEstaSemana);

  // Este Mes
  const inicioEsteMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  // Mes Anterior
  const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
  const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  // Acumuladores
  let ingresosHoy = 0;
  let pedidosHoyCount = 0;

  let ingresosEstaSemana = 0;
  let pedidosEstaSemanaCount = 0;

  let ingresosSemanaPasada = 0;
  let pedidosSemanaPasadaCount = 0;

  let ingresosEsteMes = 0;
  let pedidosEsteMesCount = 0;

  let ingresosMesAnterior = 0;
  let pedidosMesAnteriorCount = 0;

  let ingresosTotales = 0;
  let pedidosTotalesCount = 0;

  for (const p of todosLosPedidos || []) {
    const total = p.total || 0;
    const fecha = new Date(p.created_at);

    ingresosTotales += total;
    pedidosTotalesCount++;

    if (fecha >= inicioHoy) {
      ingresosHoy += total;
      pedidosHoyCount++;
    }

    if (fecha >= inicioEstaSemana) {
      ingresosEstaSemana += total;
      pedidosEstaSemanaCount++;
    } else if (fecha >= inicioSemanaPasada && fecha < finSemanaPasada) {
      ingresosSemanaPasada += total;
      pedidosSemanaPasadaCount++;
    }

    if (fecha >= inicioEsteMes) {
      ingresosEsteMes += total;
      pedidosEsteMesCount++;
    } else if (fecha >= inicioMesAnterior && fecha < finMesAnterior) {
      ingresosMesAnterior += total;
      pedidosMesAnteriorCount++;
    }
  }

  const { data: pedidosRecientes } = await supabase
    .from("pedidos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

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

      {/* Sección de Ganancias e Ingresos Multitemporal */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-eyebrow text-ink-muted">
            Reporte Financiero de Ventas
          </span>
          <span className="text-[11px] text-ink-faint">
            Historial acumulado
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Hoy */}
          <div className="bg-canvas border border-hairline rounded-card p-4 shadow-card">
            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-eyebrow">
              Hoy
            </span>
            <p className="font-inter font-black text-xl text-emerald mt-1">
              ${ingresosHoy.toLocaleString("es-CO")}
            </p>
            <span className="text-[10px] text-ink-faint mt-0.5 block">
              {pedidosHoyCount} pedido(s)
            </span>
          </div>

          {/* 2. Esta Semana */}
          <div className="bg-canvas border border-hairline rounded-card p-4 shadow-card">
            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-eyebrow">
              Esta Semana
            </span>
            <p className="font-inter font-black text-xl text-ink mt-1">
              ${ingresosEstaSemana.toLocaleString("es-CO")}
            </p>
            <span className="text-[10px] text-ink-faint mt-0.5 block">
              {pedidosEstaSemanaCount} pedido(s)
            </span>
          </div>

          {/* 3. Semana Pasada */}
          <div className="bg-canvas border border-hairline rounded-card p-4 shadow-card">
            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-eyebrow">
              Semana Pasada
            </span>
            <p className="font-inter font-black text-xl text-ink mt-1">
              ${ingresosSemanaPasada.toLocaleString("es-CO")}
            </p>
            <span className="text-[10px] text-ink-faint mt-0.5 block">
              {pedidosSemanaPasadaCount} pedido(s)
            </span>
          </div>

          {/* 4. Este Mes */}
          <div className="bg-canvas border border-hairline rounded-card p-4 shadow-card">
            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-eyebrow">
              Este Mes
            </span>
            <p className="font-inter font-black text-xl text-ink mt-1">
              ${ingresosEsteMes.toLocaleString("es-CO")}
            </p>
            <span className="text-[10px] text-ink-faint mt-0.5 block">
              {pedidosEsteMesCount} pedido(s)
            </span>
          </div>

          {/* 5. Mes Anterior */}
          <div className="bg-canvas border border-hairline rounded-card p-4 shadow-card">
            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-eyebrow">
              Mes Anterior
            </span>
            <p className="font-inter font-black text-xl text-ink mt-1">
              ${ingresosMesAnterior.toLocaleString("es-CO")}
            </p>
            <span className="text-[10px] text-ink-faint mt-0.5 block">
              {pedidosMesAnteriorCount} pedido(s)
            </span>
          </div>

          {/* 6. Total Histórico */}
          <div className="bg-canvas border border-hairline rounded-card p-4 shadow-card bg-emerald/5 border-emerald/20">
            <span className="text-[10px] uppercase font-bold text-emerald tracking-eyebrow">
              Total Histórico
            </span>
            <p className="font-inter font-black text-xl text-emerald mt-1">
              ${ingresosTotales.toLocaleString("es-CO")}
            </p>
            <span className="text-[10px] text-emerald/80 mt-0.5 block font-semibold">
              {pedidosTotalesCount} pedidos tot.
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas Operativas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Métrica 1: Catálogo Activo */}
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

        {/* Métrica 2: Productos Bajo Stock */}
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

        {/* Métrica 3: Modo en Tiempo Real */}
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
