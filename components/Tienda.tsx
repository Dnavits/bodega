"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard, ProductoBodega } from "./ProductCard";
import { BeerIcon } from "@/components/Icons";
import { CATEGORIA_LABELS } from "@/lib/constants";

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
  const [productos,       setProductos]       = useState<ProductoBodega[]>([]);
  const [cargando,        setCargando]        = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todos");
  const [busqueda,        setBusqueda]        = useState("");

  useEffect(() => {
    let activo = true;
    const supabase = createClient();

    async function cargar() {
      try {
        // Usar select("*") para que nunca falle por columnas ausentes
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .order("created_at", { ascending: false });

        if (!activo) return;

        if (!error && data && data.length > 0) {
          // Filtrar activos (o aquellos sin campo activo explícito en false)
          const visibles = data.filter((p: any) => p.activo !== false);
          setProductos(visibles.length > 0 ? visibles : data);
        } else {
          // Si no hay productos o hay error, usar muestras para que la tienda nunca quede vacía
          setProductos(SAMPLE_PRODUCTS);
        }
      } catch (err) {
        console.error("Error al cargar productos de tienda:", err);
        if (activo) setProductos(SAMPLE_PRODUCTS);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();

    // Timeout de seguridad de 2.5s para asegurar que nunca se quede en esqueleto
    const timer = setTimeout(() => {
      if (activo) setCargando(false);
    }, 2500);

    // Suscripción Realtime para actualizar en vivo cuando el admin guarde cualquier producto
    const channel = supabase
      .channel("realtime_tienda_productos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "productos" },
        () => {
          cargar();
        }
      )
      .subscribe();

    return () => {
      activo = false;
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  // Categorías dinámicas: ÚNICAMENTE se muestran las que tienen productos registrados
  const categoriasDisponibles = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => {
      const cat = p.categoria?.trim().toLowerCase();
      if (cat) {
        set.add(cat);
      }
    });
    return Array.from(set);
  }, [productos]);

  // Si la categoría seleccionada ya no tiene productos, volver a "todos"
  useEffect(() => {
    if (
      categoriaActiva !== "todos" &&
      !categoriasDisponibles.includes(categoriaActiva.toLowerCase())
    ) {
      setCategoriaActiva("todos");
    }
  }, [categoriasDisponibles, categoriaActiva]);

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const catMatch =
        categoriaActiva === "todos" ||
        (p.categoria || "").toLowerCase() === categoriaActiva.toLowerCase();
      const searchMatch =
        !busqueda ||
        (p.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.categoria || "").toLowerCase().includes(busqueda.toLowerCase());
      return catMatch && searchMatch;
    });
  }, [productos, categoriaActiva, busqueda]);

  function getLabel(cat: string) {
    return CATEGORIA_LABELS[cat as keyof typeof CATEGORIA_LABELS] ||
      (cat.charAt(0).toUpperCase() + cat.slice(1));
  }

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
              Agrega al carrito o pide directamente por WhatsApp.
            </p>
          </div>

          {/* Search */}
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar gaseosa, cerveza, agua..."
            className="w-full md:w-64 border border-hairline focus:border-accent rounded-input bg-canvas px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none shadow-subtle transition-colors"
          />
        </div>

        {/* Dynamic Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-1 scrollbar-none mb-8">
          <button
            onClick={() => setCategoriaActiva("todos")}
            className={`px-4 py-2 rounded-btn text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
              categoriaActiva === "todos"
                ? "bg-ink text-white shadow-portrait"
                : "bg-canvas border border-hairline text-ink-muted hover:text-ink hover:bg-surface shadow-subtle"
            }`}
          >
            Todos ({productos.length})
          </button>
          {categoriasDisponibles.map((cat) => {
            const countInCat = productos.filter(
              (p) => (p.categoria || "").toLowerCase() === cat.toLowerCase()
            ).length;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={`px-4 py-2 rounded-btn text-xs font-semibold whitespace-nowrap transition-all active:scale-95 capitalize ${
                  categoriaActiva === cat
                    ? "bg-ink text-white shadow-portrait"
                    : "bg-canvas border border-hairline text-ink-muted hover:text-ink hover:bg-surface shadow-subtle"
                }`}
              >
                {getLabel(cat)} {countInCat > 0 ? `(${countInCat})` : ""}
              </button>
            );
          })}
        </div>

        {/* Product grid */}
        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-card h-80 animate-shimmer border border-hairline bg-surface" />
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20 border border-hairline rounded-card bg-surface">
            <BeerIcon className="w-10 h-10 text-ink-faint mx-auto mb-3" />
            <p className="text-ink-muted font-semibold text-sm">Sin productos con ese filtro</p>
            <button
              onClick={() => { setCategoriaActiva("todos"); setBusqueda(""); }}
              className="mt-3 text-xs text-accent hover:underline font-semibold"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {productosFiltrados.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
