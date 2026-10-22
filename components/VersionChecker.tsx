"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RefreshCwIcon } from "./Icons";

export function VersionChecker() {
  const [hayNuevaVersion, setHayNuevaVersion] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(10);
  const [actualizando, setActualizando] = useState(false);
  const currentVersionRef = useRef<string | null>(null);

  const recargar = useCallback(() => {
    setActualizando(true);
    try {
      if ("caches" in window) {
        caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
      }
    } catch {}
    (window as any).location.reload();
  }, []);

  useEffect(() => {
    async function checkVersion() {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const nuevaVersion = data.version;

        if (!nuevaVersion) return;

        if (currentVersionRef.current === null) {
          // Primera carga: registramos la versión en la que arrancó el usuario
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

    // 1. Al volver a enfocar la pestaña
    const handleFocus = () => checkVersion();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    // 2. Comprobación periódica cada 45 segundos
    const interval = setInterval(checkVersion, 45 * 1000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Contador regresivo automático de 10 segundos una vez detectada la nueva versión
  useEffect(() => {
    if (!hayNuevaVersion) return;

    const timer = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          recargar();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hayNuevaVersion, recargar]);

  if (!hayNuevaVersion) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-ink text-white text-xs font-semibold px-4 py-3 rounded-card shadow-card-hover border border-white/10 flex items-center gap-3.5 max-w-sm backdrop-blur-md">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
        </span>
        <div className="flex-1 text-[11px] leading-snug">
          <p className="font-bold text-white">Nueva versión disponible</p>
          <p className="text-white/70 text-[10px]">
            Actualizando automáticamente en <strong className="text-accent">{segundosRestantes}s</strong>...
          </p>
        </div>
        <button
          onClick={recargar}
          disabled={actualizando}
          className="bg-accent hover:bg-accent/90 text-white font-bold text-[11px] px-3 py-1.5 rounded-btn flex items-center gap-1.5 transition-transform active:scale-95 shrink-0 disabled:opacity-75"
        >
          <RefreshCwIcon className={`w-3.5 h-3.5 ${actualizando ? "animate-spin" : ""}`} />
          {actualizando ? "Cargando..." : "Actualizar"}
        </button>
      </div>
    </div>
  );
}
