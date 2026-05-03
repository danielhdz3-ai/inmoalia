import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Package, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { stripe } from '@/lib/stripe/client'
import { formatPrice, formatDate } from '@/lib/utils'
import type { OrderItem } from '@/lib/supabase/types'
import CartClearer from './CartClearer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pedido confirmado — INMOALIA',
  description: 'Tu pedido ha sido confirmado y está siendo procesado.',
}

interface PageProps {
  searchParams: Promise<{ session_id?: string }>
}

async function getSessionDetails(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })
    return session
  } catch {
    return null
  }
}

export default async function CheckoutExitoPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams
  const session = session_id ? await getSessionDetails(session_id) : null

  const items: OrderItem[] = session?.metadata?.items
    ? JSON.parse(session.metadata.items)
    : []

  const total = session?.amount_total ? session.amount_total / 100 : null
  const email = session?.customer_email ?? session?.customer_details?.email ?? null
  const orderDate = session?.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <CartClearer />
      {/* Icono y título */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#2d4a3e]/10 mb-6">
          <CheckCircle2 className="w-10 h-10 text-[#2d4a3e]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#2a2a2a] mb-3">
          ¡Pedido confirmado!
        </h1>
        <p className="text-[#a08c7a] text-base max-w-sm mx-auto">
          Gracias por tu compra. Hemos recibido tu pedido y lo estamos procesando.
        </p>
      </div>

      {/* Tarjeta de resumen */}
      <div className="bg-[#f9f6f1] border border-[#e8ddd0] rounded-2xl p-6 mb-6 space-y-4">

        {/* Email de confirmación */}
        {email && (
          <div className="flex items-start gap-3 pb-4 border-b border-[#e8ddd0]">
            <Mail className="w-5 h-5 text-[#2d4a3e] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#2a2a2a]">Confirmación enviada</p>
              <p className="text-sm text-[#a08c7a]">
                Hemos enviado los detalles del pedido a{' '}
                <span className="text-[#2a2a2a] font-medium">{email}</span>
              </p>
            </div>
          </div>
        )}

        {/* Fecha y total */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#6b5344]">Fecha del pedido</span>
          <span className="font-medium text-[#2a2a2a]">{formatDate(orderDate)}</span>
        </div>

        {total !== null && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#6b5344]">Total pagado</span>
            <span className="font-bold text-[#2d4a3e] text-base">{formatPrice(total)}</span>
          </div>
        )}

        {/* Productos */}
        {items.length > 0 && (
          <div className="pt-4 border-t border-[#e8ddd0] space-y-3">
            <p className="text-sm font-semibold text-[#2a2a2a] mb-2">Productos</p>
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-start gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-[#2a2a2a] leading-tight line-clamp-2">{item.name}</p>
                  <p className="text-[#a08c7a] text-xs mt-0.5">Cantidad: {item.quantity}</p>
                </div>
                <p className="font-medium text-[#2a2a2a] shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Próximos pasos */}
      <div className="bg-white border border-[#e8ddd0] rounded-2xl p-6 mb-8">
        <h2 className="text-base font-semibold text-[#2a2a2a] mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-[#2d4a3e]" />
          ¿Qué pasa ahora?
        </h2>
        <ol className="space-y-3">
          {[
            'Recibirás un email de confirmación con el resumen del pedido.',
            'Tramitamos tu pedido con el proveedor (24-48h laborables).',
            'Recibirás el número de seguimiento cuando salga de almacén.',
            'Entrega estimada: 2-5 días laborables en España.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[#6b5344]">
              <span className="shrink-0 w-5 h-5 rounded-full bg-[#2d4a3e]/10 text-[#2d4a3e] text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="xl">
          <Link href="/productos">
            Seguir comprando <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="xl">
          <Link href="/pedidos">Ver mis pedidos</Link>
        </Button>
      </div>
    </div>
  )
}
