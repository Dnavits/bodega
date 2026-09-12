"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { BeerIcon, WhatsAppIcon, CheckIcon } from "@/components/Icons";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [barrio, setBarrio] = useState("");
  const [notas, setNotas] = useState("");
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "nequi" | "transferencia">("efectivo");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [pedidoConfirmado, setPedidoConfirmado] = useState<{
    id: string;
    numeroOrden?: number;
    total: number;
  } | null>(null);
  const [configBodega, setConfigBodega] = useState<{
    nombre: string;
    whatsapp: string;
  }>({
    nombre: "Bodega Dnavits",
    whatsapp: WHATSAPP_NUMBER,
  });

  useEffect(() => {
    async function cargarConfig() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("configuracion")
          .select("nombre_bodega, whatsapp_pedidos")
          .limit(1)
          .maybeSingle();

        if (data) {
          setConfigBodega({
            nombre: data.nombre_bodega?.trim() || "Bodega Dnavits",
            whatsapp: data.whatsapp_pedidos?.trim() || WHATSAPP_NUMBER,
          });
        }
      } catch (err) {
        console.error("Error al cargar configuración de bodega en checkout:", err);
      }
    }
    cargarConfig();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !telefono.trim() || !direccion.trim() || !barrio.trim()) {
      setError("Por favor completa los datos de entrega requeridos.");
      return;
    }

    setCargando(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          direccion: {
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            email: email.trim() || null,
            texto: direccion.trim(),
            barrio: barrio.trim(),
            ciudad: "Medellín",
          },
          metodo_pago: metodoPago,
          notas: notas.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo procesar el pedido.");
      }

      setPedidoConfirmado({
        id: data.pedidoId,
        numeroOrden: data.numeroOrden,
        total: data.total || total,
      });

      clearCart();
    } catch (err: any) {
      setError(err.message || "Error al registrar el pedido.");
    } finally {
      setCargando(false);
    }
  }

  function handleAbrirWhatsApp() {
    if (!pedidoConfirmado) return;
    const ordenStr = pedidoConfirmado.numeroOrden
      ? `#${pedidoConfirmado.numeroOrden}`
      : `#${pedidoConfirmado.id.slice(0, 6)}`;

    const bodegaNombre = configBodega.nombre || "Bodega Dnavits";
    const waDestino = configBodega.whatsapp || WHATSAPP_NUMBER;

    const mensaje = encodeURIComponent(
      `Hola ${bodegaNombre} 🍻, acabo de registrar mi pedido ${ordenStr}:\n\n*DATOS:*\n👤 ${nombre}\n📞 ${telefono}\n📍 ${direccion} (${barrio})\n💵 Pago: ${metodoPago.toUpperCase()}\n\n*Total: $${pedidoConfirmado.total.toLocaleString("es-CO")}*\n\n¿Me confirman tiempo de llegada?`
    );

    window.open(`https://wa.me/${waDestino}?text=${mensaje}`, "_blank");
  }

  // ── Pantalla de Pedido Confirmado ──
  if (pedidoConfirmado) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center p-6 text-ink">
        <div className="max-w-md w-full bg-canvas border border-hairline rounded-card p-8 sm:p-10 text-center shadow-card animate-fade-in-up">
          <div className="w-16 h-16 rounded-card bg-mint text-emerald mx-auto flex items-center justify-center mb-5 shadow-portrait">
            <span className="text-2xl">✓</span>
          </div>
          <span className="text-xs uppercase font-bold text-accent tracking-eyebrow">
            Pedido Registrado en Sistema
          </span>
          <h1 className="font-inter font-black text-2xl sm:text-3xl text-ink mt-1 mb-2">
            ¡Pedido {pedidoConfirmado.numeroOrden ? `#${pedidoConfirmado.numeroOrden}` : "Confirmado"}!
          </h1>
          <p className="text-xs text-ink-muted leading-relaxed mb-6">
            Guardamos tu pedido en el sistema de <strong>{configBodega.nombre}</strong>. Ya está listo para ser despachado a <strong>{direccion}, {barrio}</strong>.
          </p>

          <div className="p-4 bg-surface rounded-card border border-hairline text-left mb-6 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-ink-muted">Total a Pagar:</span>
              <strong className="text-ink font-inter font-bold">${pedidoConfirmado.total.toLocaleString("es-CO")}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Método de Pago:</span>
              <strong className="text-ink uppercase font-semibold">{metodoPago}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Tiempo Estimado:</span>
              <strong className="text-emerald font-semibold">&lt; 45 minutos</strong>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAbrirWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-emerald hover:bg-emerald-hover text-white font-bold py-3.5 px-4 rounded-btn shadow-portrait transition-all active:scale-95 text-xs sm:text-sm"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Avisar por WhatsApp para Despacho Express</span>
            </button>
            <Link
              href="/"
              className="block w-full py-2.5 text-xs text-ink-muted hover:text-ink transition-colors font-semibold"
            >
              Volver a la Tienda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Carrito Vacío ──
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center p-6 text-ink">
        <div className="max-w-md w-full bg-canvas border border-hairline rounded-card p-8 text-center shadow-card">
          <div className="w-14 h-14 rounded-card bg-sky text-accent mx-auto flex items-center justify-center mb-4">
            <BeerIcon className="w-7 h-7" />
          </div>
          <h1 className="font-inter font-black text-2xl text-ink mb-2">Tu Carrito está Vacío</h1>
          <p className="text-xs text-ink-muted mb-6">
            Agrega tus bebidas frías, cervezas o licores favoritos antes de pagar.
          </p>
          <Link
            href="/"
            className="block w-full py-3 bg-ink hover:bg-ink-light text-white font-bold rounded-btn text-xs shadow-portrait transition-all"
          >
            Ir al Catálogo de Bebidas
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8 text-ink">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-ink-muted text-xs font-semibold mb-3 hover:text-ink transition-colors">
            ← Volver a la Tienda
          </Link>
          <h1 className="font-inter font-black text-3xl sm:text-4xl text-ink tracking-heading">
            Finalizar tu Pedido
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Entrega express en menos de 45 minutos en Medellín.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Formulario de Entrega (7 cols) */}
          <form onSubmit={handleSubmit} className="md:col-span-7 bg-canvas border border-hairline rounded-card p-6 sm:p-8 shadow-card space-y-4">
            <h2 className="font-inter font-bold text-base text-ink border-b border-divider pb-3">
              Datos de Domicilio
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre y apellido"
                className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="301 000 0000"
                  className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1">
                  Correo (Opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle / Cra / Apto"
                  className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1">
                  Barrio / Sector *
                </label>
                <input
                  type="text"
                  required
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  placeholder="Laureles, Poblado, etc."
                  className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1">
                Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(["efectivo", "nequi", "transferencia"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMetodoPago(m)}
                    className={`py-2 px-2 text-xs font-bold rounded-btn border capitalize transition-all ${
                      metodoPago === m
                        ? "bg-ink text-white border-ink shadow-portrait"
                        : "bg-canvas text-ink-muted border-hairline hover:bg-surface"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-eyebrow text-ink-muted mb-1">
                Instrucciones Especiales (Opcional)
              </label>
              <textarea
                rows={2}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="¿Con cuánto billete pagas? ¿Alguna indicación para el domiciliario?"
                className="w-full bg-canvas border border-hairline focus:border-accent rounded-input px-4 py-2 text-xs text-ink placeholder-ink-faint outline-none resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-danger-soft border border-danger/20 rounded-card text-danger text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-ink hover:bg-ink-light text-white font-bold py-3.5 rounded-btn shadow-portrait transition-all active:scale-95 text-sm disabled:opacity-60"
            >
              <span>{cargando ? "Registrando Pedido..." : "Confirmar y Guardar Pedido"}</span>
            </button>
          </form>

          {/* Resumen del Carrito (5 cols) */}
          <div className="md:col-span-5 bg-canvas border border-hairline rounded-card p-6 shadow-card space-y-4">
            <h2 className="font-inter font-bold text-base text-ink border-b border-divider pb-3">
              Resumen del Pedido
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-ink">{i.nombre}</p>
                    <p className="text-ink-faint">{i.cantidad} x ${i.precio.toLocaleString("es-CO")}</p>
                  </div>
                  <span className="font-inter font-bold text-accent">
                    ${(i.precio * i.cantidad).toLocaleString("es-CO")}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-divider space-y-1.5 text-xs text-ink-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-ink">${total.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between">
                <span>Domicilio Express</span>
                <span className="text-emerald font-semibold">Calculado al entregar</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-ink pt-2 border-t border-divider">
                <span>Total</span>
                <span className="font-inter font-black text-ink text-base">
                  ${total.toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
