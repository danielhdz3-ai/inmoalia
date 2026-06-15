import { createClient } from '@/lib/supabase/server'
import { productImageAbsoluteUrl } from '@/lib/seo/product-images'
import { absoluteUrl } from '@/lib/site'
import { isIndexableProduct } from '@/lib/seo/indexable-products'
import {
  googleProductCategoryForChair,
  googleProductTypeForChair,
  isChairProduct,
} from '@/lib/shop/chair-seo'
import type { Product } from '@/lib/supabase/types'

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function productFeedId(product: Pick<Product, 'sku' | 'slug' | 'id'>): string {
  return (product.sku?.trim() || product.slug || product.id).slice(0, 50)
}

function formatFeedPrice(price: number): string {
  return `${Number(price).toFixed(2)} EUR`
}

function buildFeedItem(product: Product): string | null {
  const image = productImageAbsoluteUrl(product.images?.[0])
  if (!image) return null

  const link = absoluteUrl(`/productos/${encodeURIComponent(product.slug)}`)
  const rawDesc = product.meta_desc?.trim() || product.description?.trim() || product.name
  const description = stripHtml(rawDesc).slice(0, 5000)
  const availability = product.stock > 0 ? 'in_stock' : 'out_of_stock'
  const isChair = isChairProduct(product)
  const googleCategory = isChair ? googleProductCategoryForChair(product) : '436'
  const productType = isChair
    ? googleProductTypeForChair(product)
    : product.subcategory?.trim() || product.category

  return `    <item>
      <g:id>${xmlEscape(productFeedId(product))}</g:id>
      <g:title>${xmlEscape(product.name.slice(0, 150))}</g:title>
      <g:description>${xmlEscape(description)}</g:description>
      <g:link>${xmlEscape(link)}</g:link>
      <g:image_link>${xmlEscape(image)}</g:image_link>
      <g:price>${formatFeedPrice(product.price)}</g:price>
      <g:availability>${availability}</g:availability>
      <g:brand>Inmoalia</g:brand>
      <g:condition>new</g:condition>
      <g:shipping>
        <g:country>ES</g:country>
        <g:price>0.00 EUR</g:price>
      </g:shipping>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:product_type>${xmlEscape(productType)}</g:product_type>${product.sku?.trim() ? `
      <g:mpn>${xmlEscape(product.sku.trim())}</g:mpn>` : ''}
    </item>`
}

export async function buildGoogleShoppingFeedXml(): Promise<string> {
  const base = absoluteUrl('/')
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('id, slug, name, description, meta_desc, price, stock, images, sku, category, subcategory, tags')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })

  const products = ((data as unknown as Product[]) ?? []).filter(isIndexableProduct)
  const items = products
    .map((p) => buildFeedItem(p))
    .filter((item): item is string => Boolean(item))
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>INMOALIA</title>
    <link>${xmlEscape(base)}</link>
    <description>Catálogo INMOALIA — hogar, jardín y decoración. Envío incluido en el precio.</description>
${items}
  </channel>
</rss>`
}

export const GOOGLE_SHOPPING_FEED_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
} as const
