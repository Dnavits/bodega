import React from 'react';
import Image from 'next/image';
import { WhatsAppIcon, InstagramIcon } from './Icons';
import {
  WHATSAPP_NUMBER,
  NEQUI_NUMBER,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  generateGeneralWhatsAppLink
} from '@/data/products';

export function Footer() {
  return (
    <footer id="atelier" className="bg-atelier-night text-sand border-t border-atelier-900">
      {/* 4 Brand Value Pillars Banner */}
      <div className="border-b border-atelier-800/80 bg-atelier-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Pillar 01 */}
            <div className="flex flex-col border-l-2 border-atelier-600 pl-4">
              <span className="font-roboto font-black text-2xl text-atelier-300">01</span>
              <h4 className="font-roboto font-bold text-base text-white mt-1">Flores Eternas</h4>
              <p className="text-xs text-sand/70 mt-1 leading-relaxed">
                Satín importado de alto gramaje que conserva su textura, color y volumen sin marchitarse.
              </p>
            </div>

            {/* Pillar 02 */}
            <div className="flex flex-col border-l-2 border-atelier-600 pl-4">
              <span className="font-roboto font-black text-2xl text-atelier-300">02</span>
              <h4 className="font-roboto font-bold text-base text-white mt-1">100% Personalizable</h4>
              <p className="text-xs text-sand/70 mt-1 leading-relaxed">
                Escoge y combina los colores de los pétalos, follajes y lazos sin costo adicional.
              </p>
            </div>

            {/* Pillar 03 */}
            <div className="flex flex-col border-l-2 border-atelier-600 pl-4">
              <span className="font-roboto font-black text-2xl text-atelier-300">03</span>
              <h4 className="font-roboto font-bold text-base text-white mt-1">Cobertura Local</h4>
              <p className="text-xs text-sand/70 mt-1 leading-relaxed">
                Despachos programados y seguros en todo Medellín, Envigado, Itagüí, Sabaneta y Bello.
              </p>
            </div>

            {/* Pillar 04 */}
            <div className="flex flex-col border-l-2 border-atelier-600 pl-4">
              <span className="font-roboto font-black text-2xl text-atelier-300">04</span>
              <h4 className="font-roboto font-bold text-base text-white mt-1">Confección Sobre Pedido</h4>
              <p className="text-xs text-sand/70 mt-1 leading-relaxed">
                Cada detalle se elabora a mano con pasión artesanal exclusivamente para tu ocasión especial.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links and Contact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Info (5 cols) */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-1 ring-atelier-400">
                <Image
                  src="/logo.svg"
                  alt="Momentos Abigail"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <span className="font-roboto font-black text-lg text-white tracking-wider block">
                  MOMENTOS ABIGAIL
                </span>
                <span className="text-xs text-atelier-300 tracking-[0.2em] uppercase font-medium">
                  Atelier Floral Artesanal
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-sand/70 leading-relaxed max-w-sm">
              Creamos recuerdos imperecederos a través de la alta confección floral en satín. Elegancia editorial, acabados premium y asesoría personalizada para aniversarios, grados y fechas inolvidables.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Momentos Abigail"
                className="w-10 h-10 rounded-xl bg-atelier-900 hover:bg-atelier-700 text-atelier-200 hover:text-white flex items-center justify-center transition-colors border border-atelier-800"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href={generateGeneralWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp de Momentos Abigail"
                className="w-10 h-10 rounded-xl bg-atelier-900 hover:bg-emerald-whatsapp text-atelier-200 hover:text-white flex items-center justify-center transition-colors border border-atelier-800"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Navigation (3 cols) */}
          <div className="lg:col-span-3">
            <h5 className="font-roboto font-bold text-sm uppercase tracking-wider text-atelier-200 mb-4">
              Navegación
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-sand/70">
              <li>
                <a href="#inicio" className="hover:text-atelier-200 transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#coleccion" className="hover:text-atelier-200 transition-colors">
                  Catálogo de Ramos
                </a>
              </li>
              <li>
                <a href="#personalizacion" className="hover:text-atelier-200 transition-colors">
                  Personalización de Colores
                </a>
              </li>
              <li>
                <a href="#medios-pago" className="hover:text-atelier-200 transition-colors">
                  Canal de Pago Nequi
                </a>
              </li>
              <li>
                <a href="#atelier" className="hover:text-atelier-200 transition-colors">
                  Garantía de Satín
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details (4 cols) */}
          <div className="lg:col-span-4">
            <h5 className="font-roboto font-bold text-sm uppercase tracking-wider text-atelier-200 mb-4">
              Atención & Despachos
            </h5>
            <ul className="space-y-3 text-xs sm:text-sm text-sand/80">
              <li className="flex items-start gap-2">
                <span className="text-atelier-400 font-bold">📍</span>
                <span>Medellín, Antioquia (Entregas en todo el Valle de Aburrá)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-atelier-400 font-bold">💬</span>
                <span>
                  WhatsApp:{' '}
                  <a
                    href={generateGeneralWhatsAppLink()}
                    className="text-emerald-400 font-medium hover:underline"
                  >
                    +57 301 951 9391
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-atelier-400 font-bold">💳</span>
                <span>Nequi Oficial: <strong className="text-white font-mono">{NEQUI_NUMBER}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-atelier-400 font-bold">📸</span>
                <span>
                  Instagram:{' '}
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-atelier-300 hover:text-white transition-colors"
                  >
                    {INSTAGRAM_HANDLE}
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="mt-14 pt-8 border-t border-atelier-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sand/50">
          <p>© {new Date().getFullYear()} Momentos Abigail Atelier Floral. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            <span>Hecho con dedicación en Medellín, Colombia</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
