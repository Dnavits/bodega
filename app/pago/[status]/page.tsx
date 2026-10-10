"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon, AlertCircleIcon, ClockIcon } from "@/components/Icons";

const ESTADOS = {
  exitoso: {
    icon: CheckCircleIcon,
    color: "text-emerald",
    bg: "bg-mint",
    border: "border-emerald/20",
    titulo: "¡Pago exitoso!",
    mensaje: "Tu pedido fue recibido y está siendo preparado. Te contactaremos pronto para coordinar la entrega.",
    badge: "Pago Aprobado",
    badgeColor: "bg-emerald/10 text-emerald",
  },
  fallido: {
    icon: AlertCircleIcon,
    color: "text-danger",
    bg: "bg-danger-soft",
    border: "border-danger/20",
    titulo: "Pago no completado",
    mensaje: "No pudimos procesar tu pago. No se realizó ningún cobro. Puedes intentarlo de nuevo o elegir otro método de pago.",
    badge: "Pago Rechazado",
    badgeColor: "bg-danger-soft text-danger",
  },
  pendiente: {
    icon: ClockIcon,
    color: "text-warning",
    bg: "bg-warning-soft",
    border: "border-warning/20",
    titulo: "Pago en revisión",
    mensaje: "Tu pago está siendo procesado. Esto puede tardar unos minutos. Te notificaremos cuando se confirme.",
    badge: "Pago Pendiente",
    badgeColor: "bg-warning-soft text-warning",
  },
};

export default function PagoStatusPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = (params?.status as string) || "fallido";

  const estado = ESTADOS[status as keyof typeof ESTADOS] || ESTADOS.fallido;
  const Icon = estado.icon;

  const paymentId = searchParams.get("payment_id");
  const preferenceId = searchParams.get("preference_id");
  const externalRef = searchParams.get("external_reference");

  // Redirigir automáticamente al inicio después de 30s en éxito
  const [countdown, setCountdown] = useState(status === "exitoso" ? 30 : 0);
  useEffect(() => {
    if (status !== "exitoso" || countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [status, countdown]);

  useEffect(() => {
    if (countdown === 0 && status === "exitoso") {
      router.push("/");
    }
  }, [countdown, status, router]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-canvas rounded-2xl border border-hairline shadow-card-hover p-8 text-center">

        {/* Icono de estado */}
        <div className={`w-16 h-16 rounded-2xl ${estado.bg} border ${estado.border} flex items-center justify-center mx-auto mb-5`}>
          <Icon className={`w-8 h-8 ${estado.color}`} />
        </div>

        {/* Badge */}
        <span className={`inline-block text-[10px] font-bold uppercase tracking-eyebrow px-3 py-1 rounded-tag ${estado.badgeColor} mb-3`}>
          {estado.badge}
        </span>

        {/* Título */}
        <h1 className="font-inter font-black text-2xl text-ink mb-2">
          {estado.titulo}
        </h1>

        {/* Mensaje */}
        <p className="text-sm text-ink-muted leading-relaxed mb-6">
          {estado.mensaje}
        </p>

        {/* Info de la transacción */}
        {paymentId && (
          <div className="bg-surface border border-hairline rounded-xl p-4 text-left mb-6 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-eyebrow text-ink-muted mb-2">
              Detalle de la transacción
            </p>
            <div className="flex justify-between text-xs">
              <span className="text-ink-muted">ID de pago</span>
              <span className="font-mono font-bold text-ink">MP-{paymentId}</span>
            </div>
            {preferenceId && (
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Referencia</span>
                <span className="font-mono text-ink-faint text-[10px]">
                  {preferenceId.slice(0, 16)}...
                </span>
              </div>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="space-y-2.5">
          <Link
            href="/"
            className="block w-full py-3 bg-ink hover:bg-ink-light text-white text-sm font-bold rounded-xl shadow-portrait transition-all active:scale-95"
          >
            {status === "exitoso" ? `Volver a la tienda ${countdown > 0 ? `(${countdown}s)` : ""}` : "Intentar de nuevo"}
          </Link>

          {status === "fallido" && (
            <button
              onClick={() => router.back()}
              className="block w-full py-2.5 text-xs text-ink-muted hover:text-ink transition-colors"
            >
              Volver al carrito
            </button>
          )}
        </div>

        {/* Nota de soporte */}
        <p className="text-[10px] text-ink-faint mt-5">
          ¿Problemas? Escríbenos por WhatsApp con tu ID de pago.
        </p>
      </div>
    </div>
  );
}
