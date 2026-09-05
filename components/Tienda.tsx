"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard, ProductoBodega } from "./ProductCard";
import { BeerIcon } from "@/components/Icons";

const CATEGORIAS_BODEGA = [
  "Todos",
  "Gaseosas",
  "Aguas",
  "Cervezas",
  "Licores",
  "Otros"
];

// Productos de muestra premium en caso de que la tabla de Supabase esté vacía al inicio
const PRODUCTOS_MUESTRA: ProductoBodega[] = [
  {
    id: "coca-cola-3l",
    nombre: "Coca-Cola 3 Litros Original",
    descripcion: "Botella Mega familiar retornable o no retornable bien helada.",
    precio: 9500,
    precio_comparacion: 10500,
    categoria: "Gaseosas",
    stock: 48,
    imagenes: ["https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80"]
  },
  {
    id: "cerveza-aguila-lata-sixpack",
    nombre: "Six-Pack Cerveza Águila Original (Lata)",
    descripcion: "6 latas de 330ml heladas listas para destapar.",
    precio: 16000,
    precio_comparacion: 18000,
    categoria: "Cervezas",
    stock: 35,
    imagenes: ["https://images.unsplash.com/photo-1608270192864-162e245a499d?auto=format&fit=crop&w=800&q=80"]
  },
  {
    id: "agua-cristal-bidon-5l",
    nombre: "Agua Cristal Garrafa 5 Litros",
    descripcion: "Agua purificada sin gas en presentación económica.",
    precio: 6500,
    categoria: "Aguas",
    stock: 20,
    imagenes: ["https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80"]
  },
  {
    id: "postobon-manzana-15l",
    nombre: "Postobón Manzana 1.5 Litros",
    descripcion: "El clásico sabor colombiano bien frío para el almuerzo.",
    precio: 5200,
    categoria: "Gaseosas",
    stock: 50,
    imagenes: ["https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=800&q=80"]
  },
  {
    id: "cerveza-corona-sixpack",
    nombre: "Six-Pack Cerveza Corona Extra 355ml",
    descripcion: "Cerveza tipo lager en botella de vidrio bien helada.",
    precio: 28000,
    precio_comparacion: 32000,
    categoria: "Cervezas",
    stock: 18,
    imagenes: ["https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80"]
  },
  {
    id: "antioqueno-tapa-azul",
    nombre: "Aguardiente Antioqueño 750ml (Tapa Azul)",
    descripcion: "Sin azúcar, botella clásica estampillada para Medellín.",
    precio: 45000,
    categoria: "Licores",
    stock: 12,
    imagenes: ["https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=800&q=80"]
  }
];

export function Tienda() {
  const [productos, setProductos] = useState<ProductoBodega[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function cargarProductos() {
      try {
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .eq("activo", true)
          .order("categoria");

        if (error || !data || data.length === 0) {
          // Si la base de datos está vacía, usar el catálogo de respaldo para que la página nunca esté rota
          setProductos(PRODUCTOS_MUESTRA);
        } else {
          setProductos(data);
        }
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setProductos(PRODUCTOS_MUESTRA);
      } finally {
        setCargando(false);
      }
    }

    cargarProductos();

    // Suscribirse a cambios en tiempo real en la tabla de productos (Supabase Realtime)
    // Así, cuando el admin cambia algo en el dashboard, la página se actualiza al instante sin recargar!
    const channel = supabase
      .channel("productos_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "productos" },
        () => {
          cargarProductos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Filtrado de productos por categoría y búsqueda
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideCat =
        categoriaActiva === "Todos" ||
        p.categoria.toLowerCase() === categoriaActiva.toLowerCase();
      const coincideBusqueda =
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busqueda.toLowerCase());
      return coincideCat && coincideBusqueda;
    });
  }, [productos, categoriaActiva, busqueda]);

  return (
    <section id="catalogo" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-light mb-2">
            <BeerIcon className="w-4 h-4 text-amber" />
            <span>Inventario en Tiempo Real</span>
          </div>
          <h2 className="font-roboto font-black text-3xl sm:text-5xl text-foam tracking-tight">
            Catálogo de Bebidas
          </h2>
          <p className="mt-2 text-sm text-vault-100/60 max-w-xl">
            Todo lo que necesitas para tu reunión, negocio o antojo. Pídelo al carrito o a través de WhatsApp.
          </p>
        </div>

        {/* Buscador de Bebidas */}
        <div className="w-full md:w-72">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar gaseosa, cerveza, agua..."
            className="w-full bg-vault-900 border border-vault-800 focus:border-amber rounded-xl px-4 py-2.5 text-sm text-foam placeholder-vault-100/30 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Pestañas de Categoría tipo Shopify */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10">
        {CATEGORIAS_BODEGA.map((cat) => {
          const isSelected = categoriaActiva === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaActiva(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                isSelected
                  ? "bg-amber text-vault-950 shadow-lg"
                  : "bg-vault-900 text-vault-100/70 hover:text-foam hover:bg-vault-850 border border-vault-800"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid de Productos */}
      {cargando ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-vault-900 border border-vault-800 rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center py-20 bg-vault-900 border border-vault-800 rounded-3xl p-8">
          <BeerIcon className="w-12 h-12 text-vault-100/20 mx-auto mb-3" />
          <p className="text-vault-100/70 font-semibold text-base">
            No encontramos productos con ese filtro.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategoriaActiva("Todos");
              setBusqueda("");
            }}
            className="mt-4 text-xs font-bold text-amber hover:underline"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {productosFiltrados.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </section>
  );
}
