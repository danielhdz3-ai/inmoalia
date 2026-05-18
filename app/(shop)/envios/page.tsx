import type { Metadata } from 'next'
import Link from 'next/link'
import { Package, Truck, Clock, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Información de envíos — INMOALIA',
  description: 'Costes y plazos de envío de INMOALIA. Envío gratis a partir de 600€ a toda la península.',
}

export default function EnviosPage() {
  const shippingRates = [
    { range: 'De 1 a 60 €', cost: '22 €' },
    { range: 'De 61 a 120 €', cost: '28 €' },
    { range: 'De 121 a 190 €', cost: '33 €' },
    { range: 'De 191 a 300 €', cost: '39 €' },
    { range: 'De 301 a 400 €', cost: '45 €' },
    { range: 'De 401 a 500 €', cost: '49 €' },
    { range: 'De 501 a 599 €', cost: '59 €' },
  ]

  return (
    <div className="min-h-screen bg-[#fdfcfa]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2a2a2a] mb-3">Información de envíos</h1>
          <p className="text-[#6b5344] text-lg">
            Todo lo que necesitas saber sobre nuestros plazos de entrega y costes de transporte.
          </p>
        </div>

        {/* Envío gratis */}
        <div className="bg-gradient-to-r from-[#2d4a3e] to-[#0f766e] rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-8 h-8" />
            <h2 className="text-2xl font-bold">¡Envío GRATIS!</h2>
          </div>
          <p className="text-white/90 text-lg">
            En todos los pedidos <strong>iguales o superiores a 600 €</strong> a cualquier punto de la península española.
          </p>
        </div>

        {/* Tabla de costes */}
        <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden mb-8">
          <div className="bg-[#f9f6f1] px-6 py-4 border-b border-[#e8ddd0]">
            <h2 className="text-xl font-semibold text-[#2a2a2a]">Costes de transporte</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#fdfcfa]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2a2a2a] border-b border-[#e8ddd0]">
                    Importe del pedido
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-[#2a2a2a] border-b border-[#e8ddd0]">
                    Coste de transporte
                  </th>
                </tr>
              </thead>
              <tbody>
                {shippingRates.map((rate, idx) => (
                  <tr key={idx} className="border-b border-[#e8ddd0] last:border-0 hover:bg-[#fdfcfa] transition-colors">
                    <td className="px-6 py-4 text-[#6b5344]">{rate.range}</td>
                    <td className="px-6 py-4 text-right font-semibold text-[#2a2a2a]">{rate.cost}</td>
                  </tr>
                ))}
                <tr className="bg-green-50">
                  <td className="px-6 py-4 text-[#2a2a2a] font-semibold">A partir de 600 €</td>
                  <td className="px-6 py-4 text-right font-bold text-green-700">GRATIS</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-[#e8ddd0] p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-[#2d4a3e]" />
              <h3 className="font-semibold text-[#2a2a2a]">Plazos de entrega</h3>
            </div>
            <p className="text-[#6b5344] text-sm leading-relaxed">
              <strong>Envío rápido en 24-48h</strong> para todos los productos en stock. Los pedidos se entregan de lunes a viernes en horario comercial.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#e8ddd0] p-6">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-6 h-6 text-[#2d4a3e]" />
              <h3 className="font-semibold text-[#2a2a2a]">Zonas de envío</h3>
            </div>
            <p className="text-[#6b5344] text-sm leading-relaxed">
              Realizamos envíos a toda la <strong>península española</strong>. Para envíos a Baleares, Canarias, Ceuta y Melilla, consulta condiciones especiales en <a href="mailto:info@inmoalia.com" className="text-[#2d4a3e] underline">info@inmoalia.com</a>.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#e8ddd0] p-6">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-6 h-6 text-[#2d4a3e]" />
              <h3 className="font-semibold text-[#2a2a2a]">Seguimiento del envío</h3>
            </div>
            <p className="text-[#6b5344] text-sm leading-relaxed">
              Cuando tu pedido sea enviado, recibirás un email con el <strong>número de tracking</strong> para seguir tu envío en tiempo real. Puedes consultar el estado en <Link href="/cuenta/pedidos" className="text-[#2d4a3e] underline">Mis pedidos</Link>.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#e8ddd0] p-6">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-6 h-6 text-[#2d4a3e]" />
              <h3 className="font-semibold text-[#2a2a2a]">Preparación del pedido</h3>
            </div>
            <p className="text-[#6b5344] text-sm leading-relaxed">
              Los pedidos confirmados antes de las <strong>14:00h</strong> se procesan el mismo día laborable. Los pedidos posteriores se procesarán el siguiente día laborable. Recibirás un email de confirmación cuando sea enviado.
            </p>
          </div>
        </div>

        {/* Nota de recepción */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-[#2a2a2a] mb-3">Al recibir tu pedido</h3>
          <p className="text-[#6b5344] text-sm leading-relaxed mb-3">
            Por favor, revisa tu pedido en el momento de la entrega. Si observas algún daño en el paquete, 
            indícalo en el albarán del transportista antes de firmar.
          </p>
          <p className="text-[#6b5344] text-sm leading-relaxed">
            Dispones de <strong>48 horas</strong> desde la recepción para notificarnos cualquier incidencia 
            escribiendo a <a href="mailto:info@inmoalia.com" className="text-[#2d4a3e] underline">info@inmoalia.com</a>. 
            Conserva el embalaje original para posibles devoluciones.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center bg-white rounded-xl border border-[#e8ddd0] p-8">
          <h3 className="text-xl font-semibold text-[#2a2a2a] mb-3">¿Tienes dudas sobre tu envío?</h3>
          <p className="text-[#6b5344] mb-5">
            Nuestro equipo está disponible para ayudarte con cualquier consulta sobre envíos y entregas.
          </p>
          <Link 
            href="/contacto" 
            className="inline-block bg-[#2d4a3e] hover:bg-[#234335] text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Contactar con nosotros
          </Link>
        </div>
      </div>
    </div>
  )
}
