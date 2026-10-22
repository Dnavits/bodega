"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCwIcon } from "./Icons";

export function VersionChecker() {
  const [hayNuevaVersion, setHayNuevaVersion] = useState(false);
  const currentVersionRef = useRef<string | null>(null);

  useEffect(() => {
    // Si estamos en desarrollo local no hace falta
    if (process.env.NODE_ENV === "development") return;

    async function checkVersion() {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const nuevaVersion = data.version;

        if (!nuevaVersion || nuevaVersion.includes("dev")) return;

        if (currentVersionRef.current === null) {
          // Primera carga: registramos la versión actual en la que está el cliente
          currentVersionRef.current = nuevaVersion;
        } else if (currentVersionRef.current !== nuevaVersion) {
          // Se detectó un nuevo deploy/versión en Vercel
          setHayNuevaVersion(true);
        }
      } catch {
        // Silencioso ante pérdidas de red
      }
    }

    // Comprobar de inmediato
    checkVersion();

    // 1. Comprobar cada vez que el usuario vuelve a enfocar la pestaña (cambió de app y volvió)
    const handleFocus = () => {
      checkVersion();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    // 2. Comprobación periódica cada 2 minutos
    const interval = setInterval(checkVersion, 2 * 60 * 1000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      clearInterval(interval);
    };
  }, []);

  const recargar = () => {
    // Limpiar cachés del navegador y forzar recarga limpia
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    window.location.reload();
  };

  if (!hayNuevaVersion) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-ink text-white text-xs font-semibold px-4 py-3 rounded-card shadow-card-hover border border-white/10 flex items-center gap-3 max-w-sm">
        <span className="w-2 h-2 rounded-full bg-accent animate-ping shrink-0" />
        <span className="flex-1 text-[11px] leading-snug">
          Hay una nueva actualización disponible de la tienda.
        </span>
        <button
          onClick={recargar}
          className="bg-accent hover:bg-accent/90 text-white font-bold text-[11px] px-3 py-1.5 rounded-btn flex items-center gap-1.5 transition-transform active:scale-95 shrink-0"
        >
          <RefreshCwIcon className="w-3.5 h-3.5" />
          Actualizar
        </button>
      </div>
    </div>
  );
}
