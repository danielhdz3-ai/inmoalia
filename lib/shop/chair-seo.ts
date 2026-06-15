import type { Product } from '@/lib/supabase/types'

/** Slug de subcategoría de sillas para breadcrumbs y enlaces internos. */
export function chairSubcategorySlug(
  product: Pick<Product, 'category' | 'subcategory' | 'tags'>,
): string | null {
  const tags = new Set((product.tags ?? []).map((t) => t.toLowerCase()))
  const sub = product.subcategory?.trim() ?? ''

  if (sub === 'Sillas de oficina' || tags.has('oficina')) {
    if (tags.has('ergonómico') || tags.has('ergonomico')) return 'sillas-ergonomicas'
    return 'sillas-oficina'
  }
  if (sub === 'Sillas de comedor' || tags.has('comedor') || tags.has('butaca')) {
    return 'sillas-comedor'
  }
  if (sub === 'Sillas de exterior' || tags.has('exterior') || product.category === 'jardin') {
    if (tags.has('silla') || tags.has('exterior') || sub.toLowerCase().includes('silla')) {
      return 'sillas-exterior'
    }
  }
  if (tags.has('ergonómico') || tags.has('ergonomico')) return 'sillas-ergonomicas'
  if (product.category === 'sillas') return 'sillas'
  return null
}

export const CHAIR_SUBCATEGORY_LINKS = [
  { slug: 'sillas-oficina', label: 'Sillas de oficina' },
  { slug: 'sillas-ergonomicas', label: 'Sillas ergonómicas' },
  { slug: 'sillas-comedor', label: 'Sillas de comedor' },
  { slug: 'sillas-exterior', label: 'Sillas de exterior' },
] as const

/** Google product category IDs (taxonomy). */
export function googleProductCategoryForChair(
  product: Pick<Product, 'category' | 'subcategory' | 'tags'>,
): string {
  const slug = chairSubcategorySlug(product)
  switch (slug) {
    case 'sillas-oficina':
    case 'sillas-ergonomicas':
      return '6364' // Office Chairs
    case 'sillas-comedor':
      return '443' // Dining Chairs
    case 'sillas-exterior':
      return '6367' // Outdoor Furniture > Outdoor Seating
    default:
      return '443'
  }
}

export function googleProductTypeForChair(
  product: Pick<Product, 'category' | 'subcategory' | 'tags'>,
): string {
  const slug = chairSubcategorySlug(product)
  const map: Record<string, string> = {
    'sillas-oficina': 'Sillas > Sillas de oficina',
    'sillas-ergonomicas': 'Sillas > Sillas ergonómicas',
    'sillas-comedor': 'Sillas > Sillas de comedor',
    'sillas-exterior': 'Sillas > Sillas de exterior',
    sillas: 'Sillas',
  }
  if (slug && map[slug]) return map[slug]
  return product.subcategory?.trim() || 'Sillas'
}

export function isChairProduct(
  product: Pick<Product, 'category' | 'subcategory' | 'tags' | 'name'>,
): boolean {
  if (product.category === 'sillas') return true
  const tags = (product.tags ?? []).map((t) => t.toLowerCase())
  if (tags.some((t) => ['oficina', 'silla', 'sillón', 'butaca', 'ergonómico', 'ergonomico'].includes(t))) {
    return true
  }
  return /sill(a|ón)|butaca/i.test(product.name)
}
