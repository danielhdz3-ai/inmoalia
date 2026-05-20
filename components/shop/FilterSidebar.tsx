'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface FilterSidebarProps {
  currentParams: Record<string, string | undefined>
}

const CATEGORIES = [
  { slug: 'jardin', name: 'Jardín exterior' },
  { slug: 'mesas', name: 'Mesas' },
  { slug: 'sillas', name: 'Sillas y butacas' },
  { slug: 'iluminacion', name: 'Iluminación' },
  { slug: 'textil', name: 'Textil hogar' },
  { slug: 'hogar', name: 'Hogar' },
]

const PRICE_RANGES = [
  { label: 'Hasta 99€', min: '0', max: '99' },
  { label: '100€ — 299€', min: '100', max: '299' },
  { label: '300€ — 599€', min: '300', max: '599' },
  { label: 'Más de 600€', min: '600', max: '' },
]

const MATERIALS = [
  'Madera maciza',
  'Ratán natural',
  'Ratán sintético',
  'Aluminio',
  'Mármol',
  'Cerámica',
  'Lino',
  'Terciopelo',
]

export default function FilterSidebar({ currentParams }: FilterSidebarProps) {
  const pathname = usePathname()

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = { ...currentParams, ...overrides }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    return `${pathname}?${params.toString()}`
  }

  const clearUrl = () => pathname

  const isActive = (key: string, value: string) => currentParams[key] === value

  return (
    <div className="space-y-6">
      {/* Clear */}
      {Object.values(currentParams).some(Boolean) && (
        <div>
          <Link
            href={clearUrl()}
            className="text-xs text-[#c0392b] hover:underline font-medium"
          >
            ✕ Limpiar filtros
          </Link>
        </div>
      )}

      {/* Categories — navigate to /categorias/[slug] directly */}
      <div>
        <h3 className="text-xs font-semibold text-[#2a2a2a] uppercase tracking-wider mb-3">
          Categoría
        </h3>
        <div className="space-y-1">
          <Link
            href="/categorias"
            className="block text-sm px-2 py-1.5 rounded-lg transition-colors text-[#2a2a2a] hover:bg-[#f9f6f1] hover:text-[#2d4a3e]"
          >
            Todas
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categorias/${cat.slug}`}
              className={cn(
                'block text-sm px-2 py-1.5 rounded-lg transition-colors',
                currentParams.categoria === cat.slug
                  ? 'bg-[#2d4a3e] text-white font-medium'
                  : 'text-[#2a2a2a] hover:bg-[#f9f6f1] hover:text-[#2d4a3e]'
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-xs font-semibold text-[#2a2a2a] uppercase tracking-wider mb-3">
          Precio
        </h3>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => (
            <Link
              key={range.label}
              href={buildUrl({ min: range.min, max: range.max || undefined })}
              className={cn(
                'block text-sm px-2 py-1.5 rounded-lg transition-colors',
                currentParams.min === range.min && (currentParams.max === range.max || (!currentParams.max && !range.max))
                  ? 'bg-[#2d4a3e] text-white font-medium'
                  : 'text-[#2a2a2a] hover:bg-[#f9f6f1] hover:text-[#2d4a3e]'
              )}
            >
              {range.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Material */}
      <div>
        <h3 className="text-xs font-semibold text-[#2a2a2a] uppercase tracking-wider mb-3">
          Material
        </h3>
        <div className="space-y-1">
          {MATERIALS.map((mat) => (
            <Link
              key={mat}
              href={buildUrl({ material: mat })}
              className={cn(
                'block text-sm px-2 py-1.5 rounded-lg transition-colors',
                currentParams.material === mat
                  ? 'bg-[#2d4a3e] text-white font-medium'
                  : 'text-[#2a2a2a] hover:bg-[#f9f6f1] hover:text-[#2d4a3e]'
              )}
            >
              {mat}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured */}
      <div>
        <h3 className="text-xs font-semibold text-[#2a2a2a] uppercase tracking-wider mb-3">
          Destacados
        </h3>
        <Link
          href={buildUrl({ featured: currentParams.featured === 'true' ? undefined : 'true' })}
          className={cn(
            'block text-sm px-2 py-1.5 rounded-lg transition-colors',
            currentParams.featured === 'true'
              ? 'bg-[#c9a84c] text-white font-medium'
              : 'text-[#2a2a2a] hover:bg-[#f9f6f1] hover:text-[#2d4a3e]'
          )}
        >
          ⭐ Solo destacados
        </Link>
      </div>
    </div>
  )
}
