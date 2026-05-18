import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Package, ShoppingCart, RefreshCw, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { Order, SyncLog } from '@/lib/supabase/types'

/** Siempre datos en vivo de Supabase (sin caché de página). */
export const dynamic = 'force-dynamic'
export const revalidate = 0

function num(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = parseFloat(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

async function getStats() {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const [
      { count: productActive },
      { count: productInactive },
      { count: orderCount },
      { data: rawOrders },
      { data: rawSync, error: syncError },
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', false),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('sync_logs').select('*').order('started_at', { ascending: false }).limit(1).maybeSingle(),
    ])

    const recentOrders = rawOrders as unknown as Order[] | null
    const lastSync =
      !syncError && rawSync ? (rawSync as unknown as SyncLog) : null

    const { data: rawRevenue } = await supabase
      .from('orders')
      .select('total')
      .in('status', ['paid', 'processing', 'shipped', 'delivered'])
    const revenue = rawRevenue as unknown as { total: unknown }[] | null
    const totalRevenue = revenue?.reduce((sum, o) => sum + num(o.total), 0) ?? 0

    const active = productActive ?? 0
    const inactive = productInactive ?? 0

    return {
      productCount: active,
      productInactive: inactive,
      productTotal: active + inactive,
      orderCount,
      recentOrders,
      lastSync,
      totalRevenue,
    }
  } catch {
    return {
      productCount: 0,
      productInactive: 0,
      productTotal: 0,
      orderCount: 0,
      recentOrders: [] as Order[],
      lastSync: null,
      totalRevenue: 0,
    }
  }
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', paid: 'Pagado', processing: 'En proceso',
  shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
}

export default async function AdminDashboard() {
  const {
    productCount,
    productInactive,
    productTotal,
    orderCount,
    recentOrders,
    lastSync,
    totalRevenue,
  } = await getStats()

  const stats = [
    {
      label: 'Productos activos',
      value: productCount ?? 0,
      hint: `${productInactive ?? 0} inactivos · ${productTotal ?? 0} total en base`,
      icon: Package,
      color: 'text-[#2d4a3e]',
      bg: 'bg-[#2d4a3e]/10',
      href: '/admin/productos',
    },
    {
      label: 'Pedidos totales',
      value: orderCount ?? 0,
      hint: 'Todos los estados (incl. pendientes y cancelados)',
      icon: ShoppingCart,
      color: 'text-[#c9a84c]',
      bg: 'bg-[#c9a84c]/10',
      href: '/admin/pedidos',
    },
    {
      label: 'Ingresos (cobrados / en curso)',
      value: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalRevenue),
      hint: 'Suma de pedidos pagado, en proceso, enviado o entregado',
      icon: TrendingUp,
      color: 'text-[#27ae60]',
      bg: 'bg-[#27ae60]/10',
      href: '/admin/pedidos',
    },
    {
      label: 'Última sync',
      value: lastSync ? new Date(lastSync.started_at).toLocaleString('es-ES') : '—',
      hint: lastSync?.status === 'success' ? 'Correcta' : lastSync?.status === 'error' ? 'Con errores' : 'Sin registros',
      icon: RefreshCw,
      color: 'text-[#8e44ad]',
      bg: 'bg-[#8e44ad]/10',
      href: '/admin/sincronizacion',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Panel de administración</h1>
          <p className="text-[#a08c7a] text-sm">INMOALIA — Vista general del negocio</p>
        </div>
        <Link href="/" className="text-sm text-[#2d4a3e] hover:underline">← Ver tienda</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-2xl border border-[#e8ddd0] p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-[#2a2a2a] mb-1">{stat.value}</p>
            <p className="text-xs text-[#a08c7a]">{stat.label}</p>
            {'hint' in stat && stat.hint ? (
              <p className="text-[11px] text-[#c8bdb5] mt-1.5 leading-snug">{stat.hint}</p>
            ) : null}
          </Link>
        ))}
      </div>

      {/* Nav shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {[
          {
            href: '/admin/inventario',
            label: 'Inventario',
            desc: 'Stock, coste, margen por proveedor y enlaces.',
          },
          { href: '/admin/productos', label: 'Gestionar productos', desc: 'Ver, editar y añadir productos al catálogo' },
          { href: '/admin/pedidos', label: 'Gestionar pedidos', desc: 'Ver estado de pedidos y gestionar envíos' },
          {
            href: '/admin/proveedores',
            label: 'Proveedores',
            desc: 'Contacto, envíos y plazos por mayorista (directorio interno).',
          },
          { href: '/admin/sincronizacion', label: 'Sincronización', desc: 'Sincronizar catálogo con proveedores' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="bg-white rounded-2xl border border-[#e8ddd0] p-5 hover:border-[#2d4a3e] hover:shadow-sm transition-all group">
            <h3 className="font-semibold text-[#2a2a2a] group-hover:text-[#2d4a3e] transition-colors mb-1">{item.label}</h3>
            <p className="text-sm text-[#a08c7a]">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8ddd0]">
          <h2 className="font-semibold text-[#2a2a2a]">Pedidos recientes</h2>
          <Link href="/admin/pedidos" className="text-sm text-[#2d4a3e] hover:underline">Ver todos</Link>
        </div>
        <div className="divide-y divide-[#e8ddd0]">
          {recentOrders && recentOrders.length > 0 ? recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between px-6 py-3">
              <div>
                <p className="text-sm font-medium text-[#2a2a2a]">{order.order_number}</p>
                <p className="text-xs text-[#a08c7a]">{order.customer_email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#2a2a2a]">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(num(order.total))}
                </p>
                <p className="text-xs text-[#a08c7a]">{STATUS_LABELS[order.status] ?? order.status}</p>
              </div>
            </div>
          )) : (
            <p className="px-6 py-8 text-sm text-[#a08c7a] text-center">No hay pedidos aún</p>
          )}
        </div>
      </div>
    </div>
  )
}
