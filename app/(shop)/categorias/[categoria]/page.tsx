import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/shop/ProductGrid'
import FilterSidebar from '@/components/shop/FilterSidebar'
import type { Product } from '@/lib/supabase/types'

interface Props {
  params: Promise<{ categoria: string }>
  searchParams: Promise<{ sort?: string; min?: string; max?: string; material?: string }>
}

const CATEGORY_META: Record<string, { name: string; description: string }> = {
  jardin: { name: 'Jardín y Exterior', description: 'Muebles y accesorios para transformar tu jardín y terraza en un espacio de lujo.' },
  mesas: { name: 'Mesas', description: 'Mesas de comedor, jardín y auxiliares en madera, cerámica y más materiales.' },
  sillas: { name: 'Sillas y Butacas', description: 'Sillas de comedor, butacas y taburetes para cada estancia.' },
  iluminacion: { name: 'Iluminación', description: 'Lámparas de pie, apliques y colgantes para crear la atmósfera perfecta.' },
  decoracion: { name: 'Decoración', description: 'Espejos, cuadros, jarrones y piezas únicas para personalizar tu hogar.' },
  textil: { name: 'Textil Hogar', description: 'Cojines, alfombras, mantas y cortinas de materiales naturales premium.' },
  muebles: { name: 'Muebles', description: 'Sofás, estanterías y muebles para completar tu hogar.' },
  outlet: { name: 'Outlet', description: 'Las mejores ofertas de nuestra selección con descuentos especiales.' },
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

  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('category', categoria)

  if (sp.min) query = query.gte('price', parseFloat(sp.min))
  if (sp.max) query = query.lte('price', parseFloat(sp.max))
  if (sp.material) query = query.ilike('material', `%${sp.material}%`)

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    newest: { column: 'created_at', ascending: false },
    price_asc: { column: 'price', ascending: true },
    price_desc: { column: 'price', ascending: false },
  }
  const sort = sortMap[sp.sort ?? 'newest'] ?? sortMap.newest
  query = query.order(sort.column, { ascending: sort.ascending })

  const { data: rawProducts } = await query
  const products = rawProducts as unknown as Product[] | null
  const currentParams: Record<string, string | undefined> = { categoria, ...sp }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2a2a2a] mb-2">{meta.name}</h1>
        <p className="text-[#a08c7a] text-sm max-w-xl">{meta.description}</p>
        <p className="text-[#a08c7a] text-xs mt-1">{products?.length ?? 0} productos</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">
          <FilterSidebar currentParams={currentParams} />
        </aside>
        <div className="flex-1 min-w-0">
          <ProductGrid products={products ?? []} columns={3} />
        </div>
      </div>
    </div>
  )
}
