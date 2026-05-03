'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, UserRound, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/cuenta', label: 'Resumen', icon: LayoutDashboard },
  { href: '/pedidos', label: 'Mis pedidos', icon: Package },
  { href: '/cuenta/perfil', label: 'Datos y dirección', icon: UserRound },
] as const

function matches(pathname: string, href: string) {
  if (href === '/cuenta') return pathname === '/cuenta'
  if (href === '/pedidos') return pathname === '/pedidos' || pathname.startsWith('/pedidos/')
  if (href === '/cuenta/perfil') return pathname === '/cuenta/perfil'
  return false
}

export function AccountDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''

  if (pathname === '/cuenta/nueva-password') {
    return <div className="min-h-[50vh] bg-[#fdfcfa]">{children}</div>
  }

  return (
    <div className="min-h-screen bg-[#fdfcfa] pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#a08c7a] mb-3 font-medium">
          Tu cuenta
        </p>
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#a08c7a] mb-8 md:mb-10" aria-label="Migas de pan">
          <Link href="/" className="hover:text-[#2d4a3e] transition-colors duration-200">
            Inicio
          </Link>
          <span className="text-[#d4c4b0] select-none" aria-hidden>
            ·
          </span>
          <Link
            href="/cuenta"
            className="hover:text-[#2d4a3e] transition-colors duration-200 font-medium text-[#2a2a2a]"
          >
            Mi cuenta
          </Link>
        </nav>

        {/* Navegación móvil — mismo lenguaje que el header desktop */}
        <div
          className="flex md:hidden gap-2 overflow-x-auto pb-2 mb-8 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="navigation"
          aria-label="Área de cliente"
        >
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = matches(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 shrink-0 rounded-lg px-3 py-2 text-sm font-medium border transition-all duration-200',
                  active
                    ? 'border-transparent text-[#2d4a3e] bg-[#f9f6f1] shadow-sm'
                    : 'border-[#e8ddd0] bg-white text-[#2a2a2a] hover:text-[#2d4a3e] hover:border-[#d4c4b0] hover:bg-[#f9f6f1]'
                )}
              >
                <Icon className="w-4 h-4 opacity-90" aria-hidden />
                {label}
              </Link>
            )
          })}
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-10">
          <aside className="hidden md:flex flex-col w-[220px] shrink-0" aria-label="Menú de cuenta">
            <div className="rounded-xl border border-[#e8ddd0] bg-white p-2 shadow-sm">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = matches(pathname, href)
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                      active
                        ? 'text-[#2d4a3e] bg-[#f9f6f1]'
                        : 'text-[#2a2a2a] hover:text-[#2d4a3e] hover:bg-[#f9f6f1]'
                    )}
                  >
                    <Icon className="w-[17px] h-[17px] shrink-0 opacity-90" aria-hidden />
                    {label}
                  </Link>
                )
              })}
            </div>

            <form action="/api/auth/signout" method="POST" className="mt-4">
              <Button
                type="submit"
                variant="secondary"
                className="w-full justify-start gap-2 text-[#6b5344] border-[#e8ddd0] bg-[#fdfcfa] hover:bg-[#f9f6f1] hover:text-[#2a2a2a]"
                size="sm"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </Button>
            </form>
          </aside>

          <div className="flex-1 min-w-0">{children}</div>
        </div>

        <form action="/api/auth/signout" method="POST" className="mt-10 md:hidden">
          <Button type="submit" variant="secondary" className="w-full justify-center gap-2 text-[#6b5344] border-[#e8ddd0]">
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </div>
  )
}
