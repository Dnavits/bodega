"use client";

import { WhatsAppIcon } from "./Icons";
import { WHATSAPP_NUMBER } from "@/lib/constants";

interface FloatingWhatsAppProps {
  whatsapp?: string | null;
}

export function FloatingWhatsApp({ whatsapp }: FloatingWhatsAppProps) {
  const wa = whatsapp || WHATSAPP_NUMBER;
  return (
    <aside aria-label="Contacto directo" className="fixed bottom-5 right-5 z-40">
      <a
        href={`https://wa.me/${wa}?text=Hola%20Bodega%20Dnavits%2C%20deseo%20hacer%20un%20pedido%20de%20bebidas.`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Pedir por WhatsApp a Bodega Dnavits"
        className="flex items-center gap-2.5 bg-emerald hover:bg-emerald-hover text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-pill shadow-portrait transition-all duration-300 hover:scale-105 active:scale-95 group border border-white/20"
      >
        <WhatsAppIcon className="w-5 h-5 text-white" />
        <span className="font-inter font-bold text-xs sm:text-sm tracking-tight hidden sm:inline">
          Pedir por WhatsApp
        </span>
      </a>
    </aside>
  );
}
