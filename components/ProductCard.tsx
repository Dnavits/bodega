"use client";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagenes: string[];
  categoria: string;
  stock: number;
};

export function ProductCard({ producto }: { producto: Producto }) {
  const { addItem } = useCart();
  const [indice, setIndice] = useState(0);
  const agotado = producto.stock <= 0;
  const imagenes = producto.imagenes.length > 0 ? producto.imagenes : ["/placeholder-producto.png"];

  return (
    <div className="group bg-white rounded-3xl border border-charcoal/5 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative">
      <div className="relative h-48 sm:h-52 bg-cream overflow-hidden">
        <img
          src={imagenes[indice]}
          alt={producto.nombre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-soda-dark text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
          ${producto.precio.toLocaleString("es-CO")}
        </span>
        {agotado && (
          <span className="absolute top-4 left-4 bg-charcoal/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
            Agotado
          </span>
        )}
        {imagenes.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {imagenes.map((_, i) => (
              <button
                key={i}
                aria-label={`Ver foto ${i + 1}`}
                onClick={() => setIndice(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === indice ? "bg-white scale-125 shadow-sm" : "bg-white/60 hover:bg-white"}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="p-5 md:p-6 flex flex-col flex-1 bg-white relative z-20">
        <p className="text-xs text-charcoal/50 uppercase tracking-widest font-semibold mb-1">{producto.categoria}</p>
        <h3 className="font-bold text-lg text-charcoal mb-4 leading-tight">{producto.nombre}</h3>
        <button
          disabled={agotado}
          onClick={() =>
            addItem({
              id: producto.id,
              nombre: producto.nombre,
              precio: producto.precio,
              imagen: imagenes[0]
            })
          }
          className="mt-auto flex items-center justify-center gap-2 w-full text-sm font-bold bg-cream text-bottle rounded-full py-3 hover:bg-bottle hover:text-white transition-all duration-300 disabled:opacity-40 disabled:hover:bg-cream disabled:hover:text-bottle disabled:cursor-not-allowed group/btn"
        >
          {agotado ? "Agotado" : "Agregar al carrito"}
          {!agotado && <i className="ti ti-plus text-base transition-transform group-hover/btn:rotate-90"></i>}
        </button>
      </div>
    </div>
  );
}
