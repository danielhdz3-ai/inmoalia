import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/shop/ProductGrid'
import FilterSidebar from '@/components/shop/FilterSidebar'
import { SlidersHorizontal } from 'lucide-react'
import type { Product } from '@/lib/supabase/types'
import { hasListingFilters, shopPageMetadata } from '@/lib/seo/page-metadata'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const params = await searchParams

  return shopPageMetadata(
    'Tienda de Muebles — Catálogo Online',
    'Compra muebles, decoración e iluminación para hogar, jardín y oficina en INMOALIA. Tienda online con envío en 2-5 días. No somos una inmobiliaria.',
    '/productos',
    { noindex: hasListingFilters(params) },
  )
}

interface SearchParams {
  categoria?: string
  sort?: string
  min?: string
  max?: string
  material?: string
  color?: string
  featured?: string
  q?: string
  page?: string
  [key: string]: string | undefined
}

async function getProducts(params: SearchParams) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    if (params.categoria) {
      query = query.eq('category', params.categoria)
    }
    if (params.featured === 'true') {
      query = query.eq('is_featured', true)
    }
    if (params.material) {
      query = query.ilike('material', `%${params.material}%`)
    }
    if (params.color) {
      query = query.ilike('color', `%${params.color}%`)
    }
    if (params.min) {
      query = query.gte('price', parseFloat(params.min))
    }
    if (params.max) {
      query = query.lte('price', parseFloat(params.max))
    }
    if (params.q) {
      query = query.textSearch('name', params.q, { config: 'spanish' })
    }

    const sortMap: Record<string, { column: string; ascending: boolean }> = {
      newest: { column: 'created_at', ascending: false },
      price_asc: { column: 'price', ascending: true },
      price_desc: { column: 'price', ascending: false },
      popular: { column: 'is_featured', ascending: false },
    }
    const sort = sortMap[params.sort ?? 'newest'] ?? sortMap.newest
    query = query.order(sort.column, { ascending: sort.ascending })

    const page = parseInt(params.page ?? '1')
    const limit = 24
    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, count, error } = await query
    if (error) throw error
    return { products: (data as unknown as Product[]) ?? [], count: count ?? 0, page, limit }
  } catch {
    return { products: [] as Product[], count: 0, page: 1, limit: 24 }
  }
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'popular', label: 'Más populares' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
]

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { products, count } = await getProducts(params)

  const sortLabel = SORT_OPTIONS.find((o) => o.value === params.sort)?.label ?? 'Más recientes'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2a2a2a] mb-2">
          {params.categoria
            ? params.categoria.charAt(0).toUpperCase() + params.categoria.slice(1)
            : 'Todos los productos'}
        </h1>
        <p className="text-[#a08c7a] text-sm">
          {count} {count === 1 ? 'producto encontrado' : 'productos encontrados'}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <FilterSidebar currentParams={params} />
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Sort + mobile filter */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e8ddd0]">
            <div className="flex items-center gap-2 lg:hidden">
              <SlidersHorizontal className="w-4 h-4 text-[#a08c7a]" />
              <span className="text-sm text-[#6b5344]">Filtros</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-[#a08c7a] hidden md:block">Ordenar por:</span>
              <select
                defaultValue={params.sort ?? 'newest'}
                className="text-sm border border-[#e8ddd0] rounded-lg px-3 py-1.5 text-[#2a2a2a] bg-white focus:outline-none focus:ring-2 focus:ring-[#2d4a3e] cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ProductGrid products={products} columns={3} />

          {/* Pagination placeholder */}
          {count > 24 && (
            <div className="mt-10 flex justify-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#a08c7a]">
                  Mostrando {Math.min(24, count)} de {count} productos
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
