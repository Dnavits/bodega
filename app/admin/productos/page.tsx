"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PlusIcon, TrashIcon, BeerIcon, ExcelIcon } from "@/components/Icons";
import { CATEGORIAS_PRODUCTOS, CATEGORIA_LABELS } from "@/lib/constants";
import { processImageFile, IMAGE_SPECS } from "@/lib/image-utils";
import * as XLSX from "xlsx";

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
  nuevaCategoria: "",
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
  const [esNuevaCategoria, setEsNuevaCategoria] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

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

  // Categorías dinámicas disponibles calculadas de la base de datos
  const listaCategorias = useMemo(() => {
    const set = new Set<string>();
    CATEGORIAS_PRODUCTOS.forEach((c) => set.add(c.toLowerCase()));
    productos.forEach((p) => {
      if (p.categoria && p.categoria.trim()) {
        set.add(p.categoria.trim().toLowerCase());
      }
    });
    return Array.from(set);
  }, [productos]);

  // Manejo de subida de archivo para imagen de producto
  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const processed = await processImageFile(file, IMAGE_SPECS.producto);
      setForm((prev) => ({ ...prev, imagen_url: processed }));
      setMensaje("✓ Fotografía procesada con éxito a 800x800 px.");
    } catch (err: any) {
      setError(err.message || "Error al procesar la imagen.");
    }
  }

  // ── Descargar Plantilla Excel ──
  function descargarPlantillaExcel() {
    const datosEjemplo = [
      {
        "Nombre del Producto": "Postobón Manzana 1.5L",
        "Categoría": "Gaseosas",
        "Precio": 5200,
        "Precio Antes": 5800,
        "Stock": 50,
        "Descripción": "Bebida gaseosa sabor a manzana presentación familiar",
      },
      {
        "Nombre del Producto": "Cerveza Corona Extra 355ml",
        "Categoría": "Cervezas",
        "Precio": 28000,
        "Precio Antes": 32000,
        "Stock": 24,
        "Descripción": "Six-pack botella retornable bien fría",
      },
      {
        "Nombre del Producto": "Agua Cristal Garrafa 5L",
        "Categoría": "Aguas",
        "Precio": 6500,
        "Precio Antes": "",
        "Stock": 30,
        "Descripción": "Agua purificada sin gas garrafa",
      },
      {
        "Nombre del Producto": "Aguardiente Antioqueño 750ml",
        "Categoría": "Licores",
        "Precio": 45000,
        "Precio Antes": 48000,
        "Stock": 15,
        "Descripción": "Tapa azul sin azúcar tradicional",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(datosEjemplo);
    worksheet["!cols"] = [
      { wch: 32 }, // Nombre
      { wch: 16 }, // Categoría
      { wch: 12 }, // Precio
      { wch: 14 }, // Precio Antes
      { wch: 10 }, // Stock
      { wch: 45 }, // Descripción
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla_Productos");
    XLSX.writeFile(workbook, "Plantilla_Productos_Bodega.xlsx");
  }

  // ── Cargar Productos desde Excel ──
  async function handleImportarExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setMensaje("");
    setCargando(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (!rows || rows.length === 0) {
        throw new Error("El archivo Excel seleccionado no contiene filas con datos.");
      }

      const nuevosProductos: any[] = [];
      for (const r of rows) {
        const nombre = (
          r["Nombre del Producto"] ||
          r["Nombre"] ||
          r["nombre"] ||
          r["Producto"] ||
          ""
        ).toString().trim();

        const categoria = (
          r["Categoría"] ||
          r["Categoria"] ||
          r["categoria"] ||
          "otros"
        ).toString().trim().toLowerCase();

        const precioRaw = r["Precio"] || r["precio"] || r["Precio de Venta"];
        const precio = parseInt(precioRaw, 10);

        const precioCompRaw =
          r["Precio Antes"] ||
          r["precio_antes"] ||
          r["Precio Comparación"] ||
          r["precio_comparacion"];
        const precio_comparacion = precioCompRaw ? parseInt(precioCompRaw, 10) : null;

        const stockRaw = r["Stock"] || r["stock"] || r["Inventario"] || 0;
        const stock = parseInt(stockRaw, 10);

        const descripcion = (
          r["Descripción"] ||
          r["Descripcion"] ||
          r["descripcion"] ||
          ""
        ).toString().trim() || null;

        if (!nombre || isNaN(precio) || precio <= 0) continue;

        nuevosProductos.push({
          nombre,
          categoria: categoria || "otros",
          precio,
          precio_comparacion: isNaN(precio_comparacion as number) ? null : precio_comparacion,
          stock: isNaN(stock) ? 0 : stock,
          descripcion,
          imagenes: [],
          activo: true,
        });
      }

      if (nuevosProductos.length === 0) {
        throw new Error(
          "No se encontraron productos con formato válido (deben tener al menos Nombre y Precio mayor a 0)."
        );
      }

      // Insertar en Supabase
      let { error: insertError } = await supabase
        .from("productos")
        .insert(nuevosProductos);

      // Fallback si la columna 'descripcion' o 'precio_comparacion' falta en Supabase
      if (insertError && insertError.message.includes("schema cache")) {
        const fallback = nuevosProductos.map((p) => {
          const { descripcion, precio_comparacion, ...resto } = p;
          return resto;
        });
        const { error: retryError } = await supabase
          .from("productos")
          .insert(fallback);

        if (retryError) throw retryError;
      } else if (insertError) {
        throw insertError;
      }

      setMensaje(
        `✓ ¡Se cargaron ${nuevosProductos.length} productos con éxito desde Excel! Puedes añadirles imágenes después editando cada uno.`
      );
      await cargar();
    } catch (err: any) {
      setError("Error al importar Excel: " + (err.message || "Archivo no compatible"));
    } finally {
      setCargando(false);
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  }

  async function guardarProducto(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!form.nombre.trim() || !form.precio || form.stock === "") {
      setError("Completa el nombre, precio y cantidad en stock.");
      return;
    }

    const categoriaFinal = (
      esNuevaCategoria && form.nuevaCategoria.trim()
        ? form.nuevaCategoria.trim()
        : form.categoria
    ).toLowerCase();

    if (!categoriaFinal) {
      setError("Selecciona o escribe una categoría para el producto.");
      return;
    }

    setCargando(true);

    const payload: any = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio: parseInt(form.precio, 10),
      precio_comparacion: form.precio_comparacion ? parseInt(form.precio_comparacion, 10) : null,
      stock: parseInt(form.stock, 10),
      categoria: categoriaFinal,
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
          setMensaje("✓ Producto actualizado con éxito en la tienda.");
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
          setMensaje("✓ Producto creado y publicado con éxito en la tienda.");
        } else if (insertError) {
          throw insertError;
        } else {
          setMensaje("✓ Producto creado y publicado con éxito en la tienda.");
        }
      }

      setForm(formVacio);
      setEsNuevaCategoria(false);
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
    setEsNuevaCategoria(false);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precio: p.precio.toString(),
      precio_comparacion: p.precio_comparacion ? p.precio_comparacion.toString() : "",
      stock: p.stock.toString(),
      categoria: p.categoria?.toLowerCase() || "gaseosas",
      nuevaCategoria: "",
      imagen_url: p.imagenes?.[0] || "",
      activo: p.activo ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const productosFiltrados = productos.filter((p) =>
    filtroCategoria === "todas" ? true : (p.categoria || "").toLowerCase() === filtroCategoria.toLowerCase()
  );

  function getCatLabel(c: string) {
    return CATEGORIA_LABELS[c as keyof typeof CATEGORIA_LABELS] ||
      (c.charAt(0).toUpperCase() + c.slice(1));
  }

  return (
    <div className="space-y-10">
      {/* Título y Header con Toolbar de Excel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-eyebrow text-accent">
            Inventario &amp; Catálogo
          </span>
          <h1 className="font-inter font-black text-2xl sm:text-3xl text-ink mt-1">
            Gestión de Bebidas y Stock
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Cualquier cambio de precio, stock o fotos que hagas aquí se actualiza de inmediato en la tienda pública en vivo.
          </p>
        </div>

        {/* Botones de Plantilla e Importación Excel */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={descargarPlantillaExcel}
            className="inline-flex items-center gap-2.5 bg-canvas hover:bg-surface text-ink border border-hairline px-4 py-2.5 rounded-btn text-xs font-semibold shadow-subtle transition-all active:scale-95"
            title="Descargar archivo Excel con formato listo para rellenar"
          >
            <ExcelIcon className="w-5 h-5 shrink-0" />
            <span>Descargar Plantilla Excel</span>
          </button>

          <button
            type="button"
            onClick={() => excelInputRef.current?.click()}
            className="inline-flex items-center gap-2.5 bg-ink hover:bg-ink-light text-white px-4 py-2 rounded-btn shadow-portrait transition-all active:scale-95 text-left"
            title="Importar productos masivamente desde tu Excel completado"
          >
            <ExcelIcon className="w-5 h-5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight">Cargar Productos</span>
              <span className="text-[10px] text-white/70 font-normal leading-tight">
                Desde la plantilla excel
              </span>
            </div>
          </button>
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleImportarExcel}
            className="hidden"
          />
        </div>
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
                setEsNuevaCategoria(false);
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
              Nombre de la Bebida / Producto *
            </label>
            <input
              type="text"
              placeholder="Ej: Cerveza Corona Extra 355ml (Botella)"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
            />
          </div>

          {/* Categoría Dinámica */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Categoría *
            </label>
            {!esNuevaCategoria ? (
              <div className="space-y-1.5">
                <select
                  value={form.categoria}
                  onChange={(e) => {
                    if (e.target.value === "__NUEVA__") {
                      setEsNuevaCategoria(true);
                    } else {
                      setForm({ ...form, categoria: e.target.value });
                    }
                  }}
                  className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none capitalize transition-colors"
                >
                  {listaCategorias.map((c) => (
                    <option key={c} value={c}>
                      {getCatLabel(c)}
                    </option>
                  ))}
                  <option value="__NUEVA__" className="font-bold text-accent">
                    + Agregar nueva categoría...
                  </option>
                </select>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre de la nueva categoría (Ej: Snacks, Vinos, Hielo)"
                  value={form.nuevaCategoria}
                  onChange={(e) => setForm({ ...form, nuevaCategoria: e.target.value })}
                  className="w-full bg-canvas border border-accent rounded-input px-4 py-2.5 text-sm text-ink outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setEsNuevaCategoria(false)}
                  className="px-3 py-2 text-xs text-ink-muted hover:text-ink border border-hairline rounded-btn shrink-0"
                >
                  Volver a lista
                </button>
              </div>
            )}
          </div>

          {/* Precio de Venta */}
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

          {/* SECCIÓN DE IMAGEN: SUBIR ARCHIVO O PEGAR URL */}
          <div className="md:col-span-2 p-4 bg-surface border border-hairline rounded-card space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-eyebrow text-ink">
                  Fotografía del Producto
                </label>
                <p className="text-[11px] text-accent font-semibold">
                  📐 Medidas recomendadas: {IMAGE_SPECS.producto.recommended}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-canvas border border-hairline hover:bg-surface text-ink text-xs font-bold px-3.5 py-2 rounded-btn shadow-subtle transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
              >
                📁 Seleccionar Archivo desde tu Equipo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="hidden"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="O pega el enlace URL de la foto (https://...)"
                value={form.imagen_url}
                onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
                className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-xs text-ink placeholder-ink-faint outline-none transition-colors"
              />
            </div>

            {form.imagen_url && (
              <div className="flex items-center gap-4 p-3 bg-canvas border border-hairline rounded-card">
                <img
                  src={form.imagen_url}
                  alt="Vista previa"
                  className="w-16 h-16 rounded-xl object-contain bg-surface border border-hairline p-1"
                />
                <div className="text-xs text-ink-muted">
                  <p className="font-semibold text-emerald">✓ Imagen cargada para este producto</p>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imagen_url: "" })}
                    className="text-[11px] text-danger hover:underline mt-0.5"
                  >
                    Quitar imagen
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1.5">
              Descripción Breve
            </label>
            <textarea
              rows={2}
              placeholder="Presentación retornable o no retornable, temperatura de entrega, pack de 6 unidades..."
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors resize-none"
            />
          </div>

          {/* Estado Activo */}
          <div className="flex items-center gap-3 pt-2">
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

          {/* Filtro por Categoría Dinámica */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted">Categoría:</span>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="bg-canvas border border-hairline rounded-btn px-3 py-1.5 text-xs text-ink outline-none capitalize"
            >
              <option value="todas">Todas</option>
              {listaCategorias.map((c) => (
                <option key={c} value={c}>{getCatLabel(c)}</option>
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
                      {getCatLabel(p.categoria || "otros")}
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
