"use client";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";

type Paso = 1 | 2 | 3 | 4;

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [paso, setPaso] = useState<Paso>(1);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Paso 1: domicilio
  const [texto, setTexto] = useState("");
  const [detalle, setDetalle] = useState("");
  const [barrio, setBarrio] = useState("");
  const [ciudad, setCiudad] = useState("Medellín");

  // Paso 2: contacto + verificacion
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [codigoDev, setCodigoDev] = useState("");

  // Paso 4: resultado
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const wompiListo = Boolean(process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY);

  function continuarDomicilio() {
    setError("");
    if (!texto.trim() || !barrio.trim() || !ciudad.trim()) {
      setError("Completa dirección, barrio y ciudad.");
      return;
    }
    setPaso(2);
  }

  async function enviarCodigo() {
    setError("");
    if (!nombre || !apellido || !telefono || !email.includes("@")) {
      setError("Completa todos los campos con un correo válido.");
      return;
    }
    setCargando(true);
    const res = await fetch("/api/verificacion/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    setCargando(false);
    if (!res.ok) {
      setError(data.error || "No se pudo enviar el código.");
      return;
    }
    setCodigoEnviado(true);
    if (data.codigoDev) setCodigoDev(data.codigoDev);
  }

  async function confirmarCodigo() {
    setError("");
    setCargando(true);
    const res = await fetch("/api/verificacion/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, codigo })
    });
    const data = await res.json();
    setCargando(false);
    if (!res.ok) {
      setError(data.error || "Código incorrecto.");
      return;
    }
    setPaso(3);
  }

  async function confirmarPedido() {
    setError("");
    setCargando(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        direccion: { nombre, apellido, telefono, email, texto, detalle, barrio, ciudad }
      })
    });
    const data = await res.json();
    setCargando(false);
    if (!res.ok) {
      setError(data.error || "Ocurrió un error, intenta de nuevo.");
      return;
    }
    setPedidoId(data.pedidoId);
    setPaso(4);
  }

  if (items.length === 0 && !pedidoId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-cream px-6">
        <p className="text-charcoal/60">Tu carrito está vacío.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-5 md:px-6 py-10 md:py-16">
      <div className="max-w-md mx-auto bg-white border border-charcoal/10 rounded-2xl p-6 md:p-8">
        {paso < 4 && (
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= paso ? "bg-bottle" : "bg-charcoal/10"}`} />
            ))}
          </div>
        )}

        {paso === 1 && (
          <div>
            <h1 className="font-display font-bold text-2xl mb-1">Domicilio</h1>
            <p className="text-sm text-charcoal/60 mb-5">¿A dónde te llevamos el pedido?</p>

            <div className="space-y-3 mb-4">
              <input placeholder="Dirección (calle, número)" value={texto} onChange={(e) => setTexto(e.target.value)} className="w-full border border-charcoal/20 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Edificio / Casa / Torre / Apto / Interior" value={detalle} onChange={(e) => setDetalle(e.target.value)} className="w-full border border-charcoal/20 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Barrio / Sector *" value={barrio} onChange={(e) => setBarrio(e.target.value)} className="w-full border border-charcoal/20 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Ciudad *" value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="w-full border border-charcoal/20 rounded-lg px-3 py-2 text-sm" />
            </div>

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <button onClick={continuarDomicilio} className="w-full bg-bottle hover:bg-bottle-dark transition-colors text-white font-semibold py-2.5 rounded-full">
              Continuar
            </button>
          </div>
        )}

        {paso === 2 && (
          <div>
            <h1 className="font-display font-bold text-2xl mb-1">Tus datos</h1>
            <p className="text-sm text-charcoal/60 mb-5">Para confirmarte el pedido.</p>

            <div className="space-y-3 mb-2">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={codigoEnviado} className="border border-charcoal/20 rounded-lg px-3 py-2 text-sm disabled:bg-charcoal/5" />
                <input placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} disabled={codigoEnviado} className="border border-charcoal/20 rounded-lg px-3 py-2 text-sm disabled:bg-charcoal/5" />
              </div>
              <input placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} disabled={codigoEnviado} className="w-full border border-charcoal/20 rounded-lg px-3 py-2 text-sm disabled:bg-charcoal/5" />
              <input placeholder="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={codigoEnviado} className="w-full border border-charcoal/20 rounded-lg px-3 py-2 text-sm disabled:bg-charcoal/5" />
            </div>

            {!codigoEnviado ? (
              <button onClick={enviarCodigo} disabled={cargando} className="w-full mt-3 bg-bottle hover:bg-bottle-dark transition-colors text-white font-semibold py-2.5 rounded-full disabled:opacity-60">
                {cargando ? "Enviando..." : "Enviar código de verificación"}
              </button>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-charcoal/70 mb-2">
                  Te enviamos un código a {email}. Ingrésalo para continuar.
                </p>
                {codigoDev && (
                  <p className="text-xs bg-bubble/30 border border-bubble rounded-lg p-2 mb-2">
                    Modo prueba (Resend no configurado aún): tu código es <strong>{codigoDev}</strong>
                  </p>
                )}
                <input
                  placeholder="Código de 6 dígitos"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  maxLength={6}
                  className="w-full border border-charcoal/20 rounded-lg px-3 py-2 text-sm mb-3 tracking-widest text-center"
                />
                <button onClick={confirmarCodigo} disabled={cargando} className="w-full bg-bottle hover:bg-bottle-dark transition-colors text-white font-semibold py-2.5 rounded-full disabled:opacity-60">
                  {cargando ? "Verificando..." : "Verificar y continuar"}
                </button>
              </div>
            )}
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            <button onClick={() => setPaso(1)} className="w-full text-sm text-charcoal/60 mt-4">← Cambiar domicilio</button>
          </div>
        )}

        {paso === 3 && (
          <div>
            <h1 className="font-display font-bold text-2xl mb-5">Resumen del pedido</h1>

            <div className="space-y-1 text-sm text-charcoal/80 mb-4">
              <p><span className="text-charcoal/50">Nombre:</span> {nombre} {apellido}</p>
              <p><span className="text-charcoal/50">Teléfono:</span> {telefono}</p>
              <p><span className="text-charcoal/50">Correo:</span> {email}</p>
              <p><span className="text-charcoal/50">Dirección:</span> {texto}{detalle ? `, ${detalle}` : ""}, {barrio}, {ciudad}</p>
            </div>

            <div className="space-y-1.5 text-sm border-t border-charcoal/10 pt-3 mb-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.cantidad}x {item.nombre}</span>
                  <span>${(item.precio * item.cantidad).toLocaleString("es-CO")}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm font-medium pt-2 border-t border-charcoal/10 mb-5">
              <span>Total</span>
              <span>${total.toLocaleString("es-CO")}</span>
            </div>

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setPaso(1)} className="flex-1 border border-charcoal/20 text-charcoal font-semibold py-2.5 rounded-full text-sm">
                Cambiar domicilio
              </button>
              <button onClick={confirmarPedido} disabled={cargando} className="flex-1 bg-soda hover:bg-soda-dark transition-colors text-white font-semibold py-2.5 rounded-full text-sm disabled:opacity-60">
                {cargando ? "Enviando..." : "Continuar con el pago"}
              </button>
            </div>
          </div>
        )}

        {paso === 4 && pedidoId && (
          <div>
            <h1 className="font-display font-bold text-2xl mb-2">Un último paso</h1>
            <p className="text-sm text-charcoal/70 mb-5">
              Pedido #{pedidoId.slice(0, 8)} registrado por ${total.toLocaleString("es-CO")}.
              Te enviamos la confirmación a {email}.
            </p>

            {wompiListo ? (
              <button className="w-full bg-soda hover:bg-soda-dark transition-colors text-white font-semibold py-2.5 rounded-full">
                Pagar con Wompi
              </button>
            ) : (
              <div className="text-sm bg-bubble/30 border border-bubble rounded-lg p-4 text-charcoal/80">
                El pago con tarjeta, PSE y Bancolombia se activa aquí en cuanto agregues
                tus llaves de Wompi. Tu pedido queda registrado como pendiente de pago,
                y llega en 1 a 2 días hábiles una vez se confirme.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
