import Link from "next/link";

export const revalidate = 86400;

export default function TerminosPage() {
  return (
    <div className="bg-canvas min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-surface rounded-2xl shadow-card p-8 border border-hairline">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-ink-muted hover:text-ink transition-colors"
          >
            &larr; Volver a la tienda
          </Link>
        </div>
        
        <h1 className="text-3xl font-black text-ink tracking-tight mb-8">
          Términos y Condiciones
        </h1>

        <div className="prose prose-sm sm:prose-base prose-slate max-w-none text-ink-muted space-y-6">
          <section>
            <h2 className="text-xl font-bold text-ink mb-3">1. Identidad del Responsable</h2>
            <p>
              Los presentes términos y condiciones regulan el uso del servicio de <strong>Bodega Dnavits</strong>,
              ubicada en Medellín, Colombia. Al acceder y realizar pedidos a través de nuestro sitio web, usted
              acepta estos términos en su totalidad, en conformidad con la legislación colombiana (Ley 1581 de 2012, Ley 1480 de 2011 Estatuto del Consumidor).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">2. Objeto del Servicio</h2>
            <p>
              Bodega Dnavits es una plataforma de venta y distribución de bebidas (gaseosas, cervezas, licores y aguas) 
              a domicilio. Nuestro catálogo está sujeto a disponibilidad de inventario en el momento de la confirmación del pedido.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">3. Condiciones de Compra y Entrega</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Zona de cobertura:</strong> Los pedidos solo se entregan dentro del área metropolitana de Medellín y el Valle de Aburrá.</li>
              <li><strong>Tiempos de entrega:</strong> Las entregas se realizan típicamente en un plazo de 1 a 2 días hábiles tras la confirmación del pago.</li>
              <li>Nos reservamos el derecho de cancelar pedidos que se encuentren fuera de nuestra zona de cobertura.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">4. Métodos de Pago</h2>
            <p>
              Aceptamos los siguientes métodos de pago para su comodidad:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Nequi</li>
              <li>Efectivo (pago contra entrega)</li>
              <li>Transferencia bancaria</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">5. Restricción de Edad</h2>
            <p>
              En cumplimiento con la <strong>Ley 124 de 1994</strong> de la República de Colombia, prohíbese el expendio de bebidas embriagantes a menores de edad. 
              El exceso de alcohol es perjudicial para la salud. Al comprar licores o cervezas en nuestra tienda, usted declara que es mayor de 18 años. 
              El repartidor podrá exigir el documento de identidad al momento de la entrega.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">6. Cancelaciones y Devoluciones</h2>
            <p>
              Conforme al Estatuto del Consumidor, los usuarios tienen derecho al retracto en un plazo de 5 días hábiles, siempre y cuando 
              los productos no sean perecederos, no hayan sido abiertos o consumidos y mantengan sus sellos originales.
              Las devoluciones deben ser reportadas a través de nuestro canal de WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">7. Responsabilidad Limitada</h2>
            <p>
              Bodega Dnavits no se hace responsable por retrasos en las entregas causados por situaciones de fuerza mayor (condiciones climáticas extremas, problemas de orden público, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">8. Modificaciones a los Términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigencia inmediatamente después de su publicación en este sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">9. Ley Aplicable y Jurisdicción</h2>
            <p>
              Estos términos y condiciones se rigen e interpretan de acuerdo con las leyes de la República de Colombia.
              Cualquier disputa o controversia será sometida a la jurisdicción de los tribunales de la ciudad de Medellín.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
