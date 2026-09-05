"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WhatsAppIcon } from '@/components/Icons';
import { generateGeneralWhatsAppLink } from '@/data/products';

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-sand flex items-center justify-center p-6 text-atelier-950">
      <div className="max-w-md w-full bg-white border border-atelier-200 rounded-3xl p-8 shadow-xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-atelier-100 text-atelier-700 mx-auto flex items-center justify-center font-bold text-xl mb-4">
          ✨
        </div>
        <h1 className="font-roboto font-black text-2xl text-atelier-950 mb-2">
          Atelier Momentos Abigail
        </h1>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Nuestros pedidos se coordinan de forma personalizada y artesanal directamente a través de WhatsApp para confirmar colores, dedicatoria y detalles de entrega en Medellín.
        </p>
        <div className="space-y-3">
          <a
            href={generateGeneralWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-whatsapp hover:bg-emerald-whatsappHover text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all duration-200"
          >
            <WhatsAppIcon className="w-5 h-5 text-white" />
            <span>Coordinar Pedido por WhatsApp</span>
          </a>
          <button
            onClick={() => router.push('/#coleccion')}
            className="w-full py-3 text-xs font-bold text-atelier-700 hover:text-atelier-900 transition-colors"
          >
            ← Volver a la Colección
          </button>
        </div>
      </div>
    </main>
  );
}
