import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Preguntas frecuentes — INMOALIA',
  description: 'Respuestas a las preguntas más comunes sobre envíos, devoluciones, pagos y productos de INMOALIA.',
}

const FAQS = [
  {
    section: 'Envíos',
    items: [
      { q: '¿Cuánto tarda en llegar mi pedido?', a: 'El plazo de entrega estimado es de 2 a 5 días laborables en España peninsular. Para Baleares, Canarias, Ceuta y Melilla puede variar entre 5 y 10 días.' },
      { q: '¿Cuánto cuesta el envío?', a: 'El envío es gratuito en pedidos iguales o superiores a 600 €. Por debajo de ese importe, el transporte se calcula por tramos según el total del carrito (entre 22 € y 59 €); verás el importe exacto en el carrito y al pagar.' },
      { q: '¿Puedo seguir mi pedido?', a: 'Sí. Una vez que tu pedido salga de almacén, recibirás un email con el número de seguimiento y el enlace del transportista.' },
      { q: '¿Hacéis envíos internacionales?', a: 'Actualmente solo enviamos a España peninsular, Baleares, Canarias, Ceuta y Melilla. Estamos trabajando para ampliar a Europa próximamente.' },
    ],
  },
  {
    section: 'Pagos',
    items: [
      { q: '¿Qué métodos de pago aceptáis?', a: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express) y PayPal. Todos los pagos se procesan de forma segura a través de Stripe.' },
      { q: '¿Es seguro pagar en INMOALIA?', a: 'Sí. Utilizamos Stripe, la plataforma de pagos más segura del mundo con certificación PCI DSS nivel 1. Toda la información viaja cifrada con SSL.' },
      { q: '¿Puedo pagar a plazos?', a: 'De momento no ofrecemos financiación propia, pero muchas tarjetas de crédito permiten fraccionar el pago directamente con tu banco.' },
    ],
  },
  {
    section: 'Devoluciones y garantías',
    items: [
      { q: '¿Puedo devolver un producto?', a: 'Sí, tienes 30 días naturales desde la recepción del pedido para ejercer tu derecho de desistimiento. El producto debe estar en su embalaje original y en perfectas condiciones.' },
      { q: '¿Quién paga los gastos de devolución?', a: 'Los gastos de devolución corren a cargo del comprador, salvo que el producto sea defectuoso o incorrecto, en cuyo caso INMOALIA cubre el envío de vuelta.' },
      { q: '¿Cuánto tarda en procesarse mi devolución?', a: 'Una vez recibido el producto y verificado su estado, procesamos el reembolso en un plazo de 5-7 días laborables. El dinero aparecerá en tu cuenta según los plazos de tu banco.' },
      { q: '¿Qué garantía tienen los productos?', a: 'Todos nuestros productos tienen la garantía legal de 2 años establecida por la normativa europea. En caso de defecto, nos encargamos de la reparación, sustitución o reembolso.' },
    ],
  },
  {
    section: 'Productos',
    items: [
      { q: '¿Los productos son de calidad?', a: 'Cada artículo pasa un criterio estricto de materiales, acabados y trazabilidad antes de publicarse. Solo aceptamos piezas que cumplen nuestras exigencias de durabilidad y diseño.' },
      { q: '¿Puedo ver el producto antes de comprarlo?', a: 'Somos una tienda 100% online, por lo que no tenemos tienda física. Sin embargo, nuestras fotos son detalladas y las descripciones muy completas. Además, tienes 30 días para devolverlo.' },
      { q: '¿Cómo sé si un producto tiene stock?', a: 'En cada ficha de producto indicamos el stock disponible. Si un producto está agotado, puedes apuntarte a la lista de espera y te avisaremos cuando vuelva a estar disponible.' },
    ],
  },
  {
    section: 'Mi cuenta',
    items: [
      { q: '¿Es obligatorio registrarse para comprar?', a: 'No es obligatorio, pero con una cuenta puedes seguir el estado de tus pedidos, guardar favoritos y agilizar futuros procesos de compra.' },
      { q: '¿He olvidado mi contraseña, qué hago?', a: 'En la página de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?" e introduce tu email. Recibirás un enlace para restablecerla.' },
    ],
  },
]

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">Preguntas frecuentes</h1>
        <p className="text-[#a08c7a]">Encuentra respuesta a las dudas más comunes. Si no encuentras lo que buscas, escríbenos.</p>
      </div>

      <div className="space-y-10">
        {FAQS.map((section) => (
          <div key={section.section}>
            <h2 className="text-lg font-bold text-[#2a2a2a] mb-4 pb-2 border-b border-[#e8ddd0]">
              {section.section}
            </h2>
            <div className="space-y-4">
              {section.items.map((item) => (
                <details key={item.q} className="group bg-white rounded-xl border border-[#e8ddd0] overflow-hidden">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-medium text-[#2a2a2a] hover:bg-[#f9f6f1] transition-colors">
                    {item.q}
                    <svg className="w-4 h-4 text-[#a08c7a] shrink-0 ml-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-sm text-[#6b5344] leading-relaxed">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-[#f9f6f1] rounded-2xl border border-[#e8ddd0] p-6 text-center">
        <p className="font-semibold text-[#2a2a2a] mb-1">¿No encontraste lo que buscabas?</p>
        <p className="text-sm text-[#a08c7a] mb-4">Nuestro equipo está disponible para ayudarte.</p>
        <Link
          href="/contacto"
          className="inline-flex items-center gap-2 bg-[#2d4a3e] text-white px-6 py-2.5 rounded-lg hover:bg-[#1e3329] transition-colors text-sm font-medium"
        >
          Contactar
        </Link>
      </div>
    </div>
  )
}
