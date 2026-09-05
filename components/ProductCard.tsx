"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { WhatsAppIcon } from './Icons';
import { generateWhatsAppLink } from '@/data/products';

const BACKUP_IMAGE = "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80";

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  priceFormatted: string;
  tag: string;
  tagColor?: string;
  customColor?: boolean;
  description: string;
  attributes: string[];
  images: string[];
}

export function ProductCard({
  product,
  onOpenModal,
}: {
  product: ProductItem;
  onOpenModal: (product: ProductItem) => void;
}) {
  const [imageSrc, setImageSrc] = useState(product.images[0] || BACKUP_IMAGE);

  const buyLink = generateWhatsAppLink(product.name, product.priceFormatted);

  return (
    <div className="group relative bg-white border border-atelier-200/70 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-950/5 hover:-translate-y-1">
      {/* Product Image Container */}
      <div
        onClick={() => onOpenModal(product)}
        className="relative aspect-square w-full bg-atelier-50 overflow-hidden cursor-pointer"
      >
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          unoptimized
          onError={() => setImageSrc(BACKUP_IMAGE)}
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Collection / Best Seller Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-block bg-atelier-950/85 backdrop-blur-md text-atelier-100 text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg border border-atelier-700/50 shadow-sm">
            {product.tag}
          </span>
        </div>

        {/* Color Choice Tag */}
        {product.customColor && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md text-atelier-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-atelier-200 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-atelier-600"></span>
              Color a elección
            </span>
          </div>
        )}

        {/* Quick View Overlay on Desktop */}
        <div className="absolute inset-0 bg-atelier-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <span className="bg-white/95 text-atelier-950 text-xs font-bold px-4 py-2 rounded-xl shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            Ver Galería Completa
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 bg-white justify-between">
        <div>
          {/* Category & Title */}
          <div className="flex items-center justify-between text-xs text-atelier-600 mb-1 font-medium">
            <span className="uppercase tracking-wider">{product.category}</span>
            <span className="text-[11px] text-gray-500">Satín Artesanal</span>
          </div>
          <h3
            onClick={() => onOpenModal(product)}
            className="font-roboto font-bold text-base sm:text-lg text-atelier-950 cursor-pointer hover:text-atelier-700 transition-colors line-clamp-1"
          >
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Actions */}
        <div className="mt-5 pt-4 border-t border-atelier-100 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Inversión</span>
            <span className="font-roboto font-black text-lg sm:text-xl text-atelier-950">
              {product.priceFormatted}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenModal(product)}
              className="hidden sm:inline-flex text-xs font-semibold text-atelier-800 hover:text-atelier-950 hover:bg-atelier-50 px-3 py-2 rounded-xl border border-atelier-200 transition-colors"
            >
              Detalles
            </button>
            <a
              href={buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-whatsapp hover:bg-emerald-whatsappHover text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-150 active:scale-95"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Comprar</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
