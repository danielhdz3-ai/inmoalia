import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/seo/JsonLd'
import ProductGrid from '@/components/shop/ProductGrid'
import { GEO_SILLA_LANDINGS, getGeoSillaLanding, getAllGeoSillaSlugs } from '@/lib/content/geo-landings'
import { CATEGORY_META } from '@/lib/shop/category-meta'
import { applyCategoryFilter } from '@/lib/shop/category-filters'
import { createClient } from '@/lib/supabase/server'
import { absoluteUrl } from '@/lib/site'
import { CHAIR_SUBCATEGORY_LINKS } from '@/lib/shop/chair-seo'
import type { Product } from '@/lib/supabase/types'

interface Props {
  params: Promise<{ ciudad: string }>
}

export async function generateStaticParams() {
  return getAllGeoSillaSlugs().map((ciudad) => ({ ciudad }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ciudad } = await params
  const landing = getGeoSillaLanding(ciudad)
  if (!landing) return { title: 'Página no encontrada' }

  return {
    title: landing.title,
    description: landing.description,
    alternates: { canonical: absoluteUrl(`/envio/sillas/${ciudad}`) },
    openGraph: {
      title: landing.title,
      description: landing.description,
      url: absoluteUrl(`/envio/sillas/${ciudad}`),
    },
  }
}

export default async function GeoSillasPage({ params }: Props) {
  const { ciudad } = await params
  const landing = getGeoSillaLanding(ciudad)
  if (!landing) notFound()

  const supabase = await createClient()
  const officeMeta = CATEGORY_META['sillas-oficina']
  let q = supabase.from('products').select('*').eq('is_active', true).limit(12)
  q = applyCategoryFilter(q, 'sillas-oficina', officeMeta)
  const { data } = await q.order('price', { ascending: true })
  const products = (data as unknown as Product[]) ?? []

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Sillas', item: absoluteUrl('/categorias/sillas') },
      {
        '@type': 'ListItem',
        position: 3,
        name: `Envío a ${landing.city}`,
        item: absoluteUrl(`/envio/sillas/${ciudad}`),
      },
    ],
  }

  return (
    <>
      <JsonLd data={breadcrumb} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <nav className="text-xs text-[#a08c7a] mb-6">
          <Link href="/categorias/sillas" className="hover:text-[#2d4a3e]">
            Sillas
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#6b5344]">Envío a {landing.city}</span>
        </nav>

        <h1 className="text-3xl font-bold text-[#2a2a2a] mb-3">{landing.title}</h1>
        <p className="text-[#6b5344] leading-relaxed max-w-3xl mb-6">{landing.localIntro}</p>

        <div className="p-5 rounded-2xl bg-[#f9f6f1] border border-[#e8ddd0] mb-8 max-w-3xl">
          <p className="text-sm text-[#6b5344] leading-relaxed">
            <strong className="text-[#2a2a2a]">Envío a {landing.city} ({landing.region}):</strong>{' '}
            {landing.deliveryNote}
          </p>
        </div>

        <h2 className="text-lg font-semibold text-[#2a2a2a] mb-3">Tipos de sillas</h2>
        <div className="flex flex-wrap gap-2 mb-10">
          {CHAIR_SUBCATEGORY_LINKS.map((sub) => (
            <Link
              key={sub.slug}
              href={`/categorias/${sub.slug}`}
              className="text-sm px-4 py-2 rounded-full border border-[#e8ddd0] bg-white text-[#2d4a3e] hover:bg-[#f9f6f1]"
            >
              {sub.label}
            </Link>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-[#2a2a2a] mb-2">
          Sillas destacadas con envío a {landing.city}
        </h2>
        <p className="text-sm text-[#a08c7a] mb-5">{products.length} modelos</p>
        <ProductGrid products={products} columns={3} />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-[#e8ddd0] bg-white">
            <h2 className="font-semibold text-[#2a2a2a] mb-3">Consejos para {landing.city}</h2>
            <ul className="space-y-2 text-sm text-[#6b5344] list-disc pl-5">
              {landing.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-2xl border border-[#e8ddd0] bg-[#f9f6f1]">
            <h2 className="font-semibold text-[#2a2a2a] mb-3">Guías de compra</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog/como-elegir-sillon-oficina-ergonomico" className="text-[#2d4a3e] hover:underline">
                  Cómo elegir silla de oficina →
                </Link>
              </li>
              <li>
                <Link href="/blog/como-elegir-sillas-comedor" className="text-[#2d4a3e] hover:underline">
                  Guía de sillas de comedor →
                </Link>
              </li>
              <li>
                <Link href="/blog/sillas-terraza-jardin-guia" className="text-[#2d4a3e] hover:underline">
                  Sillas para terraza y jardín →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-sm font-semibold text-[#a08c7a] uppercase tracking-wide mb-3">
            Envío de sillas a otras ciudades
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.values(GEO_SILLA_LANDINGS)
              .filter((g) => g.slug !== ciudad)
              .map((g) => (
                <Link
                  key={g.slug}
                  href={`/envio/sillas/${g.slug}`}
                  className="text-sm text-[#2d4a3e] hover:underline"
                >
                  Sillas en {g.city}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}
