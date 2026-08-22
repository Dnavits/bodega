"use client";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";

const links = [
  { href: "#quienes-somos", label: "Quiénes somos" },
  { href: "#tienda", label: "Tienda" },
  { href: "#contacto", label: "Contáctanos" }
];

export function Navbar({ logoUrl }: { logoUrl?: string | null }) {
  const { count, setIsOpen } = useCart();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="fixed top-4 left-4 right-4 z-40">
      <nav className="max-w-5xl mx-auto glass rounded-2xl px-5 md:px-6 h-16 flex items-center justify-between shadow-lg shadow-charcoal/5 transition-all duration-300">
        <a href="#inicio" className="flex items-center gap-2 shrink-0 transition-transform hover:scale-105">
          {logoUrl ? (
            <img src={logoUrl} alt="Bodega Dnavits" className="h-9 w-auto" />
          ) : (
            <span className="font-display font-bold text-xl text-bottle-dark">Bodega Dnavits</span>
          )}
        </a>

        <div className="hidden md:flex gap-8 text-sm font-medium">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-charcoal/80 hover:text-soda transition-colors relative group">
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-soda transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Abrir carrito"
            className="relative flex items-center gap-2 bg-bottle text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-bottle-light hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
          >
            <i className="ti ti-shopping-cart text-lg" aria-hidden="true" />
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-soda text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-sm animate-pulse-slow">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            className="md:hidden w-10 h-10 flex items-center justify-center bg-charcoal/5 rounded-full hover:bg-charcoal/10 transition-colors"
          >
            <i className={menuAbierto ? "ti ti-x text-xl" : "ti ti-menu-2 text-xl"} aria-hidden="true" />
          </button>
        </div>
      </nav>

      {menuAbierto && (
        <div className="md:hidden mt-2 max-w-5xl mx-auto glass rounded-2xl px-5 py-4 flex flex-col gap-4 text-sm font-medium shadow-lg animate-fade-in-up">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuAbierto(false)} className="py-2 text-charcoal hover:text-soda transition-colors">
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
