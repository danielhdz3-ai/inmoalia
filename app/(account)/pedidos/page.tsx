import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package, ChevronRight } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order, OrderItem } from '@/lib/supabase/types'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendiente', color: 'text-[#c9a84c]', bg: 'bg-[#c9a84c]/10' },
  paid: { label: 'Pagado', color: 'text-[#2980b9]', bg: 'bg-[#2980b9]/10' },
  processing: { label: 'En proceso', color: 'text-[#8e44ad]', bg: 'bg-[#8e44ad]/10' },
  shipped: { label: 'Enviado', color: 'text-[#27ae60]', bg: 'bg-[#27ae60]/10' },
  delivered: { label: 'Entregado', color: 'text-[#27ae60]', bg: 'bg-[#27ae60]/10' },
  cancelled: { label: 'Cancelado', color: 'text-[#c0392b]', bg: 'bg-[#c0392b]/10' },
}

export default async function PedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rawOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
  const orders = rawOrders as unknown as Order[] | null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <h1 className="text-2xl font-bold text-[#2a2a2a] mb-8">Mis pedidos</h1>

      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8ddd0] p-12 text-center">
          <Package className="w-12 h-12 text-[#e8ddd0] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#2a2a2a] mb-2">No tienes pedidos aún</h2>
          <p className="text-[#a08c7a] mb-6">Cuando realices tu primer pedido, aparecerá aquí.</p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 bg-[#2d4a3e] text-white px-6 py-3 rounded-lg hover:bg-[#1e3329] transition-colors text-sm font-medium"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'text-[#a08c7a]', bg: 'bg-[#a08c7a]/10' }
            const items = order.items as unknown as OrderItem[]
            const firstItem = items[0]

            return (
              <Link
                key={order.id}
                href={`/pedidos/${order.id}`}
                className="block bg-white rounded-2xl border border-[#e8ddd0] p-5 hover:border-[#a08c7a] hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-[#2a2a2a]">{order.order_number}</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#a08c7a] mb-2">{formatDate(order.created_at)}</p>
                    {firstItem && (
                      <p className="text-sm text-[#6b5344]">
                        {firstItem.name}
                        {items.length > 1 && ` y ${items.length - 1} producto${items.length > 2 ? 's' : ''} más`}
                      </p>
                    )}
                    {order.tracking_number && (
                      <p className="text-xs text-[#2d4a3e] mt-1 font-medium">
                        Tracking: {order.tracking_number}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-lg font-bold text-[#2a2a2a]">{formatPrice(order.total)}</span>
                    <ChevronRight className="w-4 h-4 text-[#a08c7a]" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
