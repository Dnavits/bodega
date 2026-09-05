"use client";

import React, { useState } from 'react';
import { CopyIcon, CheckIcon, WhatsAppIcon } from './Icons';
import { NEQUI_NUMBER, generateGeneralWhatsAppLink } from '@/data/products';

export function PaymentInfo() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(NEQUI_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="medios-pago" className="py-16 sm:py-20 bg-sand border-t border-atelier-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-atelier-700 font-bold text-xs uppercase tracking-[0.2em] inline-block mb-2">
            Transparencia & Seguridad
          </span>
          <h2 className="font-roboto font-black text-3xl sm:text-4xl text-atelier-950 tracking-tight">
            Canales de Pago Directos
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Facilidad y agilidad en cada transferencia. Recibimos Nequi, transferencias Bancolombia y contraentrega.
          </p>
        </div>

        {/* Responsive Container: Stack vertical on mobile, 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Nequi Main Payment Card (Deep Night Purple) */}
          <div className="lg:col-span-7 bg-atelier-night border border-atelier-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-atelier-700/20 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF007A] via-[#8900FF] to-[#20002C] flex items-center justify-center font-black text-xl text-white shadow-md">
                    N
                  </div>
                  <div>
                    <h3 className="font-roboto font-bold text-lg text-white leading-tight">
                      Canal Nequi Oficial
                    </h3>
                    <p className="text-xs text-atelier-200 font-medium">Momentos Abigail Atelier</p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-3 py-1 rounded-full">
                  Verificado · Activo
                </span>
              </div>

              {/* Number Copy Box (100% responsive, vertical stack on small screens) */}
              <div className="mt-4 p-4 sm:p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-[11px] uppercase tracking-wider text-atelier-300 font-medium block">
                    Número de Nequi
                  </span>
                  <span className="font-roboto font-mono font-black text-2xl sm:text-3xl text-white tracking-widest">
                    {NEQUI_NUMBER}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-atelier-600 hover:bg-atelier-500 text-white shadow-md'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4" />
                      <span>Copiar Número</span>
                    </>
                  )}
                </button>
              </div>

              {/* Fast Instructions */}
              <div className="mt-6 space-y-3 text-xs text-sand/80">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-atelier-800 text-atelier-300 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span>Envía tu transferencia a la cuenta Nequi indicada con el valor acordado.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-atelier-800 text-atelier-300 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span>Adjunta la captura del comprobante al chat de WhatsApp oficial.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-atelier-800 text-atelier-300 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span>Confirmamos tu pedido y comenzamos la confección artesanal inmediatamente.</span>
                </div>
              </div>
            </div>

            {/* Bottom notification */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-atelier-300">
              <span>Titular: Momentos Abigail</span>
              <span>Medellín, Colombia</span>
            </div>
          </div>

          {/* Right Column: Policies & Contraentrega details */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {/* Card 1: Contraentrega */}
            <div className="bg-white border border-atelier-200/80 rounded-3xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <CheckIcon className="w-5 h-5" />
              </div>
              <h4 className="font-roboto font-bold text-base text-atelier-950">
                Opción Contraentrega (Valle de Aburrá)
              </h4>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Para pedidos menores a <strong>$100.000 COP</strong> dentro de Medellín, Envigado, Itagüí, Sabaneta o Bello, puedes pagar en efectivo o transferencia al momento de recibir tu ramo en la puerta.
              </p>
            </div>

            {/* Card 2: Ramos Personalizados & Anticipo */}
            <div className="bg-white border border-atelier-200/80 rounded-3xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-atelier-100 text-atelier-700 flex items-center justify-center mb-3 font-bold text-sm">
                50%
              </div>
              <h4 className="font-roboto font-bold text-base text-atelier-950">
                Ramos Buchones & Diseños a Medida
              </h4>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Los ramos buchones (de 50 y 100 rosas) y combinaciones especiales requieren un anticipo del <strong>50%</strong> para separar fecha de elaboración artesanal y apartar los materiales importados.
              </p>
            </div>

            {/* Direct Confirmation WhatsApp Link */}
            <a
              href={generateGeneralWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-atelier-50 border border-emerald-500/40 text-emerald-800 font-bold p-4 rounded-2xl text-xs transition-colors shadow-sm"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
              <span>¿Tienes dudas sobre los medios de pago? Escríbenos</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
