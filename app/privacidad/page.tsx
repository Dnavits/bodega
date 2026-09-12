import Link from "next/link";

export const revalidate = 86400;

export default function PrivacidadPage() {
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
          Política de Privacidad
        </h1>

        <div className="prose prose-sm sm:prose-base prose-slate max-w-none text-ink-muted space-y-6">
          <section>
            <h2 className="text-xl font-bold text-ink mb-3">1. Identidad del Responsable</h2>
            <p>
              En cumplimiento de la <strong>Ley 1581 de 2012</strong> (Ley Estatutaria de Protección de Datos Personales) y el <strong>Decreto 1377 de 2013</strong>,
              el responsable del tratamiento de sus datos personales es <strong>Bodega Dnavits</strong>, con domicilio en Medellín, Colombia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">2. Datos que se Recopilan</h2>
            <p>
              Recolectamos únicamente la información necesaria para procesar sus pedidos y mejorar nuestro servicio:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Nombre y apellidos.</li>
              <li>Número de teléfono (fijo o celular).</li>
              <li>Dirección de correo electrónico.</li>
              <li>Dirección física para la entrega de los pedidos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">3. Finalidad del Tratamiento</h2>
            <p>
              Los datos personales recolectados serán utilizados para las siguientes finalidades:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Procesar, confirmar, enviar y facturar sus pedidos.</li>
              <li>Comunicarnos vía WhatsApp o teléfono para coordinar la entrega.</li>
              <li>Enviar promociones, novedades y ofertas especiales (sólo si ha dado su consentimiento).</li>
              <li>Atender quejas, reclamos o sugerencias.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">4. Derechos ARCO del Titular</h2>
            <p>
              Como titular de la información, usted tiene los siguientes derechos (Acceso, Rectificación, Cancelación y Oposición):
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Conocer, actualizar y rectificar sus datos personales.</li>
              <li>Solicitar prueba de la autorización otorgada para el tratamiento de datos.</li>
              <li>Ser informado sobre el uso que se ha dado a sus datos personales.</li>
              <li>Revocar la autorización o solicitar la supresión de sus datos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">5. Almacenamiento y Seguridad</h2>
            <p>
              Los datos recolectados se almacenan utilizando la infraestructura de Supabase, 
              cuyos servidores pueden estar ubicados en los Estados Unidos. 
              Implementamos medidas de seguridad técnicas y administrativas para proteger su información contra 
              pérdida, robo, acceso no autorizado, divulgación, copia, uso o modificación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">6. No Venta de Datos a Terceros</h2>
            <p>
              Bodega Dnavits se compromete a no vender, alquilar ni comercializar su información personal a terceros 
              bajo ninguna circunstancia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">7. Cookies y Tecnologías de Seguimiento</h2>
            <p>
              Utilizamos cookies estrictamente necesarias para el funcionamiento de nuestra tienda en línea 
              (por ejemplo, para mantener los productos en su carrito de compras) y cookies analíticas anónimas 
              para entender cómo se utiliza el sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">8. Contacto para Ejercer Derechos</h2>
            <p>
              Para ejercer sus derechos sobre el tratamiento de sus datos personales, puede comunicarse con nosotros 
              a través de nuestro canal principal de WhatsApp o cualquier medio de contacto proporcionado en la página de inicio de la tienda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-3">9. Vigencia y Actualizaciones</h2>
            <p>
              Esta política de privacidad entra en vigencia a partir de su publicación.
              Nos reservamos el derecho de modificar o actualizar esta política en cualquier momento. 
              Los cambios sustanciales serán comunicados a través de nuestro sitio web.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
