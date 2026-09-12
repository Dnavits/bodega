"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PlusIcon, TrashIcon, BeerIcon } from "@/components/Icons";
import { CATEGORIAS_PRODUCTOS, CATEGORIA_LABELS } from "@/lib/constants";

type Producto = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precio_comparacion?: number;
  stock: number;
  categoria: string;
  imagenes: string[];
  activo: boolean;
};

const formVacio = {
  nombre: "",
  descripcion: "",
  precio: "",
  precio_comparacion: "",
  stock: "",
  categoria: "gaseosas",
  imagen_url: "",
  activo: true,
};

export default function AdminProductos() {
  const supabase = createClient();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState(formVacio);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("todas");

  async function cargar() {
    const { data } = await supabase
      .from("productos")
      .select("*")
      .order("created_at", { ascending: false });
    setProductos(data || []);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function guardarProducto(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!form.nombre.trim() || !form.precio || form.stock === "") {
      setError("Completa el nombre, precio y cantidad en stock.");
      return;
    }

    setCargando(true);

    const payload: any = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio: parseInt(form.precio, 10),
      precio_comparacion: form.precio_comparacion ? parseInt(form.precio_comparacion, 10) : null,
      stock: parseInt(form.stock, 10),
      categoria: form.categoria.toLowerCase(),
      imagenes: form.imagen_url.trim() ? [form.imagen_url.trim()] : [],
      activo: form.activo,
    };

    try {
      if (editandoId) {
        let { error: updateError } = await supabase
          .from("productos")
          .update(payload)
          .eq("id", editandoId);

        // Fallback si la columna 'descripcion' o 'precio_comparacion' aún no existe en el schema de Supabase
        if (updateError && updateError.message.includes("schema cache")) {
          const fallbackPayload = { ...payload };
          delete fallbackPayload.descripcion;
          delete fallbackPayload.precio_comparacion;
          const { error: retryError } = await supabase
            .from("productos")
            .update(fallbackPayload)
            .eq("id", editandoId);

          if (retryError) throw retryError;
          setMensaje("✓ Producto actualizado (Nota: para guardar descripción, ejecuta el SQL de actualización de columnas en Supabase).");
        } else if (updateError) {
          throw updateError;
        } else {
          setMensaje("✓ Producto actualizado con éxito. Ya es visible en la tienda.");
        }
      } else {
        let { error: insertError } = await supabase
          .from("productos")
          .insert([payload]);

        // Fallback si la columna 'descripcion' o 'precio_comparacion' aún no existe en el schema de Supabase
        if (insertError && insertError.message.includes("schema cache")) {
          const fallbackPayload = { ...payload };
          delete fallbackPayload.descripcion;
          delete fallbackPayload.precio_comparacion;
          const { error: retryError } = await supabase
            .from("productos")
            .insert([fallbackPayload]);

          if (retryError) throw retryError;
          setMensaje("✓ Producto creado con éxito (Nota: para guardar descripción, ejecuta el SQL de actualización de columnas en Supabase).");
        } else if (insertError) {
          throw insertError;
        } else {
          setMensaje("✓ Producto creado y publicado con éxito en la tienda.");
        }
      }

      setForm(formVacio);
      setEditandoId(null);
      await cargar();
    } catch (err: any) {
      setError(err.message || "Error al guardar el producto en la base de datos.");
    } finally {
      setCargando(false);
    }
  }

  async function eliminarProducto(id: string, nombre: string) {
    if (!confirm(`¿Seguro que deseas eliminar "${nombre}" del catálogo?`)) return;

    const { error: delError } = await supabase
      .from("productos")
      .delete()
      .eq("id", id);

    if (delError) {
      alert("Error al eliminar: " + delError.message);
    } else {
      cargar();
    }
  }

  function comenzarEdicion(p: Producto) {
    setEditandoId(p.id);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precio: p.precio.toString(),
      precio_comparacion: p.precio_comparacion ? p.precio_comparacion.toString() : "",
      stock: p.stock.toString(),
      categoria: p.categoria?.toLowerCase() || "gaseosas",
      imagen_url: p.imagenes?.[0] || "",
      activo: p.activo ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const productosFiltrados = productos.filter((p) =>
    filtroCategoria === "todas" ? true : (p.categoria || "").toLowerCase() === filtroCategoria.toLowerCase()
  );

  return (
    <div className="space-y-10">
      {/* Título y Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-eyebrow text-accent">
          Inventario &amp; Catálogo
        </span>
        <h1 className="font-inter font-black text-2xl sm:text-3xl text-ink mt-1">
          Gestión de Bebidas y Stock
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          Cualquier cambio de precio, stock o fotos que hagas aquí se actualiza de inmediato en la tienda pública.
        </p>
      </div>

      {/* Formulario para Crear / Editar Producto */}
      <form
        onSubmit={guardarProducto}
        className="bg-canvas border border-hairline rounded-card p-6 sm:p-8 shadow-card space-y-6"
      >
        <div className="flex items-center justify-between border-b border-divider pb-4">
          <h2 className="font-inter font-bold text-base text-ink flex items-center gap-2">
            <PlusIcon className="w-4 h-4 text-accent" />
            <span>{editandoId ? "Editar Producto Seleccionado" : "Agregar Nueva Bebida / Producto"}</span>
          </h2>
          {editandoId && (
            <button
              type="button"
              onClick={() => {
                setEditandoId(null);
                setForm(formVacio);
              }}
              className="text-xs text-ink-muted hover:text-ink underline"
            >
              Cancelar Edición
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Nombre de la Bebida *
            </label>
            <input
              type="text"
              placeholder="Ej: Cerveza Corona Extra 355ml (Botella)"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Categoría *
            </label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none transition-colors"
            >
              {CATEGORIAS_PRODUCTOS.map((c) => (
                <option key={c} value={c}>
                  {CATEGORIA_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          {/* URL de la Imagen */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              URL de la Fotografía (Unsplash o enlace directo)
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={form.imagen_url}
              onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Precio de Venta ($ COP) *
            </label>
            <input
              type="number"
              placeholder="Ej: 8500"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
            />
          </div>

          {/* Precio de Comparación */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Precio Antes (Tachado en tienda)
            </label>
            <input
              type="number"
              placeholder="Ej: 10000"
              value={form.precio_comparacion}
              onChange={(e) => setForm({ ...form, precio_comparacion: e.target.value })}
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Unidades en Inventario (Stock) *
            </label>
            <input
              type="number"
              placeholder="Ej: 48"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
            />
          </div>

          {/* Estado Activo */}
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="activo"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              className="w-4 h-4 rounded border-hairline text-accent focus:ring-accent"
            />
            <label htmlFor="activo" className="text-xs font-semibold text-ink">
              Publicado en tienda (Visible para los clientes)
            </label>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Descripción Breve
            </label>
            <textarea
              rows={2}
              placeholder="Presentación retornable o no retornable, grado de alcohol, temperatura de entrega..."
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-danger-soft border border-danger/20 rounded-card text-danger text-xs font-medium">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="p-3 bg-emerald-soft border border-emerald/20 rounded-card text-emerald text-xs font-medium">
            {mensaje}
          </div>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full sm:w-auto px-8 py-3 bg-ink hover:bg-ink-light text-white font-bold rounded-btn text-sm shadow-portrait transition-all active:scale-95 disabled:opacity-60"
        >
          {cargando ? "Guardando..." : editandoId ? "Actualizar Producto" : "Guardar y Publicar en Tienda"}
        </button>
      </form>

      {/* Tabla de Productos Existentes */}
      <div className="bg-canvas border border-hairline rounded-card p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-inter font-bold text-base text-ink">
              Productos en Inventario ({productosFiltrados.length})
            </h2>
            <p className="text-xs text-ink-muted">
              Control total de precios, disponibilidad y stock en tiempo real.
            </p>
          </div>

          {/* Filtro por Categoría */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted">Categoría:</span>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="bg-canvas border border-hairline rounded-btn px-3 py-1.5 text-xs text-ink outline-none"
            >
              <option value="todas">Todas</option>
              {CATEGORIAS_PRODUCTOS.map((c) => (
                <option key={c} value={c}>{CATEGORIA_LABELS[c]}</option>
              ))}
            </select>
          </div>
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-ink-faint text-xs">
            No hay productos registrados en esta categoría.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-divider text-ink-faint uppercase tracking-eyebrow">
                  <th className="pb-3 font-semibold">Producto</th>
                  <th className="pb-3 font-semibold">Categoría</th>
                  <th className="pb-3 font-semibold">Precio</th>
                  <th className="pb-3 font-semibold">Stock</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {productosFiltrados.map((p) => (
                  <tr key={p.id} className="hover:bg-surface transition-colors">
                    <td className="py-3.5 font-bold text-ink flex items-center gap-3">
                      {p.imagenes?.[0] ? (
                        <img
                          src={p.imagenes[0]}
                          alt={p.nombre}
                          className="w-9 h-9 rounded-lg object-contain bg-surface border border-hairline p-0.5"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-surface border border-hairline flex items-center justify-center text-ink-faint">
                          <BeerIcon className="w-4 h-4" />
                        </div>
                      )}
                      <span>{p.nombre}</span>
                    </td>
                    <td className="py-3.5 text-ink-muted capitalize">
                      {CATEGORIA_LABELS[(p.categoria || "").toLowerCase() as keyof typeof CATEGORIA_LABELS] || p.categoria}
                    </td>
                    <td className="py-3.5 font-inter font-bold text-accent">
                      ${p.precio.toLocaleString("es-CO")}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-tag font-bold text-[10px] uppercase tracking-eyebrow ${
                        p.stock <= 5
                          ? "bg-danger-soft text-danger border border-danger/20"
                          : p.stock <= 15
                          ? "bg-warning-soft text-warning border border-warning/20"
                          : "bg-emerald-soft text-emerald border border-emerald/20"
                      }`}>
                        {p.stock} un.
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-tag text-[10px] font-bold uppercase tracking-eyebrow ${
                        p.activo ? "bg-emerald-soft text-emerald" : "bg-surface text-ink-faint border border-hairline"
                      }`}>
                        {p.activo ? "Activo" : "Oculto"}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => comenzarEdicion(p)}
                        className="px-3 py-1.5 bg-canvas hover:bg-surface text-ink font-semibold rounded-btn border border-hairline shadow-subtle transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarProducto(p.id, p.nombre)}
                        className="px-3 py-1.5 bg-danger-soft hover:bg-danger/20 text-danger font-semibold rounded-btn border border-danger/20 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
