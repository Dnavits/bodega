import { WaveDivider } from "./WaveDivider";

export function Hero() {
  return (
    <section id="inicio" className="relative pt-16">
      <div className="relative h-[85vh] min-h-[520px] w-full overflow-hidden bg-bottle-dark">
        <div className="absolute inset-0 bg-gradient-to-tr from-charcoal/80 via-bottle-dark/50 to-transparent z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1581636625402-29b2a704ef13?q=80&w=1600&auto=format&fit=crop"
          alt="Botellas de gaseosa frías en cajas, listas para despachar"
          className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-overlay"
        />
        <div className="relative z-20 h-full max-w-6xl mx-auto px-5 md:px-6 flex flex-col justify-center items-start">
          <span className="inline-block w-fit bg-bubble/90 backdrop-blur-sm text-soda-dark text-xs md:text-sm font-bold px-5 py-2 rounded-full mb-6 md:mb-8 shadow-sm animate-fade-in-up">
            📍 Domicilios en Medellín
          </span>
          <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl text-white leading-tight max-w-2xl drop-shadow-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Frías, al instante, hasta tu puerta
          </h1>
          <p className="text-white/95 text-lg md:text-xl mt-6 max-w-lg font-medium drop-shadow-md animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Gaseosas, agua y bebidas de tu bodega de confianza, pedidas en un par de clics.
          </p>
          <a
            href="#tienda"
            className="mt-10 w-fit bg-soda hover:bg-soda-dark hover:scale-105 active:scale-95 transition-all duration-300 text-white font-bold px-8 md:px-10 py-4 rounded-full text-base md:text-lg shadow-lg shadow-soda/30 animate-fade-in-up flex items-center gap-2 group"
            style={{ animationDelay: '300ms' }}
          >
            Ver productos
            <i className="ti ti-arrow-right group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
      <WaveDivider color="#FAF7F0" />
    </section>
  );
}
