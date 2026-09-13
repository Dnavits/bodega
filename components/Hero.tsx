"use client";

import React from "react";
import { BeerIcon, WhatsAppIcon, ZapIcon, SnowflakeIcon, CreditCardIcon, CheckCircleIcon } from "@/components/Icons";
import { WHATSAPP_NUMBER } from "@/lib/constants";

interface HeroProps {
  nombreBodega?:      string | null;
  badge?:             string | null;
  titulo?:            string | null;
  subtituloRainbow?:  string | null;
  descripcion?:       string | null;
  features?:          string[];
  whatsappPedidos?:   string | null;
}

const DEFAULT_FEATURES = [
  "Entrega en 1-2 días hábiles",
  "Siempre frío",
  "Nequi · Efectivo · Transferencia",
];

function getFeatureIconAndCleanText(feat: string) {
  const clean = feat.replace(/^[\p{Emoji}\s]+/u, "").trim() || feat;
  const lower = feat.toLowerCase();

  if (lower.includes("frío") || lower.includes("frio") || lower.includes("helad") || lower.includes("❄")) {
    return {
      icon: <SnowflakeIcon className="w-3.5 h-3.5 text-sky-500 shrink-0" />,
      text: clean,
    };
  }
  if (lower.includes("pago") || lower.includes("nequi") || lower.includes("efectivo") || lower.includes("transferencia") || lower.includes("tarjeta") || lower.includes("💳")) {
    return {
      icon: <CreditCardIcon className="w-3.5 h-3.5 text-emerald shrink-0" />,
      text: clean,
    };
  }
  if (lower.includes("entrega") || lower.includes("envío") || lower.includes("envio") || lower.includes("min") || lower.includes("días") || lower.includes("dias") || lower.includes("express") || lower.includes("⚡") || lower.includes("🚀")) {
    return {
      icon: <ZapIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
      text: clean,
    };
  }
  return {
    icon: <CheckCircleIcon className="w-3.5 h-3.5 text-accent shrink-0" />,
    text: clean,
  };
}

export function Hero({
  nombreBodega,
  badge,
  titulo,
  subtituloRainbow,
  descripcion,
  features,
  whatsappPedidos,
}: HeroProps) {
  const wa = whatsappPedidos || WHATSAPP_NUMBER;
  const nombre = (nombreBodega || "Bodega Dnavits").trim();
  const waMsg = encodeURIComponent(`Hola ${nombre} 🍻, deseo hacer un pedido de bebidas.`);
  const waUrl = `https://wa.me/${wa}?text=${waMsg}`;

  const badgeText = badge || "DOMICILIOS EXPRESS · MEDELLÍN";
  const mainTitle = titulo || "Tus bebidas heladas,";
  const rainbowWord = subtituloRainbow || "en minutos";
  const descText =
    descripcion ||
    "Gaseosas, cervezas, aguas y licores directo de la bodega a tu puerta. Precios directos, sin intermediarios, siempre fríos.";
  const featuresList =
    features && features.length > 0 ? features : DEFAULT_FEATURES;

  return (
    <section id="inicio" className="relative bg-canvas py-20 sm:py-28 overflow-hidden">
      {/* Fondo decorativo suave */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-sky/40 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-mint/30 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow badge editable */}
        <div className="inline-flex items-center gap-2 bg-sky text-accent text-[11px] font-bold uppercase tracking-eyebrow px-3 py-1 rounded-tag mb-8">
          <BeerIcon className="w-3.5 h-3.5" />
          <span>{badgeText}</span>
        </div>

        {/* Headline editable — Portrait style: tight tracking, black weight */}
        <h1 className="font-inter font-black text-4xl sm:text-6xl md:text-7xl text-ink tracking-display leading-none">
          {mainTitle}{" "}
          <br className="hidden sm:block" />
          <em className="not-italic text-rainbow">{rainbowWord}</em>
        </h1>

        {/* Subtext editable */}
        <p className="mt-6 text-base sm:text-lg text-ink-muted font-normal max-w-xl mx-auto leading-relaxed">
          {descText}
        </p>

        {/* Feature pills dinámicos (agregar, editar, eliminar) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-ink-muted">
          {featuresList.map((feat, idx) => {
            const { icon, text } = getFeatureIconAndCleanText(feat);
            return (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 bg-canvas border border-hairline rounded-tag px-3.5 py-1.5 shadow-subtle hover:border-slate-300 transition-colors"
              >
                {icon}
                <span>{text}</span>
              </span>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Primary — rainbow outline (Portrait style, 1 per view) */}
          <a
            href="#catalogo"
            className="relative inline-flex items-center justify-center font-bold text-sm text-ink px-8 py-3.5 rounded-btn overflow-hidden group"
            style={{ background: "white" }}
          >
            {/* Rainbow border via pseudo-element */}
            <span
              className="absolute inset-0 rounded-btn"
              style={{
                background:
                  "linear-gradient(90deg,#26c0ff,#e600c2 20%,#ff4940 40%,#ffa130 60%,#ffc837 80%,#00cc3d)",
                padding: "1.5px",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />
            Ver Catálogo
          </a>

          {/* Secondary — filled emerald */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald hover:bg-emerald-hover text-white font-bold px-8 py-3.5 rounded-btn shadow-portrait transition-all active:scale-95 text-sm"
          >
            <WhatsAppIcon className="w-4 h-4" />
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
