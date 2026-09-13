"use client";

import { useCart } from "@/lib/cart-context";
import { CloseIcon, TrashIcon, CartIcon } from "@/components/Icons";
import Link from "next/link";

interface CartDrawerProps {
  whatsapp?:     string | null;
  nombreBodega?: string | null;
}

const FALLBACK_WA = "573019519391";

export function CartDrawer({ whatsapp, nombreBodega }: CartDrawerProps) {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total } = useCart();

  if (!isOpen) return null;

  const wa = whatsapp || FALLBACK_WA;
  const nombre = (nombreBodega || "Bodega Dnavits").trim();
  const waMsg = encodeURIComponent(
    `Hola ${nombre} 🍻, quiero pedir:\n\n${items
      .map(i => `• ${i.cantidad}x ${i.nombre} — $${(i.precio * i.cantidad).toLocaleString("es-CO")}`)
      .join("\n")}\n\n*Total: $${total.toLocaleString("es-CO")}*`
  );
  const waUrl = `https://wa.me/${wa}?text=${waMsg}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-canvas border-l border-hairline h-full flex flex-col shadow-card-hover z-10 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
          <div className="flex items-center gap-2.5">
            <h2 className="font-inter font-black text-lg text-ink">Tu Pedido</h2>
            <span className="text-[11px] bg-sky text-accent font-bold px-2 py-0.5 rounded-tag">
              {items.length} ítem{items.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-hairline text-ink-muted hover:bg-surface transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-surface border border-hairline flex items-center justify-center mb-3 text-ink-muted shadow-subtle">
                <CartIcon className="w-8 h-8 text-ink-muted" />
              </div>
              <p className="font-semibold text-ink text-sm">Tu carrito está vacío</p>
              <p className="text-xs text-ink-faint mt-1">Agrega bebidas desde el catálogo</p>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className="flex gap-3 items-center p-3 border border-hairline rounded-card bg-surface"
              >
                <img
                  src={item.imagen}
                  alt={item.nombre}
                  className="w-14 h-14 rounded-xl object-contain bg-canvas border border-hairline p-1 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink truncate">{item.nombre}</p>
                  <p className="text-xs font-bold text-accent mt-0.5">
                    ${(item.precio * item.cantidad).toLocaleString("es-CO")}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                      className="w-6 h-6 flex items-center justify-center bg-canvas border border-hairline rounded-lg text-xs font-bold text-ink hover:bg-surface transition-colors"
                    >
                      −
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-ink">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                      disabled={item.stock !== undefined && item.cantidad >= item.stock}
                      className="w-6 h-6 flex items-center justify-center bg-canvas border border-hairline rounded-lg text-xs font-bold text-ink hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title={item.stock !== undefined && item.cantidad >= item.stock ? `Máximo ${item.stock} unidades en stock` : undefined}
                    >
                      +
                    </button>
                    {item.stock !== undefined && item.cantidad >= item.stock && (
                      <span className="text-[10px] text-warning font-semibold">
                        Máx. ({item.stock})
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-faint hover:text-danger hover:bg-danger-soft transition-colors"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-divider space-y-2.5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-eyebrow text-ink-muted font-bold">Subtotal</span>
              <span className="font-inter font-black text-2xl text-ink">
                ${total.toLocaleString("es-CO")}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-ink hover:bg-ink-light text-white font-bold py-3.5 rounded-btn shadow-portrait transition-all active:scale-95 text-sm group mt-3"
            >
              <span>Continuar con el Pedido</span>
              <span className="transition-transform group-hover:translate-x-1 font-bold">→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
