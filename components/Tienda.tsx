"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard, ProductoBodega } from "./ProductCard";
import { BeerIcon } from "@/components/Icons";
import { CATEGORIAS_PRODUCTOS, CATEGORIA_LABELS } from "@/lib/constants";

const SAMPLE_PRODUCTS: ProductoBodega[] = [
  {
    id: "sample-1", nombre: "Coca-Cola 3 Litros",
    descripcion: "Botella familiar retornable bien helada.",
    precio: 9500, precio_comparacion: 10500,
    categoria: "gaseosas", stock: 48,
    imagenes: ["https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: "sample-2", nombre: "Six-Pack Águila Original (Lata)",
    descripcion: "6 latas de 330ml frías.",
    precio: 16000, precio_comparacion: 18000,
    categoria: "cervezas", stock: 35,
    imagenes: ["https://images.unsplash.com/photo-1608270192864-162e245a499d?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: "sample-3", nombre: "Agua Cristal Garrafa 5L",
    descripcion: "Agua purificada sin gas.",
    precio: 6500, categoria: "aguas", stock: 20,
    imagenes: ["https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: "sample-4", nombre: "Postobón Manzana 1.5L",
    descripcion: "El clásico colombiano.",
    precio: 5200, categoria: "gaseosas", stock: 50,
    imagenes: ["https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: "sample-5", nombre: "Six-Pack Corona Extra 355ml",
    descripcion: "Cerveza tipo lager importada.",
    precio: 28000, precio_comparacion: 32000,
    categoria: "cervezas", stock: 18,
    imagenes: ["https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: "sample-6", nombre: "Aguardiente Antioqueño 750ml",
    descripcion: "Sin azúcar, tapa azul.",
    precio: 45000, categoria: "licores", stock: 12,
    imagenes: ["https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=800&q=80"],
  },
];

export function Tienda() {
  // Create client ONCE outside state to prevent subscription leaks
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [productos,       setProductos]       = useState<ProductoBodega[]>([]);
  const [cargando,        setCargando]        = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todos");
  const [busqueda,        setBusqueda]        = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        const { data, error } = await supabase
          .from("productos")
          .select("id,nombre,descripcion,precio,precio_comparacion,imagenes,categoria,stock,activo")
          .eq("activo", true)
          .order("categoria");

        setProductos(!error && data && data.length > 0 ? data : SAMPLE_PRODUCTS);
      } catch {
        setProductos(SAMPLE_PRODUCTS);
      } finally {
        setCargando(false);
      }
    }

    cargar();

    // Realtime subscription for live updates from admin
    const channel = supabase
      .channel("tienda_productos")
      .on("postgres_changes", { event: "*", schema: "public", table: "productos" }, () => cargar())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const catMatch = categoriaActiva === "todos" ||
        p.categoria.toLowerCase() === categoriaActiva.toLowerCase();
      const searchMatch = !busqueda ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busqueda.toLowerCase());
      return catMatch && searchMatch;
    });
  }, [productos, categoriaActiva, busqueda]);

  return (
    <section id="catalogo" className="py-16 sm:py-24 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-eyebrow text-accent mb-2">
              <BeerIcon className="w-3.5 h-3.5" />
              Inventario en Tiempo Real
            </div>
            <h2 className="font-inter font-black text-3xl sm:text-4xl text-ink tracking-heading">
              Catálogo de Bebidas
            </h2>
            <p className="mt-1.5 text-sm text-ink-muted max-w-md">
              Agrega al carrito o pide por WhatsApp.
            </p>
          </div>

          {/* Search */}
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar gaseosa, cerveza, agua..."
            className="w-full md:w-64 border border-hairline focus:border-accent rounded-input bg-canvas px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none shadow-subtle"
          />
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none mb-8">
          <button
            onClick={() => setCategoriaActiva("todos")}
            className={`px-4 py-2 rounded-btn text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
              categoriaActiva === "todos"
                ? "bg-ink text-white shadow-portrait"
                : "bg-canvas border border-hairline text-ink-muted hover:text-ink hover:bg-surface shadow-subtle"
            }`}
          >
            Todos
          </button>
          {CATEGORIAS_PRODUCTOS.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-4 py-2 rounded-btn text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                categoriaActiva === cat
                  ? "bg-ink text-white shadow-portrait"
                  : "bg-canvas border border-hairline text-ink-muted hover:text-ink hover:bg-surface shadow-subtle"
              }`}
            >
              {CATEGORIA_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {cargando ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-card h-80 animate-shimmer border border-hairline" />
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20 border border-hairline rounded-card bg-surface">
            <BeerIcon className="w-10 h-10 text-ink-faint mx-auto mb-3" />
            <p className="text-ink-muted font-semibold text-sm">Sin productos con ese filtro</p>
            <button
              onClick={() => { setCategoriaActiva("todos"); setBusqueda(""); }}
              className="mt-3 text-xs text-accent hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {productosFiltrados.map(p => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
