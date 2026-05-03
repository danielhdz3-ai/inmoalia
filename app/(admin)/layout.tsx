import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, RefreshCw, ArrowLeft } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/sincronizacion', label: 'Sincronización', icon: RefreshCw },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9f6f1] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border-r border-[#e8ddd0] fixed top-0 left-0 h-full z-30">
        <div className="p-5 border-b border-[#e8ddd0]">
          <Link href="/" className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[#2a2a2a]">INMOALIA</span>
            <span className="text-[9px] tracking-[0.2em] text-[#a08c7a] uppercase">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6b5344] hover:bg-[#f9f6f1] hover:text-[#2d4a3e] transition-colors group"
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-[#e8ddd0]">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#a08c7a] hover:text-[#2d4a3e] hover:bg-[#f9f6f1] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Ver tienda
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-[#e8ddd0] px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="text-base font-bold text-[#2a2a2a]">Admin</Link>
        <div className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="p-2 rounded-lg text-[#a08c7a] hover:text-[#2d4a3e] hover:bg-[#f9f6f1] transition-colors" title={item.label}>
              <item.icon className="w-4 h-4" />
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-56 pt-0 md:pt-0">
        <div className="md:hidden h-14" /> {/* Mobile spacer */}
        {children}
      </div>
    </div>
  )
}
