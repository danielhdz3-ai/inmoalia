import { CATEGORY_META } from '@/lib/shop/category-meta'
import type { Product } from '@/lib/supabase/types'

const META_DESC_MAX = 158
const META_TITLE_MAX = 58

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncateAtWord(text: string, max: number): string {
  const t = text.trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  if (lastSpace > max * 0.6) return `${cut.slice(0, lastSpace).trim()}…`
  return `${cut.trim()}…`
}

function formatPriceEur(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price)
}

function categoryLabel(product: Pick<Product, 'category' | 'subcategory'>): string {
  if (product.subcategory?.trim()) return product.subcategory.trim()
  return CATEGORY_META[product.category]?.name ?? product.category
}

function firstSentence(text: string): string {
  const clean = stripHtml(text)
  const match = clean.match(/^[^.!?]+[.!?]?/)
  return (match?.[0] ?? clean).trim()
}

/** Título SEO (sin sufijo INMOALIA; lo añade layout.template). */
export function buildProductMetaTitle(
  product: Pick<Product, 'name' | 'meta_title' | 'category' | 'subcategory'>,
): string {
  if (product.meta_title?.trim()) {
    const cleaned = product.meta_title.trim().replace(/\s*\|\s*INMOALIA\s*$/i, '')
    // Ignorar meta_title genérico más corto que el nombre del producto
    if (cleaned.length >= Math.min(product.name.length, 40)) {
      return truncateAtWord(cleaned, META_TITLE_MAX)
    }
  }

  const cat = categoryLabel(product)
  const withCat = `${product.name} · ${cat}`
  if (withCat.length <= META_TITLE_MAX) return withCat

  if (product.name.length <= META_TITLE_MAX) return product.name

  return truncateAtWord(product.name, META_TITLE_MAX)
}

/** Meta description ≤158 caracteres para SERP. */
export function buildProductMetaDescription(
  product: Pick<Product, 'name' | 'meta_desc' | 'description' | 'category' | 'subcategory' | 'price' | 'material'>,
): string {
  if (product.meta_desc?.trim() && product.meta_desc.trim().length >= 120) {
    return truncateAtWord(product.meta_desc.trim(), META_DESC_MAX)
  }

  const price = formatPriceEur(product.price)
  const cat = categoryLabel(product).toLowerCase()
  const snippet = firstSentence(product.description ?? '')
  const material = product.material?.trim()

  const variants = [
    material
      ? `${product.name}: ${material}. Compra online en INMOALIA desde ${price}. Envío 2-5 días laborables en España.`
      : null,
    snippet
      ? `${truncateAtWord(snippet, 90)} Compra en INMOALIA desde ${price}. Envío 2-5 días.`
      : null,
    `Compra ${product.name} en INMOALIA. ${cat} de calidad desde ${price}. Envío rápido a toda España.`,
    `${product.name} — ${cat} en INMOALIA. Precio ${price}. Envío 2-5 días laborables.`,
  ].filter(Boolean) as string[]

  for (const candidate of variants) {
    if (candidate.length <= META_DESC_MAX) return candidate
  }

  return truncateAtWord(variants[variants.length - 1]!, META_DESC_MAX)
}

export function buildProductKeywords(product: Pick<Product, 'name' | 'category' | 'subcategory' | 'tags' | 'material'>): string[] {
  const cat = categoryLabel(product)
  const base = [
    product.name,
    cat,
    product.category,
    product.subcategory,
    product.material,
    'INMOALIA',
    'comprar online',
    'envío España',
  ]
  const fromTags = (product.tags ?? []).filter(
    (t) => t && !t.startsWith('pvp_ref:') && t !== 'ofertas' && t !== 'test' && t !== 'interno',
  )

  return [...new Set([...base, ...fromTags].filter((k): k is string => Boolean(k?.trim())))]
}
