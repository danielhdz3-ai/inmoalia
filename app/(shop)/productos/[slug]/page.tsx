import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { JsonLd } from '@/components/seo/JsonLd'
import ProductDetail from '@/components/shop/ProductDetail'
import ProductBundleBlock from '@/components/shop/ProductBundleBlock'
import {
  breadcrumbProductJsonLd,
  faqPageJsonLd,
  productJsonLd,
} from '@/lib/seo/jsonld-builders'
import { buildProductFaqs } from '@/lib/seo/product-faq'
import { productOpenGraphImages } from '@/lib/seo/product-images'
import { bundlesForProduct } from '@/lib/content/bundles'
import { getEnhancedRelatedProducts, getProductsBySlugs } from '@/lib/shop/product-discovery'
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Producto no encontrado' }

  const canonicalPath = `/productos/${slug}`
  const ogImages = productOpenGraphImages(product)

  return {
    title: product.meta_title ?? product.name,
    description: product.meta_desc ?? product.description ?? '',
    alternates: { canonical: absoluteUrl(canonicalPath) },
    openGraph: {
      title: product.meta_title ?? product.name,
      description: product.meta_desc ?? '',
      url: absoluteUrl(canonicalPath),
      images: ogImages,
      type: 'website',
    },
    twitter: {
      card: ogImages.length ? 'summary_large_image' : 'summary',
      images: ogImages.map((i) => i.url),
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const faqs = buildProductFaqs(product)
  const { related, collection, collectionName, collectionSlug } = await getEnhancedRelatedProducts(product)

  const productBundles = bundlesForProduct(slug)
  const bundleBlocks = await Promise.all(
    productBundles.map(async (b) => ({
      bundle: b,
      products: await getProductsBySlugs(b.productSlugs),
    })),
  )

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd data={breadcrumbProductJsonLd(product)} />
      <JsonLd data={faqPageJsonLd(faqs)} />

      <ProductDetail
        product={product}
        relatedProducts={related}
        collectionProducts={collection}
        collectionName={collectionName}
        collectionSlug={collectionSlug}
        faqs={faqs}
      />

      {bundleBlocks.map(({ bundle, products }) => (
        <div key={bundle.slug} className="max-w-7xl mx-auto px-4 sm:px-6">
          <ProductBundleBlock bundle={bundle} products={products} currentSlug={slug} />
        </div>
      ))}
    </>
  )
}
