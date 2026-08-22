import { WaveDivider } from "./WaveDivider";

export function Contacto() {
  return (
    <section id="contacto" className="relative">
      <WaveDivider color="#0F6E56" flip />
      <div className="bg-bottle-dark text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
          <div>
            <h2 className="font-display font-bold text-2xl mb-3">Contáctanos</h2>
            <p className="text-white/80 text-sm">
              ¿Dudas sobre tu pedido o quieres surtir tu negocio? Escríbenos.
            </p>
          </div>
          <div className="text-sm space-y-3">
            <p className="flex items-center gap-2"><i className="ti ti-brand-whatsapp" aria-hidden="true" /> +57 300 000 0000</p>
            <p className="flex items-center gap-2"><i className="ti ti-map-pin" aria-hidden="true" /> Medellín, Antioquia</p>
            <p className="flex items-center gap-2"><i className="ti ti-clock" aria-hidden="true" /> Lun a sáb, 8:00 am - 8:00 pm</p>
          </div>
          <div className="text-sm">
            <p className="text-white/60">
              Bodega Dnavits © {new Date().getFullYear()}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
