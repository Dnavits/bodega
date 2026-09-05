"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { WhatsAppIcon, SparklesIcon } from './Icons';
import { generateGeneralWhatsAppLink } from '@/data/products';

const BACKUP_HERO_IMAGE = "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1920&q=85";

export function Hero() {
  const [heroImg, setHeroImg] = useState("https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1920&q=85");

  return (
    <section id="inicio" className="relative min-h-[90vh] md:min-h-[94vh] flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background Image with Double Gradient (Deep Black to Deep Night Purple) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImg}
          alt="Momentos Abigail - Flores Eternas en Satín de Lujo"
          fill
          priority
          unoptimized
          onError={() => setHeroImg(BACKUP_HERO_IMAGE)}
          className="object-cover object-center scale-105 transition-transform duration-1000"
        />
        {/* Layer 1: Dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-atelier-night via-atelier-950/75 to-black/60 z-10" />
        {/* Layer 2: Editorial purple atmospheric tint */}
        <div className="absolute inset-0 bg-gradient-to-r from-atelier-900/60 via-atelier-night/40 to-black/70 mix-blend-multiply z-10" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Atelier Badge */}
        <div className="inline-flex items-center gap-2 bg-atelier-950/80 backdrop-blur-md border border-atelier-300/30 text-atelier-100 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-6 shadow-luxury">
          <SparklesIcon className="w-4 h-4 text-atelier-300" />
          <span className="tracking-wide">Atelier de Alta Floristería en Satín · Medellín</span>
        </div>

        {/* Hero Title with purple gradient */}
        <h1 className="font-roboto font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-tight leading-[1.1] max-w-4xl">
          Flores eternas,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-atelier-100 via-atelier-300 to-purple-400">
            detalles inolvidables
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-sand/90 font-light max-w-2xl leading-relaxed">
          Piezas maestras confeccionadas artesanalmente en satín importado de alto gramaje. Ramos buchones y bouquets que conservan su brillo y textura para siempre, sin marchitarse.
        </p>

        {/* Feature Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-medium text-atelier-100/90">
          <span className="bg-atelier-900/60 backdrop-blur-sm border border-atelier-700/40 px-3.5 py-1.5 rounded-xl">
            ✨ Color a elección sin costo adicional
          </span>
          <span className="bg-atelier-900/60 backdrop-blur-sm border border-atelier-700/40 px-3.5 py-1.5 rounded-xl">
            🚚 Envíos y contraentrega en Valle de Aburrá
          </span>
          <span className="bg-atelier-900/60 backdrop-blur-sm border border-atelier-700/40 px-3.5 py-1.5 rounded-xl">
            💎 100% Satín Premium Duradero
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <a
            href="#coleccion"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-sand hover:bg-white text-atelier-950 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 text-sm sm:text-base border border-atelier-200"
          >
            Explorar Colección
          </a>
          <a
            href={generateGeneralWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-whatsapp hover:bg-emerald-whatsappHover text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-emerald-950/20 transition-all duration-200 active:scale-95 text-sm sm:text-base"
          >
            <WhatsAppIcon className="w-5 h-5 text-white" />
            <span>Asesoría por WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
