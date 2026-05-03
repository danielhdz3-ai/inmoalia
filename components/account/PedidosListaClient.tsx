'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Package, ChevronRight, Copy, Check } from 'lucide-react'
import { toastOk, toastErr } from '@/lib/toast-client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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

type FilterKey = 'todos' | 'pendiente' | 'enviado' | 'completado'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'enviado', label: 'Enviado' },
  { key: 'completado', label: 'Completado' },
]

function orderMatchesFilter(order: Order, filter: FilterKey): boolean {
  if (filter === 'todos') return true
  const s = order.status
  if (filter === 'pendiente') return s === 'pending' || s === 'paid' || s === 'processing'
  if (filter === 'enviado') return s === 'shipped'
  if (filter === 'completado') return s === 'delivered'
  return true
}

function CopyOrderIdButton({ id, orderNumber }: { id: string; orderNumber: string }) {
  const [done, setDone] = useState(false)

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(id)
      void toastOk('ID del pedido copiado al portapapeles.')
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    } catch {
      void toastErr('No se pudo copiar. Copia manualmente: ' + orderNumber)
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="shrink-0 gap-1.5 transition-all duration-200"
      onClick={copy}
    >
      {done ? <Check className="w-3.5 h-3.5 text-[#27ae60]" /> : <Copy className="w-3.5 h-3.5" />}
      Copiar ID
    </Button>
  )
}

export default function PedidosListaClient({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<FilterKey>('todos')

  const filtered = useMemo(
    () => orders.filter((o) => orderMatchesFilter(o, filter)),
    [orders, filter]
  )

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium border transition-all duration-200',
              filter === key
                ? 'border-transparent bg-[#2d4a3e] text-white shadow-sm'
                : 'border-[#e8ddd0] bg-white text-[#2a2a2a] hover:border-[#d4c4b0] hover:bg-[#f9f6f1]'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e8ddd0] p-12 md:p-14 text-center shadow-sm">
          <Package className="w-12 h-12 text-[#e8ddd0] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#2a2a2a] tracking-tight mb-2">
            No hay pedidos con este filtro
          </h2>
          <p className="text-[#a08c7a] text-sm leading-relaxed max-w-sm mx-auto">
            Prueba con otro estado o vuelve a ver todos.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const status =
              STATUS_CONFIG[order.status] ??
              ({ label: order.status, color: 'text-[#a08c7a]', bg: 'bg-[#a08c7a]/10' } as const)
            const items = order.items as unknown as OrderItem[]
            const firstItem = items?.[0]

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-[#e8ddd0] p-5 md:p-6 shadow-sm transition-all duration-200 hover:border-[#d4c4b0] hover:shadow-md"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-[#2a2a2a] tracking-tight">{order.order_number}</span>
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
                  </div>
                  <div className="flex flex-col sm:items-end gap-3 shrink-0">
                    <span className="text-lg font-bold text-[#2a2a2a]">{formatPrice(order.total)}</span>
                    <div className="flex flex-wrap gap-2">
                      <CopyOrderIdButton id={order.id} orderNumber={order.order_number} />
                      <Link
                        href={`/pedidos/${order.id}`}
                        className={cn(
                          'inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium',
                          'bg-[#2d4a3e] text-white px-4 py-2 shadow-sm transition-all duration-200',
                          'hover:bg-[#1e3329] hover:shadow-md'
                        )}
                      >
                        Ver detalles
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
