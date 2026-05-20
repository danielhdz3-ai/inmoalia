import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site'
import { productImageAbsoluteUrl } from '@/lib/seo/product-images'
import type { Product } from '@/lib/supabase/types'

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function GET() {
  const base = getSiteUrl()
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('slug, name, description, price, stock, images, sku, category')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })

  const products = (data as unknown as Product[]) ?? []

  const items = products
    .map((p) => {
      const link = `${base}/productos/${encodeURIComponent(p.slug)}`
      const image = productImageAbsoluteUrl(p.images?.[0])
      const desc = (p.description ?? p.name).replace(/\s+/g, ' ').trim().slice(0, 5000)
      const availability = p.stock > 0 ? 'in_stock' : 'out_of_stock'
      const price = `${Number(p.price).toFixed(2)} EUR`
      const id = p.sku ?? p.slug

      return `    <item>
      <g:id>${xmlEscape(id)}</g:id>
      <g:title>${xmlEscape(p.name.slice(0, 150))}</g:title>
      <g:description>${xmlEscape(desc)}</g:description>
      <g:link>${xmlEscape(link)}</g:link>
      ${image ? `<g:image_link>${xmlEscape(image)}</g:image_link>` : ''}
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand>INMOALIA</g:brand>
      <g:google_product_category>436</g:google_product_category>
      <g:product_type>${xmlEscape(p.category)}</g:product_type>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>INMOALIA</title>
    <link>${base}/</link>
    <description>Catálogo INMOALIA — hogar, jardín y sillas de oficina</description>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
