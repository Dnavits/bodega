"use client";

import React, { useState } from 'react';
import { WhatsAppIcon, CheckIcon } from './Icons';
import { generateGeneralWhatsAppLink } from '@/data/products';

const SATIN_PALETTES = [
  { name: "Púrpura Imperial", color: "#581C87", text: "#FFFFFF" },
  { name: "Lavanda Editorial", color: "#C084FC", text: "#1A1624" },
  { name: "Marfil Seda", color: "#FDFBF7", text: "#1A1624" },
  { name: "Champagne Oro", color: "#E5C890", text: "#1A1624" },
  { name: "Rojo Rubí Atelier", color: "#991B1B", text: "#FFFFFF" },
  { name: "Azul Medianoche", color: "#1E1B4B", text: "#FFFFFF" },
  { name: "Rosa Palo Editorial", color: "#E2A4B8", text: "#1A1624" },
  { name: "Esmeralda Noble", color: "#065F46", text: "#FFFFFF" },
];

export function CustomizationSection() {
  const [selectedColors, setSelectedColors] = useState<string[]>([
    "Púrpura Imperial",
    "Lavanda Editorial",
  ]);

  const toggleColor = (name: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(name)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter((c) => c !== name);
      } else {
        if (prev.length >= 3) {
          return [...prev.slice(1), name];
        }
        return [...prev, name];
      }
    });
  };

  const customWhatsAppMsg = `Hola Momentos Abigail ✨, me interesa personalizar un ramo con la combinación de satín: ${selectedColors.join(" + ")}. ¿Podrían asesorarme con las opciones de bouquet disponibles?`;
  const customWhatsAppUrl = `https://wa.me/573019519391?text=${encodeURIComponent(customWhatsAppMsg)}`;

  return (
    <section id="personalizacion" className="py-16 sm:py-24 bg-white border-t border-atelier-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Story & Atelier explanation */}
          <div className="lg:col-span-6">
            <span className="text-atelier-700 font-bold text-xs uppercase tracking-[0.2em] inline-block mb-2">
              Atelier a Medida
            </span>
            <h2 className="font-roboto font-black text-3xl sm:text-5xl text-atelier-950 tracking-tight leading-tight">
              Personaliza tu ramo sin costo adicional
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              En <strong>Momentos Abigail</strong> ningún arreglo sale en serie. Cada rosa, girasol y lazo se diseña con la paleta de satín exacta que exprese tu sentimiento.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-atelier-100 text-atelier-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-atelier-950">Satín de Seda Importado</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Garantía de brillo satinado permanente y protección contra el polvo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-atelier-100 text-atelier-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-atelier-950">Accesorios a tu Elección</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Puedes añadir coronas doradas, mariposas 3D con relieve, perlas de cristal o luces micro-LED.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-atelier-100 text-atelier-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-atelier-950">Tarjeta & Dedicatoria en Caligrafía</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Envíanos tu mensaje especial y lo imprimiremos con tipografía editorial en papel verjurado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Color Selector */}
          <div className="lg:col-span-6 bg-sand border border-atelier-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-roboto font-bold text-lg text-atelier-950">
                Selecciona tus tonos de satín
              </h3>
              <span className="text-[11px] font-semibold text-atelier-600 bg-atelier-100 px-2.5 py-1 rounded-full">
                Hasta 3 colores
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-6">
              Haz clic en los tonos para previsualizar tu combinación y generar tu pedido por WhatsApp:
            </p>

            {/* Color Swatch Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {SATIN_PALETTES.map((palette) => {
                const isSelected = selectedColors.includes(palette.name);
                return (
                  <button
                    key={palette.name}
                    type="button"
                    onClick={() => toggleColor(palette.name)}
                    className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-300'
                        : 'bg-white/80 border-atelier-200 hover:border-atelier-300'
                    }`}
                  >
                    <span
                      className="w-10 h-10 rounded-full mb-2 shadow-inner border border-black/10 flex items-center justify-center transition-transform hover:scale-110"
                      style={{ backgroundColor: palette.color }}
                    >
                      {isSelected && (
                        <CheckIcon
                          className="w-5 h-5"
                          style={{ color: palette.text }}
                        />
                      )}
                    </span>
                    <span className="text-[11px] font-medium text-atelier-950 text-center leading-tight">
                      {palette.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Preview Box */}
            <div className="bg-white border border-atelier-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-atelier-600 tracking-wider block">
                  Tu Combinación Elegida
                </span>
                <p className="font-roboto font-black text-sm text-atelier-950 mt-0.5">
                  {selectedColors.join(" + ")}
                </p>
              </div>

              <a
                href={customWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-whatsapp hover:bg-emerald-whatsappHover text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-sm transition-all duration-150 active:scale-95 shrink-0"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Pedir esta Combinación</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
