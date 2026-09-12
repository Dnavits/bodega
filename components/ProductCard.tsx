"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { PlusIcon } from "@/components/Icons";
import { CATEGORIA_LABELS } from "@/lib/constants";

export type ProductoBodega = {
  id:                string;
  nombre:            string;
  descripcion?:      string;
  precio:            number;
  precio_comparacion?: number;
  imagenes:          string[];
  categoria:         string;
  stock:             number;
  activo?:           boolean;
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80";

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return (
    <span className="bg-danger-soft text-danger text-[10px] font-bold uppercase tracking-eyebrow px-2 py-0.5 rounded-tag">
      Agotado
    </span>
  );
  if (stock <= 10) return (
    <span className="bg-warning-soft text-warning text-[10px] font-bold uppercase tracking-eyebrow px-2 py-0.5 rounded-tag">
      ¡Últimas {stock}!
    </span>
  );
  return (
    <span className="bg-mint text-emerald text-[10px] font-bold uppercase tracking-eyebrow px-2 py-0.5 rounded-tag">
      Disponible
    </span>
  );
}

export function ProductCard({ producto }: { producto: ProductoBodega }) {
  const { addItem } = useCart();
  const [imgSrc, setImgSrc] = useState(producto.imagenes?.[0] || DEFAULT_IMAGE);
  const [added, setAdded]   = useState(false);

  const agotado = (producto.stock ?? 0) <= 0;

  const catLabel =
    CATEGORIA_LABELS[producto.categoria.toLowerCase() as keyof typeof CATEGORIA_LABELS] ||
    producto.categoria;

  function handleAdd() {
    if (agotado) return;
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: imgSrc,
      stock: producto.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="group bg-canvas rounded-card border border-hairline shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col min-w-0 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square bg-surface overflow-hidden flex items-center justify-center p-4">
        <img
          src={imgSrc}
          alt={producto.nombre}
          onError={() => setImgSrc(DEFAULT_IMAGE)}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category */}
        <div className="absolute top-3 left-3">
          <span className="bg-canvas/90 backdrop-blur-sm text-ink-muted text-[10px] font-semibold uppercase tracking-eyebrow px-2 py-0.5 rounded-tag border border-hairline">
            {catLabel}
          </span>
        </div>
        {/* Stock */}
        <div className="absolute top-3 right-3">
          <StockBadge stock={producto.stock} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-inter font-semibold text-sm text-ink group-hover:text-accent transition-colors line-clamp-1">
            {producto.nombre}
          </h3>
          {producto.descripcion && (
            <p className="mt-0.5 text-xs text-ink-faint line-clamp-2 leading-relaxed">
              {producto.descripcion}
            </p>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-4 pt-3 border-t border-divider flex items-center justify-between gap-2">
          <div>
            <p className="font-inter font-black text-base text-ink leading-none">
              ${producto.precio.toLocaleString("es-CO")}
            </p>
            {producto.precio_comparacion && producto.precio_comparacion > producto.precio && (
              <p className="text-xs text-ink-faint line-through mt-0.5">
                ${producto.precio_comparacion.toLocaleString("es-CO")}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={agotado}
            className={`inline-flex items-center justify-center gap-1 px-3 py-2 rounded-btn text-xs font-bold transition-all active:scale-95 disabled:cursor-not-allowed ${
              agotado
                ? "bg-surface text-ink-faint border border-hairline text-[11px]"
                : added
                ? "bg-emerald text-white"
                : "bg-ink hover:bg-ink-light text-white"
            }`}
          >
            {agotado
              ? "Stock no disponible por ahora"
              : added
              ? "¡Listo!"
              : <><PlusIcon className="w-3 h-3" /> Agregar</>}
          </button>
        </div>
      </div>
    </article>
  );
}
