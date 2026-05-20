import { absoluteUrl } from '@/lib/site'
import type { Product } from '@/lib/supabase/types'

/** URL absoluta de imagen para Open Graph / Merchant / schema. */
export function productImageAbsoluteUrl(src: string | undefined | null): string | undefined {
  if (!src?.trim()) return undefined
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  return absoluteUrl(src.startsWith('/') ? src : `/${src}`)
}

export function productPrimaryImage(product: Product): string | undefined {
  const first = product.images?.[0]
  return productImageAbsoluteUrl(first)
}

export function productOpenGraphImages(product: Product) {
  const url = productPrimaryImage(product)
  if (!url) return []
  return [{ url, alt: product.name, width: 1200, height: 630 }]
}
