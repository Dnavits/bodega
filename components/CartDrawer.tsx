"use client";
import { useCart } from "@/lib/cart-context";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm animate-fade-in-up" 
        style={{ animationDuration: '0.3s' }}
        onClick={() => setIsOpen(false)} 
      />
      <div className="relative w-full max-w-md bg-cream h-full flex flex-col shadow-2xl animate-fade-in-up" style={{ animationDuration: '0.4s' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-charcoal/10 bg-white">
          <h2 className="font-display font-bold text-xl text-charcoal">Tu carrito</h2>
          <button onClick={() => setIsOpen(false)} aria-label="Cerrar carrito" className="w-8 h-8 flex items-center justify-center rounded-full bg-charcoal/5 hover:bg-charcoal/10 transition-colors">
            <i className="ti ti-x text-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {items.length === 0 && (
            <div className="text-center text-charcoal/50 mt-10 flex flex-col items-center">
              <i className="ti ti-shopping-cart text-5xl mb-3 opacity-20"></i>
              <p className="text-sm font-medium">Todavía no has agregado productos.</p>
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-charcoal/5 shadow-sm hover:shadow-md transition-shadow group">
              <img src={item.imagen} alt={item.nombre} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="text-sm font-bold leading-tight mb-1">{item.nombre}</p>
                <p className="text-sm text-soda font-semibold mb-2">${item.precio.toLocaleString("es-CO")}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item.id, item.cantidad - 1)} className="w-7 h-7 flex items-center justify-center bg-cream rounded-full hover:bg-bottle hover:text-white transition-colors text-lg leading-none">-</button>
                  <span className="text-sm font-bold w-4 text-center">{item.cantidad}</span>
                  <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} className="w-7 h-7 flex items-center justify-center bg-cream rounded-full hover:bg-bottle hover:text-white transition-colors text-lg leading-none">+</button>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} aria-label={`Eliminar ${item.nombre}`} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                <i className="ti ti-trash" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        <div className="px-6 py-6 border-t border-charcoal/10 bg-white">
          <div className="flex justify-between items-end mb-5">
            <span className="text-charcoal/60 font-medium text-sm">Total a pagar:</span>
            <span className="font-display font-bold text-2xl text-bottle-dark">${total.toLocaleString("es-CO")}</span>
          </div>
          <a
            href="/checkout"
            className="block w-full text-center bg-soda hover:bg-soda-dark transition-all duration-300 hover:scale-[1.02] active:scale-95 text-white font-bold py-4 rounded-full shadow-lg shadow-soda/20 text-lg"
          >
            Proceder al pago
          </a>
        </div>
      </div>
    </div>
  );
}
