import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/shop/ProductGrid'
import FilterSidebar from '@/components/shop/FilterSidebar'
import SortSelector from '@/components/shop/SortSelector'
import Pagination from '@/components/shop/Pagination'
import type { Product } from '@/lib/supabase/types'

const PAGE_SIZE = 24

interface Props {
  params: Promise<{ categoria: string }>
  searchParams: Promise<{ sort?: string; min?: string; max?: string; material?: string; page?: string }>
}

interface CategoryEntry {
  name: string
  description: string
  /** If set, filters by `subcategory` field using `dbSubcategory` value */
  parent?: string
  /** Exact value stored in the `subcategory` column of the DB */
  dbSubcategory?: string
}

const CATEGORY_META: Record<string, CategoryEntry> = {
  // Top-level categories (filter by `category`)
  jardin:      { name: 'Jardín y Exterior',  description: 'Muebles y accesorios para transformar tu jardín y terraza en un espacio de lujo.' },
  mesas:       { name: 'Mesas',              description: 'Mesas de comedor, jardín y auxiliares en madera, cerámica y más materiales.' },
  sillas:      { name: 'Sillas y Butacas',   description: 'Sillas de comedor, butacas y taburetes para cada estancia.' },
  iluminacion: { name: 'Iluminación',        description: 'Lámparas de pie, apliques y colgantes para crear la atmósfera perfecta.' },
  decoracion:  { name: 'Decoración',         description: 'Espejos, cuadros, jarrones y piezas únicas para personalizar tu hogar.' },
  textil:      { name: 'Textil Hogar',       description: 'Cojines, alfombras, mantas y cortinas de materiales naturales premium.' },
  muebles:     { name: 'Muebles',            description: 'Sofás, estanterías y muebles para completar tu hogar.' },
  outlet:      { name: 'Outlet',             description: 'Las mejores ofertas de nuestra selección con descuentos especiales.' },

  // Subcategories of Muebles
  'sofas-butacas': { name: 'Sofás y Butacas', description: 'Sofás, butacas y sillones para el salón y zonas de descanso.', parent: 'muebles', dbSubcategory: 'Sofás y butacas' },
  estanterias:     { name: 'Estanterías',      description: 'Estanterías, librerías y módulos de almacenaje para el hogar.', parent: 'muebles', dbSubcategory: 'Estanterías' },

  // Subcategories of Jardín
  'conjuntos-exterior': { name: 'Conjuntos Exterior', description: 'Sets completos de mesa y sillas para terraza y jardín.', parent: 'jardin', dbSubcategory: 'Conjuntos exterior' },
  tumbonas:             { name: 'Tumbonas',            description: 'Tumbonas y hamacas para disfrutar del jardín y la piscina.', parent: 'jardin', dbSubcategory: 'Tumbonas' },
  pergolas:             { name: 'Pérgolas',            description: 'Pérgolas y cenadores para crear espacios de sombra en exterior.', parent: 'jardin', dbSubcategory: 'Pérgolas' },
  barbacoas:            { name: 'Barbacoas',           description: 'Barbacoas, braseros y accesorios para disfrutar al aire libre.', parent: 'jardin', dbSubcategory: 'Barbacoas' },

  // Subcategories of Decoración
  espejos:  { name: 'Espejos',  description: 'Espejos decorativos para el salón, dormitorio y baño.', parent: 'decoracion', dbSubcategory: 'Espejos' },
  cuadros:  { name: 'Cuadros',  description: 'Cuadros y láminas de arte para personalizar tus paredes.', parent: 'decoracion', dbSubcategory: 'Cuadros' },
  jarrones: { name: 'Jarrones', description: 'Jarrones, figuras y piezas decorativas para el hogar.', parent: 'decoracion', dbSubcategory: 'Jarrones' },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params
  const meta = CATEGORY_META[categoria]
  if (!meta) return { title: 'Categoría no encontrada' }
  return {
    title: meta.name,
    description: meta.description,
  }
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

    if (meta.parent && meta.dbSubcategory) {
      q = q.eq('category', meta.parent).eq('subcategory', meta.dbSubcategory)
    } else {
      q = q.eq('category', categoria)
    }

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
        </div>
      </div>
    </div>
  )
}
