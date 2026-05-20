import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { COLLECTIONS } from '@/lib/content/collections'
import { absoluteUrl } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Colecciones — INMOALIA',
    description: 'Colecciones coordinadas: ELOISE, SIENA, sillas de oficina y sofás LARIOS.',
    alternates: { canonical: absoluteUrl('/colecciones') },
  }
}

export default function ColeccionesPage() {
  const items = Object.values(COLLECTIONS)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">Colecciones</h1>
        <p className="text-[#a08c7a] max-w-xl">
          Productos a juego por estilo y estancia. Compra el conjunto o combina piezas sueltas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {items.map((col) => (
          <Link
            key={col.slug}
            href={`/colecciones/${col.slug}`}
            className="group relative rounded-2xl overflow-hidden border border-[#e8ddd0] aspect-[16/10] hover:shadow-lg transition-all"
          >
            {col.heroImage ? (
              <Image
                src={col.heroImage}
                alt={col.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 bg-[#f9f6f1]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-white font-bold text-xl mb-1">{col.name}</h2>
              <p className="text-white/80 text-sm line-clamp-2">{col.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
