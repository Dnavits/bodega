"use client";

import React from 'react';
import { WhatsAppIcon } from './Icons';
import { generateGeneralWhatsAppLink } from '@/data/products';

export function FloatingWhatsApp() {
  return (
    <aside aria-label="Contacto directo" className="fixed bottom-5 right-5 z-40">
      <a
        href={generateGeneralWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp a Momentos Abigail"
        className="flex items-center gap-2.5 bg-emerald-whatsapp hover:bg-emerald-whatsappHover text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-emerald-950/30 transition-all duration-300 hover:scale-105 active:scale-95 group border-2 border-white/30"
      >
        <WhatsAppIcon className="w-6 h-6 text-white" />
        <span className="font-roboto font-bold text-xs sm:text-sm tracking-wide hidden sm:inline">
          Pedir por WhatsApp
        </span>
      </a>
    </aside>
  );
}
