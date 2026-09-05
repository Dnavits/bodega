"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { WhatsAppIcon } from './Icons';
import { generateGeneralWhatsAppLink } from '@/data/products';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-atelier-950 text-sand text-xs font-medium py-2 px-4 text-center tracking-wider border-b border-atelier-800/40">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-whatsappLight animate-pulse"></span>
          <span>Flores eternas en satín de lujo · Cobertura y contraentrega en Medellín y Valle de Aburrá</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          scrolled
            ? 'py-2'
            : 'py-3.5'
        }`}
      >
        <div
          className={`flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300 ${
            scrolled
              ? 'bg-sand/85 backdrop-blur-md shadow-luxury border border-atelier-200/60'
              : 'bg-sand/70 backdrop-blur-sm border border-transparent'
          }`}
        >
          {/* Brand Logo & Name */}
          <a
            href="#inicio"
            className="flex items-center gap-3 group transition-transform active:scale-98"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shadow-sm ring-1 ring-atelier-300">
              <Image
                src="/logo.svg"
                alt="Momentos Abigail Atelier Floral"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex flex-col">
              <span className="font-roboto font-black tracking-tight text-base sm:text-lg text-atelier-950 group-hover:text-atelier-700 transition-colors leading-tight">
                MOMENTOS ABIGAIL
              </span>
              <span className="text-[10px] tracking-[0.25em] font-medium text-atelier-600 uppercase">
                Atelier Floral · Medellín
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-atelier-950/80">
            <a
              href="#coleccion"
              className="relative py-1 transition-colors hover:text-atelier-700 group"
            >
              Colección
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-atelier-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            <a
              href="#personalizacion"
              className="relative py-1 transition-colors hover:text-atelier-700 group"
            >
              Personalización
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-atelier-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            <a
              href="#medios-pago"
              className="relative py-1 transition-colors hover:text-atelier-700 group"
            >
              Pago Nequi
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-atelier-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            <a
              href="#atelier"
              className="relative py-1 transition-colors hover:text-atelier-700 group"
            >
              Nuestro Atelier
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-atelier-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
          </div>

          {/* Direct WhatsApp CTA Button */}
          <div className="flex items-center gap-3">
            <a
              href={generateGeneralWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-whatsapp hover:bg-emerald-whatsappHover text-white text-xs sm:text-sm font-bold px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span className="hidden sm:inline">Asesoría WhatsApp</span>
              <span className="sm:hidden">Pedir</span>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
