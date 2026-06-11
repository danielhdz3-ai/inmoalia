import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOrderForUser } from '@/lib/orders/queries'
import Link from 'next/link'
import { Package, ChevronLeft, MapPin, Truck, CreditCard, RotateCcw } from 'lucide-react'
import PrintPedidoButton from '@/components/account/PrintPedidoButton'
import { extractIvaFromGross } from '@/lib/shop/pricing'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order, OrderItem, ShippingAddress } from '@/lib/supabase/types'

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; step: number }> = {
  pending:    { label: 'Pendiente',   color: 'text-[#c9a84c]', bg: 'bg-[#c9a84c]/10', step: 1 },
  paid:       { label: 'Pagado',      color: 'text-[#2980b9]', bg: 'bg-[#2980b9]/10', step: 2 },
  processing: { label: 'En proceso',  color: 'text-[#8e44ad]', bg: 'bg-[#8e44ad]/10', step: 3 },
  shipped:    { label: 'Enviado',     color: 'text-[#27ae60]', bg: 'bg-[#27ae60]/10', step: 4 },
  delivered:  { label: 'Entregado',   color: 'text-[#27ae60]', bg: 'bg-[#27ae60]/10', step: 5 },
  cancelled:  { label: 'Cancelado',   color: 'text-[#c0392b]', bg: 'bg-[#c0392b]/10', step: 0 },
}

