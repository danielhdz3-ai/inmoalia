import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/seo/JsonLd'
import ProductGrid from '@/components/shop/ProductGrid'
import { COLLECTIONS } from '@/lib/content/collections'
import { getProductsByCollectionSlug } from '@/lib/shop/product-discovery'
import { breadcrumbCollectionJsonLd } from '@/lib/seo/jsonld-builders'
import { absoluteUrl } from '@/lib/site'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return Object.keys(COLLECTIONS).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const col = COLLECTIONS[slug]
  if (!col) return { title: 'Colección no encontrada' }
  return {
    title: col.name,
    description: col.description,
    alternates: { canonical: absoluteUrl(`/colecciones/${slug}`) },
    openGraph: {
      title: col.name,
      description: col.description,
      url: absoluteUrl(`/colecciones/${slug}`),
      images: col.heroImage ? [{ url: absoluteUrl(col.heroImage) }] : [],
    },
  }
}

export default async function ColeccionPage({ params }: Props) {
  const { slug } = await params
  const col = COLLECTIONS[slug]
  if (!col) notFound()

  const products = await getProductsByCollectionSlug(slug)

  return (
    <>
      <JsonLd data={breadcrumbCollectionJsonLd(slug, col.name)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <nav className="text-xs text-[#a08c7a] mb-6">
          <Link href="/colecciones" className="hover:text-[#2d4a3e]">
            Colecciones
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#6b5344]">{col.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#2a2a2a] mb-3">{col.name}</h1>
            <p className="text-[#6b5344] leading-relaxed mb-4">{col.description}</p>
            {col.relatedCategoryHref && (
              <Link href={col.relatedCategoryHref} className="text-sm text-[#2d4a3e] font-medium hover:underline">
                Ver categoría relacionada →
              </Link>
            )}
          </div>
          {col.heroImage && (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#e8ddd0]">
              <Image src={col.heroImage} alt={col.name} fill className="object-cover" sizes="50vw" priority />
            </div>
          )}
        </div>

        <p className="text-sm text-[#a08c7a] mb-5">{products.length} producto{products.length !== 1 ? 's' : ''}</p>
        <ProductGrid products={products} columns={3} />

        {slug === 'sillas-oficina' && (
          <div className="mt-12 p-6 rounded-2xl bg-[#f9f6f1] border border-[#e8ddd0]">
            <h2 className="font-semibold text-[#2a2a2a] mb-2">¿No sabes cuál elegir?</h2>
            <p className="text-sm text-[#6b5344] mb-4">Lee nuestra guía de compra de sillas ergonómicas.</p>
            <Link href="/blog/como-elegir-sillon-oficina-ergonomico" className="text-sm text-[#2d4a3e] font-medium hover:underline">
              Cómo elegir sillón de oficina →
            </Link>
            <span className="text-[#e8ddd0] mx-2">·</span>
            <Link href="/categorias/sillas-oficina" className="text-sm text-[#2d4a3e] font-medium hover:underline">
              Ver categoría completa →
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
