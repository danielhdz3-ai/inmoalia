import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { ShoppingCart, ChevronLeft } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { sendShippingNotification, sendOrderCancelledNotice } from '@/lib/resend/emails'
import { assertAdmin } from '@/lib/admin/assert-admin'
import type { Order, OrderItem } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ORDER_STATUSES = [
  { value: 'pending',    label: 'Pendiente' },
  { value: 'paid',       label: 'Pagado' },
  { value: 'processing', label: 'En proceso' },
  { value: 'shipped',    label: 'Enviado' },
  { value: 'delivered',  label: 'Entregado' },
  { value: 'cancelled',  label: 'Cancelado' },
]

const STATUS_COLORS: Record<string, string> = {
  pending:    'text-[#c9a84c] bg-[#c9a84c]/10',
  paid:       'text-[#2980b9] bg-[#2980b9]/10',
  processing: 'text-[#8e44ad] bg-[#8e44ad]/10',
  shipped:    'text-[#27ae60] bg-[#27ae60]/10',
  delivered:  'text-[#27ae60] bg-[#27ae60]/10',
  cancelled:  'text-[#c0392b] bg-[#c0392b]/10',
}

async function updateOrderStatus(formData: FormData) {
  'use server'
  await assertAdmin()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const trackingNumber = (formData.get('tracking_number') as string).trim()
  const supabase = createAdminClient()

  const { data: rawOrder } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  const prevOrder = rawOrder as unknown as Order | null

  await supabase
    .from('orders')
    .update({
      status,
      ...(trackingNumber ? { tracking_number: trackingNumber } : {}),
    } as never)
    .eq('id', id)

  // Enviar email de envío cuando el pedido pasa a 'shipped' con número de tracking
  if (
    status === 'shipped' &&
    trackingNumber &&
    prevOrder &&
    prevOrder.status !== 'shipped'
  ) {
    try {
      await sendShippingNotification(prevOrder, trackingNumber)
    } catch (err) {
      console.error('Error sending shipping notification:', err)
    }
  }

  const paidLike: Order['status'][] = ['paid', 'processing', 'shipped', 'delivered']
  if (
    status === 'cancelled' &&
    prevOrder &&
    prevOrder.status !== 'cancelled' &&
    paidLike.includes(prevOrder.status) &&
    !prevOrder.order_closure_notice_sent_at
  ) {
    try {
      await sendOrderCancelledNotice(prevOrder)
      await supabase
        .from('orders')
        .update({ order_closure_notice_sent_at: new Date().toISOString() } as never)
        .eq('id', id)
    } catch (err) {
      console.error('Error sending cancellation notice:', err)
    }
  }

  revalidatePath('/admin/pedidos')
}

export default async function AdminPedidosPage() {
  const supabase = createAdminClient()

  const { data: rawOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const orders = rawOrders as unknown as Order[] | null

  const countByStatus = ORDER_STATUSES.reduce((acc, s) => {
    acc[s.value] = orders?.filter((o) => o.status === s.value).length ?? 0
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="flex items-center gap-1.5 text-sm text-[#a08c7a] hover:text-[#2d4a3e] transition-colors">
          <ChevronLeft className="w-4 h-4" /> Panel admin
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2a2a2a]">Pedidos</h1>
        <p className="text-sm text-[#a08c7a] mt-0.5">{orders?.length ?? 0} pedidos en total</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {ORDER_STATUSES.map((s) => (
          <div key={s.value} className={`rounded-xl border border-[#e8ddd0] p-4 ${countByStatus[s.value] > 0 ? 'bg-white' : 'bg-[#f9f6f1]'}`}>
            <p className={`text-xl font-bold ${STATUS_COLORS[s.value]?.split(' ')[0] ?? 'text-[#2a2a2a]'}`}>
              {countByStatus[s.value]}
            </p>
            <p className="text-xs text-[#a08c7a] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Orders list */}
      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#e8ddd0]">
          <ShoppingCart className="w-4 h-4 text-[#2d4a3e]" />
          <h2 className="font-semibold text-[#2a2a2a]">Todos los pedidos</h2>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-16 text-[#a08c7a] text-sm">No hay pedidos aún.</div>
        ) : (
          <div className="divide-y divide-[#e8ddd0]">
            {orders.map((order) => {
              const items = order.items as unknown as OrderItem[]
              return (
                <details key={order.id} className="group">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-[#f9f6f1] transition-colors list-none">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#2a2a2a] text-sm">{order.order_number}</p>
                        <p className="text-xs text-[#a08c7a]">{order.customer_email}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-xs text-[#a08c7a]">{formatDate(order.created_at)}</p>
                        <p className="text-xs text-[#6b5344]">
                          {items.length} producto{items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] ?? 'text-[#a08c7a] bg-[#e8ddd0]'}`}>
                        {ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status}
                      </span>
                      <span className="font-bold text-[#2a2a2a] text-sm">{formatPrice(order.total)}</span>
                      <svg className="w-4 h-4 text-[#a08c7a] transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>

                  {/* Order detail */}
                  <div className="px-6 pb-6 bg-[#f9f6f1] border-t border-[#e8ddd0]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5">
                      {/* Items */}
                      <div>
                        <h4 className="text-xs font-semibold text-[#a08c7a] uppercase tracking-wide mb-3">Productos</h4>
                        <div className="space-y-2">
                          {items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-[#e8ddd0]">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-[#e8ddd0] shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#2a2a2a] truncate">{item.name}</p>
                                <p className="text-xs text-[#a08c7a]">x{item.quantity} · {formatPrice(item.price)}</p>
                              </div>
                              <p className="text-sm font-semibold text-[#2a2a2a] shrink-0">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Update status */}
                      <div>
                        <h4 className="text-xs font-semibold text-[#a08c7a] uppercase tracking-wide mb-3">Actualizar pedido</h4>
                        <form action={updateOrderStatus} className="bg-white rounded-xl border border-[#e8ddd0] p-4 space-y-3">
                          <input type="hidden" name="id" value={order.id} />
                          <div>
                            <label className="text-xs font-medium text-[#6b5344] block mb-1.5">Estado</label>
                            <select
                              name="status"
                              defaultValue={order.status}
                              className="w-full text-sm border border-[#e8ddd0] rounded-lg px-3 py-2 bg-white text-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30"
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-[#6b5344] block mb-1.5">Número de seguimiento</label>
                            <input
                              name="tracking_number"
                              type="text"
                              defaultValue={order.tracking_number ?? ''}
                              placeholder="Ej: GLS1234567890"
                              className="w-full text-sm border border-[#e8ddd0] rounded-lg px-3 py-2 bg-white text-[#2a2a2a] placeholder-[#a08c7a] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30"
                            />
                            <p className="text-[11px] text-[#a08c7a] mt-1.5 leading-snug">
                              Al guardar estado <strong>Enviado</strong> con un número de tracking, el cliente recibe automáticamente un email si Resend está configurado.
                            </p>
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-[#2d4a3e] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#1e3329] transition-colors"
                          >
                            Guardar cambios
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </details>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
