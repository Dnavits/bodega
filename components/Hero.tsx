"use client";

import React, { useState } from "react";
import { BeerIcon, WhatsAppIcon } from "@/components/Icons";

const BACKUP_HERO_IMAGE = "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?q=80&w=1600&auto=format&fit=crop";

export function Hero() {
  const [heroImg, setHeroImg] = useState("https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=1600&auto=format&fit=crop");

  return (
    <section id="inicio" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-32 pb-16">
      {/* Fondo Nocturno */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Bodega Dnavits - Bebidas Frías y Cervezas"
          onError={() => setHeroImg(BACKUP_HERO_IMAGE)}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vault-950 via-vault-950/80 to-vault-950/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-vault-950 via-vault-900/50 to-vault-950 z-10" />
      </div>

      {/* Contenido Central */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-vault-900/90 border border-vault-800 text-accent-light text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm">
          <BeerIcon className="w-4 h-4 text-accent" />
          <span>Bodega Mayorista & al Detal · Envíos Express en Medellín</span>
        </div>

        {/* Título Principal con degradado azul tecnológico y plateado */}
        <h1 className="font-roboto font-black text-4xl sm:text-6xl md:text-7xl text-foam tracking-tight leading-[1.1] max-w-4xl">
          Tus bebidas heladas,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-light via-blue-400 to-indigo-300">
            directo a tu puerta
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="mt-6 text-base sm:text-xl text-vault-100/70 font-normal max-w-2xl leading-relaxed">
          Gaseosas en botella y lata, cervezas nacionales e importadas, agua purificada, hielo y licores. Precios directos de bodega sin intermediarios.
        </p>

        {/* Beneficios Clave */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-vault-100/80">
          <span className="bg-vault-900/80 border border-vault-800 px-3.5 py-1.5 rounded-xl">
            ⚡ Entregas en menos de 45 min
          </span>
          <span className="bg-vault-900/80 border border-vault-800 px-3.5 py-1.5 rounded-xl">
            ❄️ Siempre al clima o bajo cero
          </span>
          <span className="bg-vault-900/80 border border-vault-800 px-3.5 py-1.5 rounded-xl">
            💳 Efectivo, Nequi y Transferencia
          </span>
        </div>

        {/* Botones de Acción */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <a
            href="#catalogo"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 active:scale-95 text-base"
          >
            Ver Catálogo de Bebidas
          </a>
          <a
            href="https://wa.me/573019519391?text=Hola%20Bodega%20Dnavits%2C%20deseo%20hacer%20un%20pedido%20a%20domicilio."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald hover:bg-emerald-hover text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 active:scale-95 text-base"
          >
            <WhatsAppIcon className="w-5 h-5 text-white" />
            <span>Pedir por WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
