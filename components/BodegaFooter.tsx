import { BeerIcon, WhatsAppIcon } from "@/components/Icons";
import { WHATSAPP_NUMBER, BODEGA_CIUDAD } from "@/lib/constants";

interface BodegaFooterProps {
  nombreBodega?: string | null;
  logoUrl?:      string | null;
  whatsapp?:     string | null;
  telefono?:     string | null;
  direccion?:    string | null;
  horarioTexto?: string | null;
  horarioInicio?: string | null;
  horarioFin?:   string | null;
}

export function BodegaFooter({
  nombreBodega,
  logoUrl,
  whatsapp,
  telefono,
  direccion,
  horarioTexto,
  horarioInicio,
  horarioFin,
}: BodegaFooterProps) {
  const wa = whatsapp || WHATSAPP_NUMBER;
  const nombre = (nombreBodega || "Bodega Dnavits").trim();
  const waMsg = encodeURIComponent(`Hola ${nombre} 🍻, deseo hacer una consulta sobre sus bebidas.`);
  const waUrl = `https://wa.me/${wa}?text=${waMsg}`;

  let abierto = true;
  if (horarioInicio && horarioFin) {
    const ahora = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
    const horaActual = ahora.getHours() + ahora.getMinutes() / 60;
    
    const [hInicio, mInicio] = horarioInicio.split(':').map(Number);
    const [hFin, mFin] = horarioFin.split(':').map(Number);
    const inicioDecimal = hInicio + (mInicio || 0) / 60;
    const finDecimal = hFin + (mFin || 0) / 60;

    if (finDecimal < inicioDecimal) {
      abierto = horaActual >= inicioDecimal || horaActual <= finDecimal;
    } else {
      abierto = horaActual >= inicioDecimal && horaActual <= finDecimal;
    }
  }

  return (
    <footer id="contacto" className="bg-surface border-t border-hairline text-ink-muted pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Marca y Misión */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={nombre}
                  className="h-10 w-auto max-w-[120px] rounded-xl object-contain bg-canvas border border-hairline p-1 shadow-portrait"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center text-white font-black shadow-portrait">
                  <BeerIcon className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="font-inter font-black text-xl text-ink tracking-tight uppercase">
                {nombre}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-sm">
              Tu distribuidora y bodega de bebidas de confianza en Medellín. Gaseosas por unidad y paca, cervezas nacionales e importadas, aguas purificadas y licores para eventos, tiendas y hogares.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="font-inter font-bold text-xs uppercase tracking-eyebrow text-ink mb-4">
              Enlaces
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#catalogo" className="hover:text-ink transition-colors">
                  Catálogo de Bebidas
                </a>
              </li>
              <li>
                <a href="/checkout" className="hover:text-ink transition-colors">
                  Finalizar Pedido
                </a>
              </li>
              <li>
                <a href="/terminos" className="hover:text-ink transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="/privacidad" className="hover:text-ink transition-colors">
                  Políticas de Privacidad
                </a>
              </li>
            </ul>
          </div>

          {/* Domicilios & WhatsApp */}
          <div>
            <h4 className="font-inter font-bold text-xs uppercase tracking-eyebrow text-ink mb-4">
              Atención Inmediata
            </h4>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-sky text-accent flex items-center justify-center shrink-0 mt-0.5 shadow-subtle">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span className="leading-tight pt-1">
                  {direccion || `${BODEGA_CIUDAD}, Antioquia (Valle de Aburrá)`}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 shadow-subtle">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="leading-tight pt-1">
                    {horarioTexto || "Lunes a Domingo: 9:00 AM - 11:00 PM"}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-pill text-[10px] font-bold w-fit ${abierto ? "bg-mint text-emerald" : "bg-danger-soft text-danger"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${abierto ? "bg-emerald" : "bg-danger"}`} />
                    {abierto ? "Abierto Ahora" : "Cerrado"}
                  </span>
                </div>
              </div>

              {telefono && (
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-subtle">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .13h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </div>
                  <span>{telefono}</span>
                </div>
              )}

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald hover:bg-emerald-hover text-white font-bold px-3.5 py-2.5 rounded-btn shadow-portrait transition-all active:scale-95 text-xs mt-2"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>WhatsApp: +{wa}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-divider text-center text-xs text-ink-faint flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {nombre}. Todos los derechos reservados.</p>
          <p>{BODEGA_CIUDAD}, Colombia · Distribución de Bebidas</p>
        </div>
      </div>
    </footer>
  );
}
