"use client";

import { WhatsAppIcon } from "./Icons";

export function FloatingWhatsApp() {
  return (
    <aside aria-label="Contacto directo" className="fixed bottom-5 right-5 z-40">
      <a
        href="https://wa.me/573019519391?text=Hola%20Bodega%20Dnavits%2C%20deseo%20hacer%20un%20pedido%20de%20bebidas."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Pedir por WhatsApp a Bodega Dnavits"
        className="flex items-center gap-2.5 bg-emerald hover:bg-emerald-hover text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group border-2 border-white/20"
      >
        <WhatsAppIcon className="w-6 h-6 text-white" />
        <span className="font-roboto font-bold text-xs sm:text-sm tracking-wide hidden sm:inline">
          Pedir por WhatsApp
        </span>
      </a>
    </aside>
  );
}
