import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { User, Package, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#2a2a2a]">Mi cuenta</h1>
        <form action="/api/auth/signout" method="POST">
          <Button variant="ghost" size="sm" className="gap-2 text-[#a08c7a]">
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-[#e8ddd0] p-6">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-[#2d4a3e]/10 flex items-center justify-center mb-3">
                <User className="w-8 h-8 text-[#2d4a3e]" />
              </div>
              <h2 className="font-semibold text-[#2a2a2a]">
                {customer?.full_name ?? user.user_metadata?.full_name ?? 'Mi perfil'}
              </h2>
              <p className="text-sm text-[#a08c7a]">{user.email}</p>
            </div>

            <div className="space-y-2">
              <Link
                href="/cuenta/perfil"
                className="block w-full text-center text-sm py-2 rounded-lg border border-[#e8ddd0] text-[#2a2a2a] hover:bg-[#f9f6f1] transition-colors"
              >
                Editar perfil
              </Link>
              <Link
                href="/pedidos"
                className="flex items-center gap-2 justify-center w-full text-sm py-2 rounded-lg bg-[#2d4a3e] text-white hover:bg-[#1e3329] transition-colors"
              >
                <Package className="w-4 h-4" />
                Mis pedidos
              </Link>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-[#e8ddd0] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#2a2a2a]">Pedidos recientes</h3>
              <Link href="/pedidos" className="text-sm text-[#2d4a3e] hover:underline">
                Ver todos
              </Link>
            </div>

            {!recentOrders || recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-10 h-10 text-[#e8ddd0] mx-auto mb-3" />
                <p className="text-sm text-[#a08c7a]">Aún no tienes pedidos</p>
                <Link href="/productos" className="text-sm text-[#2d4a3e] hover:underline mt-1 block">
                  Empezar a comprar →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: 'text-[#a08c7a] bg-[#a08c7a]/10' }
                  return (
                    <Link
                      key={order.id}
                      href={`/pedidos/${order.id}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#e8ddd0] hover:border-[#a08c7a] hover:bg-[#f9f6f1] transition-all"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#2a2a2a]">{order.order_number}</p>
                        <p className="text-xs text-[#a08c7a]">
                          {new Date(order.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#2a2a2a]">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(order.total)}
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
      </div>
    </div>
  )
}
