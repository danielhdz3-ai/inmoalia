import type { Metadata } from 'next'
import Link from 'next/link'
import { Package, Truck, Clock, MapPin } from 'lucide-react'
import { shopPageMetadata } from '@/lib/seo/page-metadata'
import { DELIVERY_SCOPE, DELIVERY_TIME_SHORT } from '@/lib/shop/shipping'

export const metadata: Metadata = shopPageMetadata(
  'Información de envíos — INMOALIA',
  'Envío incluido en el precio en INMOALIA. Plazos de entrega y zonas de envío a toda España.',
  '/envios',
)

export default function EnviosPage() {
  return (
    <div className="min-h-screen bg-[#fdfcfa]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2a2a2a] mb-3">Información de envíos</h1>
          <p className="text-[#6b5344] text-lg">
            En INMOALIA el transporte va incluido en el precio que ves. No se añaden gastos de envío al pagar.
          </p>
        </div>

        <div className="bg-gradient-to-r from-[#2d4a3e] to-[#0f766e] rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Envío incluido</h2>
          </div>
          <p className="text-white/90 text-lg">
            Todos nuestros precios incluyen el envío a domicilio en {DELIVERY_SCOPE}. El total del carrito es el importe final
            que pagarás.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-[#e8ddd0] p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-[#2d4a3e]" />
              <h3 className="font-semibold text-[#2a2a2a]">Plazos de entrega</h3>
            </div>
            <p className="text-[#6b5344] text-sm leading-relaxed">
              Entrega estimada en <strong>{DELIVERY_TIME_SHORT}</strong> en {DELIVERY_SCOPE}. Los pedidos se entregan de lunes a
              viernes en horario comercial.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#e8ddd0] p-6">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-6 h-6 text-[#2d4a3e]" />
              <h3 className="font-semibold text-[#2a2a2a]">Zonas de envío</h3>
            </div>
            <p className="text-[#6b5344] text-sm leading-relaxed">
              Realizamos envíos a <strong>{DELIVERY_SCOPE}</strong> (península, Baleares, Canarias, Ceuta y Melilla).
              Para consultas sobre entregas especiales, escríbenos a{' '}
              <a href="mailto:info@inmoalia.com" className="text-[#2d4a3e] underline">
                info@inmoalia.com
              </a>
              .
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#e8ddd0] p-6">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-6 h-6 text-[#2d4a3e]" />
              <h3 className="font-semibold text-[#2a2a2a]">Seguimiento del envío</h3>
            </div>
            <p className="text-[#6b5344] text-sm leading-relaxed">
              Cuando tu pedido salga de almacén, recibirás un email con el <strong>número de tracking</strong>. También
              puedes consultarlo en{' '}
              <Link href="/cuenta/pedidos" className="text-[#2d4a3e] underline">
                Mis pedidos
              </Link>
              .
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#e8ddd0] p-6">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-6 h-6 text-[#2d4a3e]" />
              <h3 className="font-semibold text-[#2a2a2a]">Preparación del pedido</h3>
            </div>
            <p className="text-[#6b5344] text-sm leading-relaxed">
              Procesamos tu pedido en <strong>24–48 h laborables</strong>. Recibirás confirmación por email cuando sea
              enviado.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-[#2a2a2a] mb-3">Al recibir tu pedido</h3>
          <p className="text-[#6b5344] text-sm leading-relaxed mb-3">
            Revisa el paquete en el momento de la entrega. Si observas daños, indícalo en el albarán del transportista
            antes de firmar.
          </p>
          <p className="text-[#6b5344] text-sm leading-relaxed">
            Tienes <strong>48 horas</strong> para notificarnos incidencias en{' '}
            <a href="mailto:info@inmoalia.com" className="text-[#2d4a3e] underline">
              info@inmoalia.com
            </a>
            . Conserva el embalaje original para devoluciones.
          </p>
        </div>

        <div className="text-center bg-white rounded-xl border border-[#e8ddd0] p-8">
          <h3 className="text-xl font-semibold text-[#2a2a2a] mb-3">¿Tienes dudas sobre tu envío?</h3>
          <p className="text-[#6b5344] mb-5">
            Escríbenos y te ayudamos con plazos, seguimiento o entregas especiales.
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
