'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Search, Menu, User, Heart, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  {
    label: 'Muebles',
    href: '/categorias/muebles',
    children: [
      { label: 'Mesas', href: '/categorias/mesas' },
      { label: 'Sillas', href: '/categorias/sillas' },
      { label: 'Sofás y butacas', href: '/categorias/sofas-butacas' },
      { label: 'Estanterías', href: '/categorias/estanterias' },
    ],
  },
  {
    label: 'Jardín',
    href: '/categorias/jardin',
    children: [
      { label: 'Conjuntos exterior', href: '/categorias/conjuntos-exterior' },
      { label: 'Tumbonas', href: '/categorias/tumbonas' },
      { label: 'Pérgolas', href: '/categorias/pergolas' },
      { label: 'Barbacoas', href: '/categorias/barbacoas' },
    ],
  },
  {
    label: 'Iluminación',
    href: '/categorias/iluminacion',
  },
  {
    label: 'Outlet',
    href: '/categorias/outlet',
  },
]

export default function Header() {
  const pathname = usePathname()
  const itemCount = useCartStore((s) => s.getItemCount())
  const openCart = useCartStore((s) => s.openCart)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-[#2d4a3e] text-white text-center py-2 px-4 text-xs font-medium tracking-wide">
        Envío gratuito en pedidos desde 600€ · Entrega en 2-5 días laborables
      </div>

      <header
        className={cn(
          'sticky top-0 z-40 w-full bg-[#fdfcfa] transition-shadow duration-300',
          isScrolled && 'shadow-sm border-b border-[#e8ddd0]'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex flex-col items-start leading-none group"
            >
              <span className="text-xl md:text-2xl font-bold tracking-tight text-[#2a2a2a] group-hover:text-[#2d4a3e] transition-colors">
                INMOALIA
              </span>
              <span className="text-[9px] md:text-[10px] tracking-[0.25em] text-[#a08c7a] uppercase font-medium">
                Hogar & Jardín
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.href}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(link.href)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      pathname.startsWith(link.href)
                        ? 'text-[#2d4a3e] bg-[#f9f6f1]'
                        : 'text-[#2a2a2a] hover:text-[#2d4a3e] hover:bg-[#f9f6f1]'
                    )}
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                    )}
                  </Link>

                  {link.children && activeDropdown === link.href && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-[#e8ddd0] rounded-xl shadow-lg py-2 min-w-[180px] z-50">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-[#2a2a2a] hover:bg-[#f9f6f1] hover:text-[#2d4a3e] transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Link
                href="/buscar"
                className="p-2.5 rounded-lg text-[#2a2a2a] hover:bg-[#f9f6f1] hover:text-[#2d4a3e] transition-colors hidden sm:flex"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </Link>
              <Link
                href="/favoritos"
                className="p-2.5 rounded-lg text-[#2a2a2a] hover:bg-[#f9f6f1] hover:text-[#2d4a3e] transition-colors hidden sm:flex"
                aria-label="Favoritos"
              >
                <Heart className="w-5 h-5" />
              </Link>
              <Link
                href="/cuenta"
                className="p-2.5 rounded-lg text-[#2a2a2a] hover:bg-[#f9f6f1] hover:text-[#2d4a3e] transition-colors hidden sm:flex"
                aria-label="Mi cuenta"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart button */}
              <button
                onClick={() => openCart()}
                className="relative p-2.5 rounded-lg text-[#2a2a2a] hover:bg-[#f9f6f1] hover:text-[#2d4a3e] transition-colors"
                aria-label="Carrito"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#2d4a3e] text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center leading-none min-w-[18px] min-h-[18px] px-1">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                className="p-2.5 rounded-lg text-[#2a2a2a] hover:bg-[#f9f6f1] transition-colors md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menú"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#e8ddd0] bg-white">
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                      pathname.startsWith(link.href)
                        ? 'text-[#2d4a3e] bg-[#f9f6f1]'
                        : 'text-[#2a2a2a] hover:bg-[#f9f6f1]'
                    )}
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="ml-4 mt-1 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-3 py-2 text-xs text-[#6b5344] hover:text-[#2d4a3e] transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-[#e8ddd0] flex gap-4">
                <Link href="/buscar" className="flex items-center gap-2 text-sm text-[#6b5344]">
                  <Search className="w-4 h-4" /> Buscar
                </Link>
                <Link href="/cuenta" className="flex items-center gap-2 text-sm text-[#6b5344]">
                  <User className="w-4 h-4" /> Mi cuenta
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
