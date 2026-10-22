"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  CreditCardIcon,
  WhatsappIcon,
  CashIcon,
  TrashIcon,
  DownloadIcon,
} from "@/components/Icons";

type PedidoItem = {
  id: string;
  producto_id?: string;
  nombre_producto?: string;
  imagen_url?: string;
  cantidad: number;
  precio_unitario: number;
  // enriquecido en cliente
  _nombre?: string;
  _imagen?: string;
  _stock?: number;
};

type Pedido = {
  id: string;
  numero_orden?: number;
  numero_orden_seq?: number;
  nombre: string;
  telefono: string;
  email?: string;
  direccion: string;
  detalle_direccion?: string;
  barrio: string;
  ciudad: string;
  total: number;
  estado: "pendiente" | "en_proceso" | "entregado";
  metodo_pago?: string;
  mp_payment_id?: string;
  transaction_id?: string;
  notas?: string;
  created_at: string;
  pedido_items?: PedidoItem[];
};

const ESTADOS = [
  {
    value: "pendiente",
    label: "Pendiente",
    color: "bg-warning-soft text-warning border-warning/20",
    dot: "bg-warning",
    icon: ClockIcon,
  },
  {
    value: "en_proceso",
    label: "En Proceso",
    color: "bg-sky text-accent border-accent/20",
    dot: "bg-accent",
    icon: TruckIcon,
  },
  {
    value: "entregado",
    label: "Entregado",
    color: "bg-mint text-emerald border-emerald/20",
    dot: "bg-emerald",
    icon: CheckCircleIcon,
  },
];

