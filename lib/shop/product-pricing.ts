import type { Product } from '@/lib/supabase/types'

function parsePvpRefFromTags(tags: string[] | null | undefined): number | null {
  const tag = tags?.find((t) => t.startsWith('pvp_ref:'))
  if (!tag) return null
  const n = parseFloat(tag.replace('pvp_ref:', ''))
  return Number.isFinite(n) ? n : null
}

/** Precio de referencia tachado (PVP anterior / recomendado). */
export function getListPrice(product: Product): number | null {
  const compare = product.compare_at_price ?? parsePvpRefFromTags(product.tags)
  if (compare != null && compare > product.price) return compare
  return null
}

export function getDiscountPercent(product: Product): number | null {
  const list = getListPrice(product)
  if (!list) return null
  const pct = Math.round(((list - product.price) / list) * 100)
  return pct > 0 ? pct : null
}

export function getDiscountAmount(product: Product): number | null {
  const list = getListPrice(product)
  if (!list) return null
  const amount = list - product.price
  return amount > 0 ? amount : null
}