export default async function PedidoDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const order = await getOrderForUser(id, user)
  if (!order) notFound()
  const items = order.items as unknown as OrderItem[]
  const address = order.shipping_address as unknown as ShippingAddress
  const status = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'text-[#a08c7a]', bg: 'bg-[#a08c7a]/10', step: 0 }

  const STEPS = ['Pendiente', 'Pagado', 'En proceso', 'Enviado', 'Entregado']

  return (
    <div className="max-w-4xl lg:max-w-none print:bg-white">
      <div className="no-print text-sm text-[#a08c7a] mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <Link href="/cuenta" className="hover:text-[#2d4a3e] transition-colors duration-200">
          Mi cuenta
        </Link>
        <span className="text-[#d4c4b0] select-none" aria-hidden>
          ·
        </span>
        <Link href="/pedidos" className="hover:text-[#2d4a3e] transition-colors duration-200">
          Mis pedidos
        </Link>
        <span className="text-[#d4c4b0] select-none" aria-hidden>
          ·
        </span>
        <span className="text-[#2a2a2a] font-medium">{order.order_number}</span>
      </div>

      <div className="no-print mb-8">
        <Link
          href="/pedidos"
          className="inline-flex items-center gap-1.5 text-sm text-[#a08c7a] hover:text-[#2d4a3e] transition-all duration-200 mb-6"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden /> Volver a la lista
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2a2a2a]">{order.order_number}</h1>
            <p className="text-sm text-[#a08c7a] mt-1">{formatDate(order.created_at)}</p>
            <span
              className={`inline-flex mt-3 text-sm font-semibold px-3.5 py-1.5 rounded-full ${status.bg} ${status.color}`}
            >
              {status.label}
            </span>
          </div>
          <div className="flex shrink-0 items-start">
            <PrintPedidoButton />
          </div>
        </div>
      </div>

      {/* Cabecera en impresión (sin navegación) */}
      <div className="hidden print:block mb-6 border-b border-[#e8ddd0] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#2a2a2a]">{order.order_number}</h1>
        <p className="text-sm text-[#6b5344] mt-1">{formatDate(order.created_at)} · {status.label}</p>
        {order.tracking_number && (
          <p className="text-sm font-semibold mt-3 text-[#2a2a2a]">
            Seguimiento: <span className="font-mono">{order.tracking_number}</span>
          </p>
        )}
      </div>

      {/* Progress tracker */}
      {order.status !== 'cancelled' && (
        <div className="no-print bg-white rounded-xl border border-[#e8ddd0] shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-[#e8ddd0] -z-0" />
            <div
              className="absolute left-0 top-4 h-0.5 bg-[#2d4a3e] -z-0 transition-all"
              style={{ width: `${Math.max(0, (status.step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((step, i) => {
              const done = status.step > i + 1
              const active = status.step === i + 1
              return (
                <div key={step} className="flex flex-col items-center gap-2 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    done ? 'bg-[#2d4a3e] border-[#2d4a3e] text-white' :
                    active ? 'bg-white border-[#2d4a3e] text-[#2d4a3e]' :
                    'bg-white border-[#e8ddd0] text-[#a08c7a]'
                  }`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium text-center hidden sm:block ${
                    done || active ? 'text-[#2a2a2a]' : 'text-[#a08c7a]'
                  }`}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-[#e8ddd0] shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-[#e8ddd0]">
              <Package className="w-4 h-4 text-[#2d4a3e]" />
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#a08c7a] font-medium">
                  Pedido
                </p>
                <h2 className="font-semibold text-[#2a2a2a] text-lg tracking-tight">
                  Productos ({items.length})
                </h2>
              </div>
            </div>
            <div className="divide-y divide-[#e8ddd0]">
              {items.map((item, i) => (
                <div key={i} className="flex gap-4 p-5">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border border-[#e8ddd0] shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/productos/${item.slug}`}
                      className="font-medium text-[#2a2a2a] hover:text-[#2d4a3e] transition-colors text-sm line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-[#a08c7a] mt-0.5">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-[#2a2a2a] text-sm">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-xs text-[#a08c7a]">{formatPrice(item.price)} / ud.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking */}
          {order.tracking_number && (
            <div className="rounded-xl border border-[#e8ddd0] bg-[#ebe4d8]/90 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 transition-all duration-200">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-[#6b5344] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#6b5344] font-semibold">
                    Tracking
                  </p>
                  <p className="text-base md:text-lg text-[#2a2a2a] font-mono font-semibold tracking-wide mt-0.5">
                    {order.tracking_number}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Shipping address */}
          <div className="bg-white rounded-xl border border-[#e8ddd0] shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#2d4a3e]" />
              <h3 className="font-semibold text-[#2a2a2a] text-sm">Dirección de envío</h3>
            </div>
            <div className="text-sm text-[#6b5344] space-y-0.5">
              <p className="font-medium text-[#2a2a2a]">{address.full_name}</p>
              <p>{address.address_line1}</p>
              {address.address_line2 && <p>{address.address_line2}</p>}
              <p>{address.postal_code} {address.city}</p>
              <p>{address.province}</p>
              <p className="mt-1">{address.phone}</p>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-xl border border-[#e8ddd0] shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-[#2d4a3e]" />
              <h3 className="font-semibold text-[#2a2a2a] text-sm">Resumen del pago</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#6b5344]">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6b5344]">
                <span>Envío</span>
                <span>{order.shipping_cost === 0 ? 'Gratis' : formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#a08c7a]">
                <span>IVA 21% (incluido)</span>
                <span>{formatPrice(extractIvaFromGross(order.total))}</span>
              </div>
              <div className="flex justify-between font-bold text-[#2a2a2a] pt-2 border-t border-[#e8ddd0]">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
          {/* Devoluciones (alineado con email y FAQ públicas) */}
          <div className="bg-white rounded-xl border border-[#e8ddd0] shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-4 h-4 text-[#2d4a3e]" />
              <h3 className="font-semibold text-[#2a2a2a] text-sm">Cambios y devoluciones</h3>
            </div>
            <p className="text-sm text-[#6b5344] leading-relaxed">
              Disfrutas de un plazo de <strong>hasta 30 días naturales</strong> para devoluciones, según nuestras condiciones públicas y el equipo operativo disponible ese día para gestionar cada caso (producto debe llegar íntegro y en embalaje adecuado salvo reclamaciones por defecto).
            </p>
            <p className="text-sm mt-3">
              <Link href="/devoluciones" className="font-medium text-[#2d4a3e] hover:underline underline-offset-2">
                Leer política de devoluciones
              </Link>
              <span className="text-[#a08c7a] mx-2">·</span>
              <a href="mailto:info@inmoalia.com" className="font-medium text-[#2d4a3e] hover:underline underline-offset-2">
                Escríbenos si necesitas etiqueta de vuelta
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}