"use client";

import { useCart } from "@/lib/cart-context";
import { CloseIcon, TrashIcon, PlusIcon, WhatsAppIcon } from "@/components/Icons";
import Link from "next/link";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total } = useCart();

  if (!isOpen) return null;

  const whatsappMessage = `Hola Bodega Dnavits 🍻, deseo ordenar el siguiente pedido a domicilio:%0A%0A${items
    .map((i) => `• ${i.cantidad}x ${i.nombre} - $${(i.precio * i.cantidad).toLocaleString("es-CO")}`)
    .join("%0A")}%0A%0A*Total: $${total.toLocaleString("es-CO")}*%0A%0A¿Me confirman tiempo de entrega en Medellín?`;

  const whatsappLink = `https://wa.me/573019519391?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Fondo oscuro con desenfoque */}
      <div
        className="absolute inset-0 bg-vault-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-vault-900 border-l border-vault-800 h-full flex flex-col shadow-2xl z-10 animate-fade-in-up">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-vault-800 bg-vault-900/90">
          <div className="flex items-center gap-2.5">
            <h2 className="font-roboto font-black text-lg text-foam">Tu Pedido</h2>
            <span className="text-xs bg-amber/20 text-amber-light font-bold px-2 py-0.5 rounded-md">
              {items.length} {items.length === 1 ? "ítem" : "ítems"}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar carrito"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-vault-800 hover:bg-vault-700 text-vault-100/70 transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-24 text-vault-100/40 flex flex-col items-center">
              <span className="text-5xl mb-3">🧊</span>
              <p className="text-sm font-semibold text-foam">Tu carrito está vacío</p>
              <p className="text-xs text-vault-100/50 mt-1">Agrega gaseosas, cervezas o aguas bien frías.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 items-center bg-vault-950 border border-vault-800 p-3.5 rounded-2xl"
              >
                <img
                  src={item.imagen}
                  alt={item.nombre}
                  className="w-16 h-16 rounded-xl object-contain bg-vault-900 p-1 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-foam truncate">{item.nombre}</p>
                  <p className="text-xs font-semibold text-amber-light mt-0.5">
                    ${(item.precio * item.cantidad).toLocaleString("es-CO")}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                      className="w-6 h-6 flex items-center justify-center bg-vault-800 hover:bg-vault-700 text-foam text-xs font-bold rounded-lg transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-5 text-center text-foam">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-vault-800 hover:bg-vault-700 text-foam text-xs font-bold rounded-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label="Eliminar producto"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-vault-100/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer del Carrito con Opciones de Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-vault-800 bg-vault-950/80 space-y-3">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-xs uppercase font-bold text-vault-100/60">Subtotal</span>
              <span className="font-roboto font-black text-2xl text-foam">
                ${total.toLocaleString("es-CO")}
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center bg-amber hover:bg-amber-dark text-vault-950 font-black py-3.5 rounded-xl shadow-lg transition-all duration-200 active:scale-95 text-sm"
            >
              Proceder al Checkout (Web)
            </Link>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full text-center bg-emerald hover:bg-emerald-hover text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-200 active:scale-95 text-sm"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Pedir directo por WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
