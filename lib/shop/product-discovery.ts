import { createClient } from '@/lib/supabase/server'
import { COLLECTIONS, collectionForProduct } from '@/lib/content/collections'
import type { Product } from '@/lib/supabase/types'

export async function getProductsByCollectionSlug(slug: string): Promise<Product[]> {
  const col = COLLECTIONS[slug]
  if (!col) return []

  const supabase = await createClient()
  let q = supabase.from('products').select('*').eq('is_active', true)

  if (col.tag) {
    q = q.contains('tags', [col.tag])
  } else if (col.categoryFilter) {
    q = q.eq('category', col.categoryFilter)
  } else {
    return []
  }

  const { data } = await q.order('price', { ascending: true })
  return (data as unknown as Product[]) ?? []
}

export async function getCollectionProductsForProduct(
  product: Product,
  limit = 4,
): Promise<{ slug: string; name: string; products: Product[] } | null> {
  const colSlug = collectionForProduct(product.tags, product.category)
  if (!colSlug) return null

  const col = COLLECTIONS[colSlug]
  if (!col) return null

  const all = await getProductsByCollectionSlug(colSlug)
  const products = all.filter((p) => p.id !== product.id).slice(0, limit)
  if (products.length === 0) return null

  return { slug: colSlug, name: col.name, products }
}

export async function getEnhancedRelatedProducts(
  product: Product,
  limit = 4,
): Promise<{ related: Product[]; collection: Product[]; collectionName: string | null; collectionSlug: string | null }> {
  const supabase = await createClient()
  const colSlug = collectionForProduct(product.tags, product.category)

  let collection: Product[] = []
  let collectionName: string | null = null

  if (colSlug) {
    const col = COLLECTIONS[colSlug]
    collectionName = col?.name ?? null
    const all = await getProductsByCollectionSlug(colSlug)
    collection = all.filter((p) => p.id !== product.id).slice(0, limit)
  }

  const relatedSlugs = new Set(collection.map((p) => p.id))
  relatedSlugs.add(product.id)

  let q = supabase.from('products').select('*').eq('is_active', true).neq('id', product.id)

  if (colSlug && COLLECTIONS[colSlug]?.tag) {
    q = q.contains('tags', [COLLECTIONS[colSlug].tag!])
  } else {
    q = q.eq('category', product.category)
  }

  const { data } = await q.limit(limit + collection.length)
  const related = ((data as unknown as Product[]) ?? [])
    .filter((p) => !relatedSlugs.has(p.id))
    .slice(0, limit)

  if (related.length < limit) {
    const { data: catRows } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category', product.category)
      .neq('id', product.id)
      .limit(limit * 2)

    const seen = new Set([product.id, ...related.map((p) => p.id), ...collection.map((p) => p.id)])
    for (const row of (catRows as unknown as Product[]) ?? []) {
      if (related.length >= limit) break
      if (!seen.has(row.id)) {
        related.push(row)
        seen.add(row.id)
      }
    }
  }

  return {
    related,
    collection,
    collectionName,
    collectionSlug: colSlug,
  }
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (!slugs.length) return []
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').in('slug', slugs).eq('is_active', true)
  const rows = (data as unknown as Product[]) ?? []
  return slugs.map((s) => rows.find((p) => p.slug === s)).filter(Boolean) as Product[]
}
