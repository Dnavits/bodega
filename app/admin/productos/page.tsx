"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PlusIcon, TrashIcon, BeerIcon } from "@/components/Icons";

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

const CATEGORIAS = ["Gaseosas", "Cervezas", "Aguas", "Licores", "Otros"];

const formVacio = {
  nombre: "",
  descripcion: "",
  precio: "",
  precio_comparacion: "",
  stock: "",
  categoria: "Gaseosas",
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
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");

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
      setError("Completa nombre, precio y cantidad en stock.");
      return;
    }

    setCargando(true);

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio: parseInt(form.precio, 10),
      precio_comparacion: form.precio_comparacion ? parseInt(form.precio_comparacion, 10) : null,
      stock: parseInt(form.stock, 10),
      categoria: form.categoria,
      imagenes: form.imagen_url.trim() ? [form.imagen_url.trim()] : [],
      activo: form.activo,
    };

    try {
      if (editandoId) {
        const { error: updateError } = await supabase
          .from("productos")
          .update(payload)
          .eq("id", editandoId);

        if (updateError) throw updateError;
        setMensaje("✓ Producto actualizado con éxito. Ya es visible en la tienda.");
      } else {
        const { error: insertError } = await supabase
          .from("productos")
          .insert([payload]);

        if (insertError) throw insertError;
        setMensaje("✓ Producto creado y publicado con éxito en la tienda.");
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
      categoria: p.categoria,
      imagen_url: p.imagenes?.[0] || "",
      activo: p.activo ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const productosFiltrados = productos.filter((p) =>
    filtroCategoria === "Todas" ? true : p.categoria === filtroCategoria
  );

  return (
    <div className="space-y-10">
      {/* Título y Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-light">
            Inventario & Catálogo
          </span>
          <h1 className="font-roboto font-black text-2xl sm:text-3xl text-foam mt-1">
            Gestión de Bebidas y Stock
          </h1>
          <p className="text-xs text-vault-100/60 mt-1">
            Cualquier cambio de precio, stock o fotos que hagas aquí se actualiza de inmediato en la tienda pública.
          </p>
        </div>
      </div>

      {/* Formulario Shopify-style para Crear / Editar Producto */}
      <form
        onSubmit={guardarProducto}
        className="bg-vault-900 border border-vault-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
      >
        <div className="flex items-center justify-between border-b border-vault-800 pb-4">
          <h2 className="font-roboto font-bold text-lg text-foam flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-amber" />
            <span>{editandoId ? "Editar Producto Seleccionado" : "Agregar Nueva Bebida / Producto"}</span>
          </h2>
          {editandoId && (
            <button
              type="button"
              onClick={() => {
                setEditandoId(null);
                setForm(formVacio);
              }}
              className="text-xs text-vault-100/60 hover:text-foam underline"
            >
              Cancelar Edición
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-vault-100/70 mb-1.5">
              Nombre de la Bebida *
            </label>
            <input
              type="text"
              placeholder="Ej: Cerveza Corona Extra 355ml (Botella)"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-vault-950 border border-vault-800 focus:border-amber rounded-xl px-4 py-3 text-sm text-foam placeholder-vault-100/30 outline-none transition-colors"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-vault-100/70 mb-1.5">
              Categoría *
            </label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full bg-vault-950 border border-vault-800 focus:border-amber rounded-xl px-4 py-3 text-sm text-foam outline-none transition-colors"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c} className="bg-vault-950 text-foam">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* URL de la Imagen */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-vault-100/70 mb-1.5">
              URL de la Fotografía (Unsplash o enlace directo)
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={form.imagen_url}
              onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
              className="w-full bg-vault-950 border border-vault-800 focus:border-amber rounded-xl px-4 py-3 text-sm text-foam placeholder-vault-100/30 outline-none transition-colors"
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-vault-100/70 mb-1.5">
              Precio de Venta ($ COP) *
            </label>
            <input
              type="number"
              placeholder="Ej: 8500"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              className="w-full bg-vault-950 border border-vault-800 focus:border-amber rounded-xl px-4 py-3 text-sm text-foam placeholder-vault-100/30 outline-none transition-colors"
            />
          </div>

          {/* Precio de Comparación */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-vault-100/70 mb-1.5">
              Precio Antes (Tachado en tienda)
            </label>
            <input
              type="number"
              placeholder="Ej: 10000"
              value={form.precio_comparacion}
              onChange={(e) => setForm({ ...form, precio_comparacion: e.target.value })}
              className="w-full bg-vault-950 border border-vault-800 focus:border-amber rounded-xl px-4 py-3 text-sm text-foam placeholder-vault-100/30 outline-none transition-colors"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-vault-100/70 mb-1.5">
              Unidades en Inventario (Stock) *
            </label>
            <input
              type="number"
              placeholder="Ej: 48"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full bg-vault-950 border border-vault-800 focus:border-amber rounded-xl px-4 py-3 text-sm text-foam placeholder-vault-100/30 outline-none transition-colors"
            />
          </div>

          {/* Estado Activo */}
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="activo"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              className="w-5 h-5 rounded bg-vault-950 border-vault-800 text-amber focus:ring-amber"
            />
            <label htmlFor="activo" className="text-xs font-semibold text-foam">
              Publicado en tienda (Visible para los clientes)
            </label>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-vault-100/70 mb-1.5">
              Descripción Breve
            </label>
            <textarea
              rows={2}
              placeholder="Presentación retornable o no retornable, grado de alcohol, temperatura de entrega..."
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full bg-vault-950 border border-vault-800 focus:border-amber rounded-xl px-4 py-2.5 text-sm text-foam placeholder-vault-100/30 outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium">
            {mensaje}
          </div>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full sm:w-auto px-8 py-3.5 bg-amber hover:bg-amber-dark text-vault-950 font-black rounded-xl text-sm transition-all active:scale-95 disabled:opacity-60 shadow-lg"
        >
          {cargando ? "Guardando..." : editandoId ? "Actualizar Producto" : "Guardar y Publicar en Tienda"}
        </button>
      </form>

      {/* Tabla de Productos Existentes */}
      <div className="bg-vault-900 border border-vault-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-roboto font-bold text-lg text-foam">
              Productos en Inventario ({productosFiltrados.length})
            </h2>
            <p className="text-xs text-vault-100/50">
              Control total de precios, disponibilidad y stock en tiempo real.
            </p>
          </div>

          {/* Filtro por Categoría */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-vault-100/50">Categoría:</span>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="bg-vault-950 border border-vault-800 rounded-xl px-3 py-1.5 text-xs text-foam outline-none"
            >
              <option value="Todas">Todas</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-vault-100/40 text-xs">
            No hay productos registrados en esta categoría.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-vault-800 text-vault-100/50 uppercase tracking-wider">
                  <th className="pb-3">Producto</th>
                  <th className="pb-3">Categoría</th>
                  <th className="pb-3">Precio</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vault-800/60">
                {productosFiltrados.map((p) => (
                  <tr key={p.id} className="hover:bg-vault-850/40 transition-colors">
                    <td className="py-3.5 font-bold text-foam flex items-center gap-3">
                      {p.imagenes?.[0] ? (
                        <img
                          src={p.imagenes[0]}
                          alt={p.nombre}
                          className="w-9 h-9 rounded-lg object-contain bg-vault-950 border border-vault-800 p-0.5"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-vault-950 border border-vault-800 flex items-center justify-center text-vault-100/40">
                          <BeerIcon className="w-4 h-4" />
                        </div>
                      )}
                      <span>{p.nombre}</span>
                    </td>
                    <td className="py-3.5 text-vault-100/70">{p.categoria}</td>
                    <td className="py-3.5 font-roboto font-bold text-amber-light">
                      ${p.precio.toLocaleString("es-CO")}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        p.stock <= 5
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : p.stock <= 15
                          ? "bg-amber/20 text-amber-light border border-amber/30"
                          : "bg-emerald/20 text-emerald-light border border-emerald/30"
                      }`}>
                        {p.stock} unidades
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        p.activo ? "bg-emerald/10 text-emerald-light" : "bg-vault-800 text-vault-100/40"
                      }`}>
                        {p.activo ? "Activo" : "Oculto"}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => comenzarEdicion(p)}
                        className="px-3 py-1.5 bg-vault-850 hover:bg-vault-800 text-foam font-bold rounded-lg border border-vault-700 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarProducto(p.id, p.nombre)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-lg border border-red-500/30 transition-colors"
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
