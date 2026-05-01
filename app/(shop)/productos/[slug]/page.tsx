import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductDetail from '@/components/shop/ProductDetail'
import type { Product } from '@/lib/supabase/types'

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

  return {
    title: product.meta_title ?? product.name,
    description: product.meta_desc ?? product.description ?? '',
    openGraph: {
      title: product.meta_title ?? product.name,
      description: product.meta_desc ?? '',
      images: product.images[0] ? [{ url: product.images[0] }] : [],
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category, product.id)

  return <ProductDetail product={product} relatedProducts={related} />
}
