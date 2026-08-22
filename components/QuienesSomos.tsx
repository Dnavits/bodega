export function QuienesSomos() {
  return (
    <section id="quienes-somos" className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-soda font-semibold text-sm">Quiénes somos</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-2 mb-5">
            Una bodega de barrio, ahora también en tu pantalla
          </h2>
          <p className="text-charcoal/80 leading-relaxed mb-4">
            Llevamos años surtiendo a nuestros vecinos con las gaseosas y bebidas de
            siempre, al precio justo y con la atención que solo da conocer a cada cliente
            por su nombre.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            Ahora abrimos las puertas de la bodega en línea: mismo surtido, misma
            confianza, un clic más cerca de tu casa.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=1200&auto=format&fit=crop"
            alt="Interior de una tienda de barrio con estantes de bebidas"
            className="w-full h-80 object-cover"
          />
        </div>
      </div>
    </section>
  );
}