function EstadoBadge({ estado }: { estado: string }) {
  const e = ESTADOS.find((x) => x.value === estado) || ESTADOS[0];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-eyebrow px-2.5 py-1 rounded-tag border ${e.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${e.dot}`} />
      {e.label}
    </span>
  );
}

function MetodoBadge({ metodo }: { metodo?: string }) {
  if (!metodo) return null;
  if (metodo === "mercadopago")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent bg-sky px-2 py-0.5 rounded-tag">
        <CreditCardIcon className="w-3 h-3" /> MercadoPago
      </span>
    );
  if (metodo.includes("whatsapp"))
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald bg-mint px-2 py-0.5 rounded-tag">
        <WhatsappIcon className="w-3 h-3" /> WhatsApp
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ink-muted bg-surface border border-hairline px-2 py-0.5 rounded-tag">
      <CashIcon className="w-3 h-3" /> {metodo}
    </span>
  );
}

function descargarExcel(pedidos: Pedido[], nombreArchivo: string) {
  const filas = pedidos.map((p, idx) => ({
    "Orden": `#${pedidos.length - idx}`,
    "Fecha": new Date(p.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    "Estado": p.estado.replace("_", " ").toUpperCase(),
    "Cliente": p.nombre,
    "Teléfono": p.telefono,
    "Email": p.email || "",
    "Dirección": `${p.direccion}${p.detalle_direccion ? `, ${p.detalle_direccion}` : ""} · ${p.barrio}${p.ciudad ? `, ${p.ciudad}` : ""}`,
    "Total ($)": p.total,
    "Método de Pago": p.metodo_pago || "",
    "ID Transacción": p.transaction_id || "",
    "Notas": p.notas || "",
  }));

  const ws = XLSX.utils.json_to_sheet(filas);
  const wb = XLSX.utils.book_new();

  // Ancho de columnas
  ws["!cols"] = [
    { wch: 10 }, { wch: 18 }, { wch: 12 }, { wch: 22 }, { wch: 14 },
    { wch: 22 }, { wch: 40 }, { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
}

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [realtimeOk, setRealtimeOk] = useState(false);
  const [actualizando, setActualizando] = useState<string | null>(null);
  const [borrando, setBorrando] = useState<string | null>(null);
  const [confirmBorrar, setConfirmBorrar] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [mensajeTipo, setMensajeTipo] = useState<"ok" | "warn">("ok");

  function mostrarMensaje(texto: string, tipo: "ok" | "warn" = "ok") {
    setMensaje(texto);
    setMensajeTipo(tipo);
    setTimeout(() => setMensaje(""), 3000);
  }

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/pedidos", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setPedidos(json.pedidos || []);
      }
    } catch (e) {
      console.error("Error cargando pedidos:", e);
    } finally {
      setCargando(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  }, [cargar]);

  useEffect(() => {
    cargar();
    const supabase = createClient();
    const channel = supabase
      .channel("pedidos_admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, () => cargar())
      .subscribe((status) => {
        setRealtimeOk(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cargar]);

  async function cambiarEstado(pedidoId: string, nuevoEstado: string) {
    setActualizando(pedidoId);
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        setPedidos((prev) =>
          prev.map((p) => (p.id === pedidoId ? { ...p, estado: nuevoEstado as Pedido["estado"] } : p))
        );
        mostrarMensaje("Estado actualizado correctamente.");
      }
    } finally {
      setActualizando(null);
    }
  }

  async function borrarPedido(pedidoId: string) {
    setBorrando(pedidoId);
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, { method: "DELETE" });
      if (res.ok) {
        setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
        mostrarMensaje("Pedido eliminado.");
      }
    } finally {
      setBorrando(null);
      setConfirmBorrar(null);
    }
  }

  // ── Filtros de Excel por mes ──
  function pedidosMesVigente() {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return pedidos.filter((p) => new Date(p.created_at) >= inicio);
  }

  function pedidosMesAnterior() {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return pedidos.filter((p) => {
      const d = new Date(p.created_at);
      return d >= inicio && d < fin;
    });
  }

  function nombreMesVigente() {
    return new Date().toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  }

  function nombreMesAnterior() {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  }

  const pedidosFiltrados = pedidos.filter((p) =>
    filtroEstado === "todos" ? true : p.estado === filtroEstado
  );

  const conteos = {
    pendiente: pedidos.filter((p) => p.estado === "pendiente").length,
    en_proceso: pedidos.filter((p) => p.estado === "en_proceso").length,
    entregado: pedidos.filter((p) => p.estado === "entregado").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-eyebrow text-accent">
            Gestión de Pedidos
          </span>
          <h1 className="font-inter font-black text-2xl sm:text-3xl text-ink mt-1">
            Pedidos Recibidos
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Indicador En vivo */}
          <span
            title={realtimeOk ? "Actualización en tiempo real activa" : "Actualizando cada 30 segundos"}
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-eyebrow px-2.5 py-1.5 rounded-tag border transition-all ${
              realtimeOk
                ? "bg-mint border-emerald/20 text-emerald"
                : "bg-surface border-hairline text-ink-muted"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${realtimeOk ? "bg-emerald animate-pulse" : "bg-ink-faint"}`} />
            {realtimeOk ? "En vivo" : "30 s"}
          </span>
          {/* Descargar mes vigente */}
          <button
            onClick={() => {
              const data = pedidosMesVigente();
              if (data.length === 0) { mostrarMensaje(`Sin pedidos en ${nombreMesVigente()}.`, "warn"); return; }
              descargarExcel(data, `pedidos-${nombreMesVigente()}`);
            }}
            title={`Descargar pedidos de ${nombreMesVigente()}`}
            className="inline-flex items-center gap-1.5 bg-canvas border border-hairline hover:bg-surface text-ink text-xs font-bold px-3.5 py-2.5 rounded-btn shadow-subtle transition-all active:scale-95"
          >
            <DownloadIcon className="w-3.5 h-3.5 text-emerald" />
            Mes vigente
          </button>
          {/* Descargar mes anterior */}
          <button
            onClick={() => {
              const data = pedidosMesAnterior();
              if (data.length === 0) { mostrarMensaje(`Sin pedidos en ${nombreMesAnterior()}.`, "warn"); return; }
              descargarExcel(data, `pedidos-${nombreMesAnterior()}`);
            }}
            title={`Descargar pedidos de ${nombreMesAnterior()}`}
            className="inline-flex items-center gap-1.5 bg-canvas border border-hairline hover:bg-surface text-ink text-xs font-bold px-3.5 py-2.5 rounded-btn shadow-subtle transition-all active:scale-95"
          >
            <DownloadIcon className="w-3.5 h-3.5 text-ink-muted" />
            Mes anterior
          </button>
          {/* Actualizar */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 bg-canvas border border-hairline hover:bg-surface text-ink text-xs font-bold px-4 py-2.5 rounded-btn shadow-subtle transition-all active:scale-95 disabled:opacity-60"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 transition-transform ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div className={`text-xs font-semibold px-4 py-3 rounded-card flex items-center gap-2 border ${
          mensajeTipo === "warn"
            ? "bg-warning-soft border-warning/20 text-warning"
            : "bg-mint border-emerald/20 text-emerald"
        }`}>
          {mensajeTipo === "warn"
            ? <AlertCircleIcon className="w-4 h-4" />
            : <CheckCircleIcon className="w-4 h-4" />}
          {mensaje}
        </div>
      )}

      {/* Métricas rápidas */}
      <div className="grid grid-cols-3 gap-3">
        {ESTADOS.map((e) => (
          <button
            key={e.value}
            onClick={() => setFiltroEstado(filtroEstado === e.value ? "todos" : e.value)}
            className={`p-4 rounded-card border text-left transition-all ${
              filtroEstado === e.value
                ? `${e.color} border-current`
                : "bg-canvas border-hairline hover:bg-surface"
            }`}
          >
            <p className="font-inter font-black text-2xl text-ink">
              {conteos[e.value as keyof typeof conteos]}
            </p>
            <p className="text-[11px] font-semibold text-ink-muted mt-0.5">{e.label}</p>
          </button>
        ))}
      </div>

      {/* Filtro de estado */}
      <div className="flex items-center gap-2 flex-wrap">
        {["todos", ...ESTADOS.map((e) => e.value)].map((f) => (
          <button
            key={f}
            onClick={() => setFiltroEstado(f)}
            className={`px-3.5 py-1.5 rounded-btn text-xs font-semibold transition-all ${
              filtroEstado === f
                ? "bg-ink text-white shadow-subtle"
                : "bg-canvas border border-hairline text-ink-muted hover:text-ink"
            }`}
          >
            {f === "todos" ? `Todos (${pedidos.length})` : ESTADOS.find((e) => e.value === f)?.label}
            {f !== "todos" && ` (${conteos[f as keyof typeof conteos]})`}
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      {cargando ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-card animate-shimmer bg-surface border border-hairline" />
          ))}
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-hairline rounded-card text-ink-faint text-xs">
          <AlertCircleIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
          No hay pedidos en este estado.
        </div>
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map((p) => {
            // Número correlativo de pedido #1, #2, #3... ordenado por fecha de creación ascendente
            const indiceOrden = [...pedidos]
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .findIndex((x) => x.id === p.id);
            const numPedido = indiceOrden !== -1 ? indiceOrden + 1 : 1;

            return (
            <div
              key={p.id}
              className="bg-canvas border border-hairline rounded-card p-5 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Info principal */}
                <div className="flex-1 space-y-2">
                  {/* Encabezado */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-ink-muted font-mono">
                      #{numPedido}
                    </span>
                    <EstadoBadge estado={p.estado} />
                    <MetodoBadge metodo={p.metodo_pago} />
                    {p.transaction_id && (
                      <span className="text-[9px] font-mono text-ink-faint bg-surface border border-hairline px-2 py-0.5 rounded-tag">
                        {p.transaction_id}
                      </span>
                    )}
                  </div>

                  {/* Cliente */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    <div>
                      <span className="text-ink-faint">Cliente: </span>
                      <strong className="text-ink">{p.nombre}</strong>
                    </div>
                    <div>
                      <span className="text-ink-faint">Tel: </span>
                      <a href={`tel:${p.telefono}`} className="text-accent font-semibold hover:underline">
                        {p.telefono}
                      </a>
                    </div>
                    {p.email && (
                      <div>
                        <span className="text-ink-faint">Email: </span>
                        <span className="text-ink">{p.email}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-ink-faint">Fecha: </span>
                      <span className="text-ink">
                        {new Date(p.created_at).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="text-xs bg-surface border border-hairline rounded-xl px-3 py-2">
                    <span className="text-ink-faint">Entregar en: </span>
                    <strong className="text-ink">
                      {p.direccion}
                      {p.detalle_direccion ? `, ${p.detalle_direccion}` : ""}
                      {" · "}{p.barrio}
                      {p.ciudad ? `, ${p.ciudad}` : ""}
                    </strong>
                  </div>

                  {/* Productos del pedido */}
                  {p.pedido_items && p.pedido_items.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-eyebrow text-ink-faint">
                        Productos ({p.pedido_items.length})
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {p.pedido_items.map((item) => {
                            const nombre = item._nombre || "Sin nombre";
                            const imagen = item._imagen;
                            const stock = item._stock;
                            return (
                          <div
                            key={item.id}
                            className="flex items-center gap-2.5 bg-surface border border-hairline rounded-xl px-2.5 py-2"
                          >
                            {/* Imagen */}
                            <div className="w-10 h-10 rounded-lg bg-canvas border border-hairline overflow-hidden shrink-0">
                              {imagen ? (
                                <img
                                  src={imagen}
                                  alt={nombre}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-ink-faint">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-ink truncate">{nombre}</p>
                              <p className="text-[10px] text-ink-muted">x{item.cantidad} comprado(s)</p>
                            </div>
                            {/* Stock restante */}
                            <div className="text-right shrink-0">
                              {stock !== undefined && stock !== null ? (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-tag border ${
                                  stock <= 3
                                    ? "bg-warning-soft border-warning/20 text-warning"
                                    : "bg-mint border-emerald/20 text-emerald"
                                }`}>
                                  {stock} en stock
                                </span>
                              ) : null}
                            </div>
                          </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {p.notas && (
                    <div className="text-xs text-ink-muted italic">
                      Nota: {p.notas}
                    </div>
                  )}
                </div>

                {/* Panel derecho: Total + cambiar estado + borrar */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <p className="font-inter font-black text-xl text-ink">
                    ${p.total.toLocaleString("es-CO")}
                  </p>

                  {/* Selector de estado */}
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] text-ink-faint uppercase tracking-eyebrow">
                      Cambiar estado
                    </span>
                    <div className="flex gap-1.5">
                      {ESTADOS.map((e) => {
                        const isActive = p.estado === e.value;
                        return (
                          <button
                            key={e.value}
                            onClick={() => !isActive && cambiarEstado(p.id, e.value)}
                            disabled={isActive || actualizando === p.id}
                            className={`px-2.5 py-1.5 rounded-btn text-[10px] font-bold transition-all border ${
                              isActive
                                ? `${e.color} cursor-default`
                                : "bg-canvas border-hairline text-ink-muted hover:bg-surface disabled:opacity-50"
                            }`}
                          >
                            {actualizando === p.id && !isActive ? "..." : e.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Borrar pedido */}
                  {confirmBorrar === p.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-danger font-semibold">¿Confirmar?</span>
                      <button
                        onClick={() => borrarPedido(p.id)}
                        disabled={borrando === p.id}
                        className="px-2.5 py-1 rounded-btn text-[10px] font-bold bg-danger text-white hover:bg-danger/80 transition-all disabled:opacity-50"
                      >
                        {borrando === p.id ? "..." : "Sí, borrar"}
                      </button>
                      <button
                        onClick={() => setConfirmBorrar(null)}
                        className="px-2.5 py-1 rounded-btn text-[10px] font-bold bg-canvas border border-hairline text-ink-muted hover:bg-surface transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmBorrar(p.id)}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-faint hover:text-danger transition-colors px-2 py-1 rounded-btn hover:bg-danger-soft"
                    >
                      <TrashIcon className="w-3 h-3" />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
