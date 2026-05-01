import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/shop/ProductGrid'
import { Search } from 'lucide-react'
import type { Product } from '@/lib/supabase/types'
import SearchInput from '@/components/shop/SearchInput'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `"${q}" — Búsqueda | INMOALIA` : 'Buscar productos | INMOALIA',
  }
}

async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.trim().length < 2) return []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,tags.cs.{${query}}`)
      .order('is_featured', { ascending: false })
      .limit(40)
    return (data as unknown as Product[]) ?? []
  } catch {
    return []
  }
}

export default async function BuscarPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const results = await searchProducts(query)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Buscador */}
      <div className="max-w-2xl mx-auto mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2a2a2a] mb-6 text-center">
          ¿Qué estás buscando?
        </h1>
        <SearchInput initialValue={query} />
      </div>

      {/* Resultados */}
      {query.length >= 2 ? (
        <>
          <p className="text-sm text-[#a08c7a] mb-6">
            {results.length > 0
              ? <>{results.length} resultado{results.length !== 1 ? 's' : ''} para <strong className="text-[#2a2a2a]">&ldquo;{query}&rdquo;</strong></>
              : <>No encontramos resultados para <strong className="text-[#2a2a2a]">&ldquo;{query}&rdquo;</strong></>
            }
          </p>

          {results.length > 0 ? (
            <ProductGrid products={results} />
          ) : (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-[#e8ddd0] mx-auto mb-4" />
              <p className="text-[#a08c7a] mb-2">Prueba con otros términos</p>
              <p className="text-sm text-[#a08c7a]">
                Intenta buscar por categoría, material o tipo de producto (ej: &ldquo;ratán&rdquo;, &ldquo;jardín&rdquo;, &ldquo;mesa&rdquo;)
              </p>
            </div>
          )}
        </>
      ) : query.length > 0 ? (
        <p className="text-center text-sm text-[#a08c7a]">Escribe al menos 2 caracteres para buscar.</p>
      ) : (
        <div className="text-center py-12">
          <p className="text-[#a08c7a] text-sm">Busca por nombre, categoría o material</p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {['Jardín', 'Mesas', 'Sillas', 'Iluminación', 'Ratán', 'Madera', 'Terciopelo', 'Exterior'].map((s) => (
              <a
                key={s}
                href={`/buscar?q=${encodeURIComponent(s)}`}
                className="px-3 py-1.5 rounded-full border border-[#e8ddd0] text-sm text-[#6b5344] hover:border-[#a08c7a] hover:bg-[#f9f6f1] transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
