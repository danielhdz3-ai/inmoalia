import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Category } from '@/lib/supabase/types'
import { absoluteUrl } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Todas las categorías — INMOALIA',
    description: 'Explora todas nuestras categorías: jardín, mesas, sillas, iluminación, textil, muebles y más.',
    alternates: {
      canonical: absoluteUrl('/categorias'),
    },
  }
}

export default async function CategoriasPage() {
  const supabase = await createClient()
  const { data: rawCategories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const categories = rawCategories as unknown as Category[] | null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">Todas las categorías</h1>
        <p className="text-[#a08c7a]">Encuentra exactamente lo que buscas para tu hogar y jardín.</p>
      </div>

      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorias/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-square border border-[#e8ddd0] hover:shadow-lg transition-all"
            >
              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-[#f9f6f1]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-white font-bold text-lg leading-tight">{cat.name}</h2>
                {cat.description && (
                  <p className="text-white/70 text-xs mt-1 line-clamp-2">{cat.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-[#a08c7a]">
          <p>No hay categorías disponibles.</p>
        </div>
      )}
    </div>
  )
}
