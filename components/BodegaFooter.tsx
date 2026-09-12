import { BeerIcon, WhatsAppIcon } from "@/components/Icons";
import { WHATSAPP_NUMBER, BODEGA_CIUDAD } from "@/lib/constants";

interface BodegaFooterProps {
  nombreBodega?: string | null;
  whatsapp?: string | null;
  telefono?: string | null;
  direccion?: string | null;
}

export function BodegaFooter({ nombreBodega, whatsapp, telefono, direccion }: BodegaFooterProps) {
  const wa = whatsapp || WHATSAPP_NUMBER;
  const waUrl = `https://wa.me/${wa}`;
  const nombre = nombreBodega || "Bodega Dnavits";

  return (
    <footer id="contacto" className="bg-surface border-t border-hairline text-ink-muted pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Marca y Misión */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center text-white font-black shadow-portrait">
                <BeerIcon className="w-5 h-5 text-white" />
              </div>
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
                <a href="/login" className="hover:text-ink transition-colors">
                  Acceso Administrador / Clientes
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-ink transition-colors">
                  Dashboard de Control
                </a>
              </li>
              <li>
                <a href="/checkout" className="hover:text-ink transition-colors">
                  Finalizar Pedido
                </a>
              </li>
            </ul>
          </div>

          {/* Domicilios & WhatsApp */}
          <div>
            <h4 className="font-inter font-bold text-xs uppercase tracking-eyebrow text-ink mb-4">
              Atención Inmediata
            </h4>
            <div className="space-y-3 text-xs">
              <p>📍 {direccion || `${BODEGA_CIUDAD}, Antioquia (Valle de Aburrá)`}</p>
              <p>⏰ Lunes a Domingo: 9:00 AM - 11:00 PM</p>
              {telefono && <p>📞 Teléfono: {telefono}</p>}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-soft text-emerald font-bold px-3 py-2 rounded-btn border border-emerald/20 hover:bg-emerald hover:text-white transition-all text-xs"
              >
                <WhatsAppIcon className="w-4 h-4" />
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
