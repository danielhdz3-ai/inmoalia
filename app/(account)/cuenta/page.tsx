import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { User, Package } from 'lucide-react'
import type { Customer, Order } from '@/lib/supabase/types'

export default async function CuentaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rawCustomer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', user.id)
    .single()
  const customer = rawCustomer as unknown as Customer | null

  const { data: rawOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)
  const recentOrders = rawOrders as unknown as Order[] | null

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'text-[#c9a84c] bg-[#c9a84c]/10' },
    paid: { label: 'Pagado', color: 'text-[#27ae60] bg-[#27ae60]/10' },
    processing: { label: 'En proceso', color: 'text-[#2980b9] bg-[#2980b9]/10' },
    shipped: { label: 'Enviado', color: 'text-[#8e44ad] bg-[#8e44ad]/10' },
    delivered: { label: 'Entregado', color: 'text-[#27ae60] bg-[#27ae60]/10' },
    cancelled: { label: 'Cancelado', color: 'text-[#c0392b] bg-[#c0392b]/10' },
  }

  const greetName =
    customer?.full_name?.trim().split(/\s+/)[0]
    ?? (user.user_metadata?.full_name as string | undefined)?.trim().split(/\s+/)[0]
    ?? 'Cliente'

  return (
    <div className="max-w-4xl lg:max-w-none">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2a2a2a]">Resumen</h1>
        <p className="text-sm text-[#a08c7a] mt-2 leading-relaxed">
          Hola, {greetName}. Aquí tienes un vistazo rápido de tu cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/cuenta/perfil"
          className="group flex items-center gap-4 rounded-xl border border-[#e8ddd0] bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#d4c4b0] hover:shadow-md"
        >
          <div className="w-12 h-12 rounded-full bg-[#f9f6f1] border border-[#e8ddd0] flex items-center justify-center shrink-0 group-hover:border-[#d4c4b0] transition-colors">
            <User className="w-6 h-6 text-[#2d4a3e]" />
          </div>
          <div className="min-w-0 text-left">
            <p className="font-semibold text-[#2a2a2a] group-hover:text-[#2d4a3e] transition-colors">Datos y dirección</p>
            <p className="text-sm text-[#a08c7a] truncate">{user.email}</p>
          </div>
        </Link>
        <Link
          href="/pedidos"
          className="group flex items-center gap-4 rounded-xl border border-[#e8ddd0] bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#d4c4b0] hover:shadow-md"
        >
          <div className="w-12 h-12 rounded-full bg-[#f9f6f1] border border-[#e8ddd0] flex items-center justify-center shrink-0 group-hover:border-[#d4c4b0] transition-colors">
            <Package className="w-6 h-6 text-[#2d4a3e]" />
          </div>
          <div className="min-w-0 text-left">
            <p className="font-semibold text-[#2a2a2a] group-hover:text-[#2d4a3e] transition-colors">Mis pedidos</p>
            <p className="text-sm text-[#a08c7a]">Historial y seguimiento</p>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#e8ddd0] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-[#2a2a2a] text-lg">Pedidos recientes</h2>
          <Link
            href="/pedidos"
            className="text-sm font-medium text-[#2d4a3e] hover:text-[#1e3329] hover:underline underline-offset-2 transition-colors"
          >
            Ver todos
          </Link>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <div className="text-center py-10">
            <Package className="w-11 h-11 text-[#e8ddd0] mx-auto mb-3" />
            <p className="text-sm text-[#a08c7a]">Aún no tienes pedidos</p>
            <Link
              href="/productos"
              className="text-sm font-medium text-[#2d4a3e] hover:text-[#1e3329] hover:underline underline-offset-2 mt-2 inline-block transition-colors"
            >
              Empezar a comprar →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const statusInfo = STATUS_LABELS[order.status] ?? {
                label: order.status,
                color: 'text-[#a08c7a] bg-[#a08c7a]/10',
              }
              return (
                <Link
                  key={order.id}
                  href={`/pedidos/${order.id}`}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg border border-[#e8ddd0] bg-[#fdfcfa] hover:border-[#d4c4b0] hover:bg-[#f9f6f1] transition-all duration-200"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#2a2a2a]">{order.order_number}</p>
                    <p className="text-xs text-[#a08c7a]">
                      {new Date(order.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#2a2a2a]">
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
                        order.total
                      )}
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
