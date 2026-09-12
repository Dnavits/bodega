"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on the client side
    const cookiesAccepted = localStorage.getItem("cookies_accepted");
    if (!cookiesAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = (type: "all" | "essential") => {
    localStorage.setItem("cookies_accepted", type);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-canvas border-t border-hairline shadow-card p-4 sm:p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-ink-muted text-center md:text-left">
          Usamos cookies esenciales para el funcionamiento del sitio. Al continuar navegando aceptas nuestra{" "}
          <Link href="/privacidad" className="text-ink font-semibold hover:underline">
            Política de Privacidad
          </Link>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => handleAccept("essential")}
            className="px-4 py-2 text-sm font-medium text-ink bg-surface border border-hairline rounded-btn hover:bg-canvas transition-colors w-full sm:w-auto text-center"
          >
            Solo esenciales
          </button>
          <button
            onClick={() => handleAccept("all")}
            className="px-4 py-2 text-sm font-medium text-white bg-ink rounded-btn hover:bg-ink/90 transition-colors shadow-portrait w-full sm:w-auto text-center"
          >
            Aceptar todo
          </button>
        </div>
      </div>
    </div>
  );
}
