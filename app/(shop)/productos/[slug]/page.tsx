import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { JsonLd } from '@/components/seo/JsonLd'
import ProductDetail from '@/components/shop/ProductDetail'
import { breadcrumbProductJsonLd, productJsonLd } from '@/lib/seo/jsonld-builders'
import { absoluteUrl } from '@/lib/site'
import type { Product } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  if (error || !data) return null
  return data as unknown as Product
}

async function getRelatedProducts(category: string, currentId: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .neq('id', currentId)
    .limit(4)
  return (data as unknown as Product[]) ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Producto no encontrado' }

  const canonicalPath = `/productos/${slug}`

  return {
    title: product.meta_title ?? product.name,
    description: product.meta_desc ?? product.description ?? '',
    alternates: { canonical: absoluteUrl(canonicalPath) },
    openGraph: {
      title: product.meta_title ?? product.name,
      description: product.meta_desc ?? '',
      url: canonicalPath,
      images: product.images[0] ? [{ url: product.images[0], alt: product.name }] : [],
      type: 'website',
    },
    twitter: {
      card: product.images[0] ? 'summary_large_image' : 'summary',
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category, product.id)

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd data={breadcrumbProductJsonLd(product)} />

      <ProductDetail product={product} relatedProducts={related} />
    </>
  )
}
