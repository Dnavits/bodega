"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { BeerIcon, WhatsAppIcon, CheckIcon } from "@/components/Icons";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [barrio, setBarrio] = useState("");
  const [notas, setNotas] = useState("");
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "nequi" | "transferencia">("efectivo");
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !telefono || !direccion || !barrio) {
      alert("Por favor completa los campos requeridos de entrega.");
      return;
    }

    const itemsTexto = items
      .map((i) => `• ${i.cantidad}x ${i.nombre} ($${(i.precio * i.cantidad).toLocaleString("es-CO")})`)
      .join("%0A");

    const mensaje = `Hola Bodega Dnavits 🍻, quiero confirmar mi pedido para entrega a domicilio:%0A%0A*DATOS DE ENTREGA:*%0A👤 Nombre: ${nombre}%0A📞 Teléfono: ${telefono}%0A📍 Dirección: ${direccion} (${barrio}, Medellín)%0A💵 Método de Pago: ${metodoPago.toUpperCase()}%0A📝 Notas: ${notas || "Ninguna"}%0A%0A*PRODUCTOS:*%0A${itemsTexto}%0A%0A*TOTAL A PAGAR: $${total.toLocaleString("es-CO")}*%0A%0A¿Me confirman recepción y tiempo de envío?`;

    window.open(`https://wa.me/573019519391?text=${mensaje}`, "_blank");
    setEnviado(true);
  }

  if (items.length === 0 && !enviado) {
    return (
      <main className="min-h-screen bg-vault-950 flex items-center justify-center p-6 text-foam">
        <div className="max-w-md w-full bg-vault-900 border border-vault-800 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber/15 text-amber mx-auto flex items-center justify-center mb-4">
            <BeerIcon className="w-7 h-7" />
          </div>
          <h1 className="font-roboto font-black text-2xl text-foam mb-2">Tu Carrito está Vacío</h1>
          <p className="text-xs text-vault-100/60 mb-6">
            Agrega tus bebidas frías, cervezas o licores favoritos antes de pagar.
          </p>
          <Link
            href="/"
            className="block w-full py-3.5 bg-amber hover:bg-amber-dark text-vault-950 font-black rounded-xl text-sm transition-all shadow-md"
          >
            Ir al Catálogo de Bebidas
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-vault-950 py-12 px-4 sm:px-6 lg:px-8 text-foam">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-amber-light text-xs font-bold mb-3 hover:underline">
            ← Volver a la Bodega
          </Link>
          <h1 className="font-roboto font-black text-3xl sm:text-4xl text-foam tracking-tight">
            Finalizar tu Pedido
          </h1>
          <p className="text-xs text-vault-100/60 mt-1">
            Entrega express en menos de 45 minutos en Medellín.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Formulario de Entrega (7 cols) */}
          <form onSubmit={handleSubmit} className="md:col-span-7 bg-vault-900 border border-vault-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <h2 className="font-roboto font-bold text-base text-foam border-b border-vault-800 pb-3">
              Datos de Domicilio
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase text-vault-100/70 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre y apellido"
                className="w-full bg-vault-950 border border-vault-800 focus:border-amber rounded-xl px-4 py-2.5 text-sm text-foam placeholder-vault-100/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-vault-100/70 mb-1">Teléfono WhatsApp *</label>
              <input
                type="tel"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="301 000 0000"
                className="w-full bg-vault-950 border border-vault-800 focus:border-amber rounded-xl px-4 py-2.5 text-sm text-foam placeholder-vault-100/30 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-vault-100/70 mb-1">Dirección *</label>
                <input
                  type="text"
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle / Cra / Apto"
                  className="w-full bg-vault-950 border border-vault-800 focus:border-amber rounded-xl px-4 py-2.5 text-sm text-foam placeholder-vault-100/30 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-vault-100/70 mb-1">Barrio / Sector *</label>
                <input
                  type="text"
                  required
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  placeholder="Laureles, Poblado, etc."
                  className="w-full bg-vault-950 border border-vault-800 focus:border-amber rounded-xl px-4 py-2.5 text-sm text-foam placeholder-vault-100/30 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-vault-100/70 mb-1">Método de Pago Preferido</label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(["efectivo", "nequi", "transferencia"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMetodoPago(m)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border capitalize transition-colors ${
                      metodoPago === m
                        ? "bg-amber text-vault-950 border-amber"
                        : "bg-vault-950 text-vault-100/70 border-vault-800 hover:border-vault-700"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-vault-100/70 mb-1">Instrucciones o Notas Especiales</label>
              <textarea
                rows={2}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="¿Con cuánto vas a pagar? ¿Alguna marca específica?"
                className="w-full bg-vault-950 border border-vault-800 focus:border-amber rounded-xl px-4 py-2 text-xs text-foam placeholder-vault-100/30 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald hover:bg-emerald-hover text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 text-sm"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>Enviar Pedido por WhatsApp</span>
            </button>
          </form>

          {/* Resumen del Carrito (5 cols) */}
          <div className="md:col-span-5 bg-vault-900 border border-vault-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="font-roboto font-bold text-base text-foam border-b border-vault-800 pb-3">
              Resumen del Pedido
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-foam">{i.nombre}</p>
                    <p className="text-vault-100/50">{i.cantidad} x ${i.precio.toLocaleString("es-CO")}</p>
                  </div>
                  <span className="font-roboto font-bold text-amber-light">
                    ${(i.precio * i.cantidad).toLocaleString("es-CO")}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-vault-800 space-y-1.5 text-xs text-vault-100/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-foam">${total.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between">
                <span>Domicilio Express</span>
                <span className="text-emerald-light font-bold">Por calcular según barrio</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foam pt-2 border-t border-vault-800">
                <span>Total Estimado</span>
                <span className="font-roboto font-black text-amber-light text-base">${total.toLocaleString("es-CO")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
