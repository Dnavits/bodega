"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductItem } from './ProductCard';
import { WhatsAppIcon, CheckIcon, CloseIcon } from './Icons';
import { generateWhatsAppLink } from '@/data/products';

const BACKUP_IMAGE = "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80";

export function ProductModal({
  product,
  onClose,
}: {
  product: ProductItem;
  onClose: () => void;
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imgErrorMap, setImgErrorMap] = useState<Record<number, boolean>>({});

  const currentImg = imgErrorMap[activeImageIndex]
    ? BACKUP_IMAGE
    : product.images[activeImageIndex] || BACKUP_IMAGE;

  const buyLink = generateWhatsAppLink(product.name, product.priceFormatted);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Dark backdrop with blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-atelier-night/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white border border-atelier-200 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar ventana"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-atelier-200 flex items-center justify-center text-atelier-950 hover:bg-atelier-100 transition-colors shadow-sm active:scale-95"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Gallery Column */}
          <div className="p-4 sm:p-6 bg-atelier-50/60 flex flex-col justify-between border-b md:border-b-0 md:border-r border-atelier-200/70">
            {/* Main Image Viewer */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-atelier-200/80 shadow-inner">
              <Image
                src={currentImg}
                alt={product.name}
                fill
                unoptimized
                onError={() =>
                  setImgErrorMap((prev) => ({ ...prev, [activeImageIndex]: true }))
                }
                className="object-cover object-center transition-all duration-300"
              />
              <div className="absolute top-3 left-3">
                <span className="bg-atelier-950/80 text-sand text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-sm">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip with vertical padding to prevent ring clipping */}
            <div className="mt-4">
              <p className="text-[11px] font-semibold text-atelier-600 uppercase tracking-wider mb-2">
                Perspectivas del ramo ({activeImageIndex + 1} de {product.images.length})
              </p>
              {/* Note the padding py-2 px-1 items-center to avoid clipping the active focus ring */}
              <div className="flex gap-3 overflow-x-auto py-2 px-1 items-center scrollbar-none">
                {product.images.map((imgUrl, idx) => {
                  const isSelected = idx === activeImageIndex;
                  const thumbSrc = imgErrorMap[idx] ? BACKUP_IMAGE : imgUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 transition-all duration-200 ${
                        isSelected
                          ? 'ring-2 ring-purple-500 ring-offset-2 scale-102 shadow-md'
                          : 'opacity-70 hover:opacity-100 ring-1 ring-atelier-200'
                      }`}
                    >
                      <Image
                        src={thumbSrc}
                        alt={`Miniatura ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Header tags */}
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block bg-atelier-100 text-atelier-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {product.tag}
                </span>
                {product.customColor && (
                  <span className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Color a elección sin costo
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <h2 className="font-roboto font-black text-2xl sm:text-3xl text-atelier-950 leading-tight">
                {product.name}
              </h2>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-roboto font-black text-3xl text-atelier-700">
                  {product.priceFormatted}
                </span>
                <span className="text-xs text-gray-500 font-medium">Precio final garantizado</span>
              </div>

              {/* Editorial Description */}
              <p className="mt-4 text-sm text-gray-700 leading-relaxed font-normal">
                {product.description}
              </p>

              {/* Value Attributes Checklist */}
              <div className="mt-6 pt-5 border-t border-atelier-100 space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-atelier-900">
                  Beneficios del Atelier Momentos Abigail:
                </p>

                <div className="flex items-start gap-2.5 text-xs text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-atelier-100 text-atelier-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckIcon className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    <strong>Personalización cromática:</strong> Elige tu paleta de colores preferida por WhatsApp sin ningún recargo.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-atelier-100 text-atelier-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckIcon className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    <strong>Despachos en Valle de Aburrá:</strong> Entregas en Medellín, Envigado, Itagüí, Sabaneta y Bello (opción contraentrega disponible para pedidos menores a $100.000 COP).
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-atelier-100 text-atelier-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckIcon className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    <strong>Durabilidad perpetua:</strong> Flores elaboradas en satín de alto gramaje que jamás se marchitan ni requieren agua.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-atelier-100 text-atelier-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckIcon className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    <strong>Presentación de regalo:</strong> Incluye dedicatoria impresa en papelería fina y envoltorio estructurado.
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="mt-8 pt-4 border-t border-atelier-100 flex flex-col gap-3">
              <a
                href={buyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-whatsapp hover:bg-emerald-whatsappHover text-white text-base font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                <WhatsAppIcon className="w-5 h-5 text-white" />
                <span>Ordenar este Ramo por WhatsApp</span>
              </a>
              <p className="text-[11px] text-center text-gray-500 font-medium">
                Atención directa con el maestro artesano para coordinar hora de entrega y dedicatoria.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
