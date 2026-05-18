import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y condiciones — INMOALIA',
  description: 'Términos y condiciones de compra de INMOALIA.',
}

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">Términos y condiciones</h1>
      <p className="text-sm text-[#a08c7a] mb-10">Última actualización: mayo de 2025</p>

      <div className="prose prose-neutral max-w-none space-y-8 text-[#2a2a2a]">

        <section>
          <h2 className="text-xl font-semibold mb-3">1. Información general</h2>
          <p className="text-[#6b5344] leading-relaxed">
            INMOALIA es una tienda online de hogar, jardín y decoración premium que opera bajo el modelo de dropshipping.
            El titular es INMOALIA S.L., con CIF B54560943 y domicilio social en España. Al realizar una compra en nuestro sitio web aceptas estos términos y condiciones en su totalidad.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Proceso de compra</h2>
          <p className="text-[#6b5344] leading-relaxed">
            Para realizar un pedido debes añadir los productos al carrito, facilitar tu dirección de entrega y efectuar el pago a través de la pasarela segura de Stripe.
            Recibirás un email de confirmación una vez procesado el pago. El contrato de compraventa se perfecciona en el momento en que recibes dicha confirmación.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Precios y pagos</h2>
          <p className="text-[#6b5344] leading-relaxed">
            Todos los precios se muestran en euros (€) e incluyen el IVA aplicable. El envío es gratuito para pedidos iguales o superiores a 600 €. En pedidos inferiores, los gastos de envío se calculan por tramos en función del importe total del pedido y se muestran antes de formalizar el pago.
            El pago se realiza íntegramente mediante Stripe, que admite tarjeta de crédito/débito, Google Pay y Apple Pay.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Plazos de entrega</h2>
          <p className="text-[#6b5344] leading-relaxed">
            Los plazos estimados de entrega son de 2 a 5 días laborables en territorio español peninsular. Para Baleares, Canarias, Ceuta y Melilla los plazos pueden variar.
            Estos plazos son orientativos y pueden verse afectados por circunstancias externas como huelgas, festivos o incidencias logísticas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Devoluciones y desistimiento</h2>
          <p className="text-[#6b5344] leading-relaxed">
            Dispones de 30 días naturales desde la recepción del pedido para ejercer tu derecho de desistimiento sin necesidad de justificación.
            El producto debe devolverse en su embalaje original y en perfecto estado. Los gastos de devolución corren a cargo del comprador salvo que el producto sea defectuoso o incorrecto.
            Contacta con nosotros en <a href="mailto:info@inmoalia.com" className="text-[#2d4a3e] underline">info@inmoalia.com</a> para iniciar el proceso.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Garantías</h2>
          <p className="text-[#6b5344] leading-relaxed">
            Todos los productos cuentan con la garantía legal de 2 años establecida por la normativa europea de consumo. En caso de defecto de fabricación, INMOALIA gestionará la reparación, sustitución o devolución del importe conforme a la legislación vigente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Propiedad intelectual</h2>
          <p className="text-[#6b5344] leading-relaxed">
            Todos los contenidos de este sitio web (textos, imágenes, logotipos, diseño) son propiedad de INMOALIA o de sus licenciantes y están protegidos por la legislación de propiedad intelectual. Queda prohibida su reproducción total o parcial sin autorización expresa.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Protección de datos</h2>
          <p className="text-[#6b5344] leading-relaxed">
            Los datos personales facilitados durante el proceso de compra serán tratados conforme al Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica de Protección de Datos (LOPD).
            Puedes ejercer tus derechos de acceso, rectificación, supresión y portabilidad contactando en <a href="mailto:info@inmoalia.com" className="text-[#2d4a3e] underline">info@inmoalia.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Legislación aplicable</h2>
          <p className="text-[#6b5344] leading-relaxed">
            Estos términos se rigen por la legislación española. Para la resolución de controversias, las partes se someten a los juzgados y tribunales del domicilio del consumidor, de conformidad con la normativa de consumo aplicable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Contacto</h2>
          <p className="text-[#6b5344] leading-relaxed">
            Para cualquier consulta relacionada con estos términos puedes contactarnos en{' '}
            <a href="mailto:info@inmoalia.com" className="text-[#2d4a3e] underline">info@inmoalia.com</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
