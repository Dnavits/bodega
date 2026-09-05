"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { CartIcon, PlusIcon } from "@/components/Icons";

export type ProductoBodega = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precio_comparacion?: number;
  imagenes: string[];
  categoria: string;
  stock: number;
  activo?: boolean;
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80";

export function ProductCard({ producto }: { producto: ProductoBodega }) {
  const { addItem } = useCart();
  const [imgSrc, setImgSrc] = useState(producto.imagenes?.[0] || DEFAULT_IMAGE);
  const [agregadoAnim, setAgregadoAnim] = useState(false);

  const agotado = (producto.stock ?? 0) <= 0;

  function handleAgregar() {
    if (agotado) return;
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: imgSrc,
    });
    setAgregadoAnim(true);
    setTimeout(() => setAgregadoAnim(false), 1200);
  }

  return (
    <div className="group relative bg-vault-900 border border-vault-800 hover:border-amber/40 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      {/* Imagen del Producto */}
      <div className="relative aspect-square w-full bg-vault-950 overflow-hidden flex items-center justify-center p-4">
        <img
          src={imgSrc}
          alt={producto.nombre}
          onError={() => setImgSrc(DEFAULT_IMAGE)}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />

        {/* Categoría Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-vault-950/90 backdrop-blur-md text-vault-100/70 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-vault-800">
            {producto.categoria}
          </span>
        </div>

        {/* Stock / Agotado */}
        <div className="absolute top-3 right-3">
          {agotado ? (
            <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Agotado
            </span>
          ) : (
            <span className="bg-emerald/10 text-emerald-light border border-emerald/20 text-[10px] font-semibold px-2 py-0.5 rounded-md">
              {producto.stock} en stock
            </span>
          )}
        </div>
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="p-5 flex flex-col flex-1 justify-between bg-vault-900">
        <div>
          <h3 className="font-roboto font-bold text-base text-foam group-hover:text-amber-light transition-colors line-clamp-1">
            {producto.nombre}
          </h3>
          {producto.descripcion && (
            <p className="mt-1 text-xs text-vault-100/60 line-clamp-2 leading-relaxed">
              {producto.descripcion}
            </p>
          )}
        </div>

        {/* Precios y Botón de Agregar */}
        <div className="mt-5 pt-4 border-t border-vault-800 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-vault-100/50 block font-semibold">
              Precio Unitario
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-roboto font-black text-lg text-foam">
                ${producto.precio.toLocaleString("es-CO")}
              </span>
              {producto.precio_comparacion && producto.precio_comparacion > producto.precio && (
                <span className="text-xs text-vault-100/40 line-through">
                  ${producto.precio_comparacion.toLocaleString("es-CO")}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={agotado}
            onClick={handleAgregar}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              agregadoAnim
                ? "bg-emerald text-white"
                : "bg-amber hover:bg-amber-dark text-vault-950 shadow-md"
            }`}
          >
            {agregadoAnim ? (
              <span>¡Agregado!</span>
            ) : (
              <>
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
