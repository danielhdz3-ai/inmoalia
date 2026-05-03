import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PedidosListaClient from '@/components/account/PedidosListaClient'
import type { Order } from '@/lib/supabase/types'

export default async function PedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rawOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  const orders = (rawOrders as unknown as Order[]) ?? []

  return (
    <div className="max-w-4xl lg:max-w-none">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2a2a2a]">Mis pedidos</h1>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#a08c7a] mt-2 font-medium">
          Historial
        </p>
        <p className="text-sm text-[#a08c7a] mt-2 leading-relaxed">
          Consulta el estado y los detalles de cada compra.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e8ddd0] p-12 md:p-14 text-center shadow-sm">
          <Package className="w-12 h-12 text-[#e8ddd0] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#2a2a2a] tracking-tight mb-2">No tienes pedidos aún</h2>
          <p className="text-[#a08c7a] mb-6 text-sm leading-relaxed max-w-sm mx-auto">
            Cuando realices tu primer pedido, aparecerá aquí.
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2d4a3e] text-white px-6 py-3 text-sm font-medium shadow-sm transition-all duration-200 hover:bg-[#1e3329] hover:shadow-md"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <PedidosListaClient orders={orders} />
      )}
    </div>
  )
}
