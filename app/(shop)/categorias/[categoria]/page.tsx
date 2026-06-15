import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/shop/ProductGrid'
import FilterSidebar from '@/components/shop/FilterSidebar'
import SortSelector from '@/components/shop/SortSelector'
import Pagination from '@/components/shop/Pagination'
import { JsonLd } from '@/components/seo/JsonLd'
import { CATEGORY_META } from '@/lib/shop/category-meta'
import { applyCategoryFilter } from '@/lib/shop/category-filters'
import { breadcrumbCategoryJsonLd } from '@/lib/seo/jsonld-builders'
import CategorySeoBlock from '@/components/shop/CategorySeoBlock'
import { hasListingFilters, shopPageMetadata } from '@/lib/seo/page-metadata'
import type { Product } from '@/lib/supabase/types'

const PAGE_SIZE = 24

interface Props {
  params: Promise<{ categoria: string }>
  searchParams: Promise<{ sort?: string; min?: string; max?: string; material?: string; page?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { categoria } = await params
  const sp = await searchParams
  const meta = CATEGORY_META[categoria]
  if (!meta) {
    return {
      title: 'Categoría no encontrada',
      robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    }
  }

  return shopPageMetadata(meta.name, meta.description, `/categorias/${categoria}`, {
    noindex: hasListingFilters(
      { ...sp, categoria },
      ['sort', 'min', 'max', 'material', 'featured', 'page', 'categoria'],
    ),
  })
}
export default async function CategoriaPage({ params, searchParams }: Props) {
  const { categoria } = await params
  const sp = await searchParams

  const meta = CATEGORY_META[categoria]
  if (!meta) notFound()

  const page = Math.max(1, parseInt(sp.page ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  const buildBaseQuery = () => {
    let q = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true)
    q = applyCategoryFilter(q, categoria, meta)

    if (sp.min) q = q.gte('price', parseFloat(sp.min))
    if (sp.max) q = q.lte('price', parseFloat(sp.max))
    if (sp.material) q = q.ilike('material', `%${sp.material}%`)
    if (sp.sort === 'featured') q = q.eq('is_featured', true)

    const sortMap: Record<string, { column: string; ascending: boolean }> = {
      newest:     { column: 'created_at', ascending: false },
      price_asc:  { column: 'price',      ascending: true  },
      price_desc: { column: 'price',      ascending: false },
      featured:   { column: 'created_at', ascending: false },
    }
    const sort = sortMap[sp.sort ?? 'newest'] ?? sortMap.newest
    return q.order(sort.column, { ascending: sort.ascending })
  }

  const { data: rawProducts, count } = await buildBaseQuery().range(from, to)
  const products = rawProducts as unknown as Product[] | null
  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const currentParams: Record<string, string | undefined> = { categoria, ...sp }

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams()
    if (sp.sort) params.set('sort', sp.sort)
    if (sp.min) params.set('min', sp.min)
    if (sp.max) params.set('max', sp.max)
    if (sp.material) params.set('material', sp.material)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return `/categorias/${categoria}${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <JsonLd data={breadcrumbCategoryJsonLd(categoria, meta.name)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2a2a2a] mb-2">{meta.name}</h1>
        <p className="text-[#a08c7a] text-sm max-w-xl">{meta.description}</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">
          <FilterSidebar currentParams={currentParams} />
        </aside>

        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-[#a08c7a]">
              {totalCount} producto{totalCount !== 1 ? 's' : ''}
              {totalPages > 1 && ` · Página ${page} de ${totalPages}`}
            </p>
            <SortSelector currentSort={sp.sort} />
          </div>

          <ProductGrid products={products ?? []} columns={3} />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            buildUrl={buildPageUrl}
          />

          <CategorySeoBlock categoria={categoria} />
        </div>
      </div>
      </div>
    </>
  )
}
