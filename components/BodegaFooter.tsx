import { BeerIcon, WhatsAppIcon } from "@/components/Icons";

export function BodegaFooter() {
  return (
    <footer id="contacto" className="bg-vault-950 border-t border-vault-800 text-vault-100/70 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Marca y Misión */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber flex items-center justify-center text-vault-950 font-black">
                <BeerIcon className="w-6 h-6 text-vault-950" />
              </div>
              <span className="font-roboto font-black text-xl text-foam tracking-tight">
                BODEGA DNAVITS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-vault-100/60 leading-relaxed max-w-sm">
              Tu distribuidora y bodega de bebidas de confianza en Medellín. Gaseosas por unidad y paca, cervezas nacionales e importadas, aguas purificadas y licores para eventos, tiendas y hogares.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="font-roboto font-bold text-xs uppercase tracking-wider text-foam mb-4">
              Enlaces
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#catalogo" className="hover:text-amber-light transition-colors">
                  Catálogo de Gaseosas
                </a>
              </li>
              <li>
                <a href="#catalogo" className="hover:text-amber-light transition-colors">
                  Cervezas & Licores
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-amber-light transition-colors">
                  Acceso Administrador / Clientes
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-amber-light transition-colors">
                  Dashboard de Control
                </a>
              </li>
            </ul>
          </div>

          {/* Domicilios & WhatsApp */}
          <div>
            <h4 className="font-roboto font-bold text-xs uppercase tracking-wider text-foam mb-4">
              Atención Inmediata
            </h4>
            <div className="space-y-3 text-xs">
              <p>📍 Medellín, Antioquia (Valle de Aburrá)</p>
              <p>⏰ Lunes a Domingo: 9:00 AM - 11:00 PM</p>
              <a
                href="https://wa.me/573019519391"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald/20 border border-emerald/40 text-emerald-light font-bold px-3 py-2 rounded-xl hover:bg-emerald/30 transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>+57 301 951 9391</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-vault-800 text-center text-xs text-vault-100/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Bodega Dnavits. Todos los derechos reservados.</p>
          <p>Medellín, Colombia · Distribución de Bebidas</p>
        </div>
      </div>
    </footer>
  );
}
