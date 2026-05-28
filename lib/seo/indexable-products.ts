const NON_INDEXABLE_SLUG_RE = /^(producto-test-|inmoalia-prueba-)/
const NON_INDEXABLE_TAGS = new Set(['test', 'prueba', 'interno'])

/** Productos internos/de prueba: no deben aparecer en sitemap ni feeds de Google. */
export function isIndexableProduct(product: {
  slug: string
  tags?: string[] | null
}): boolean {
  if (NON_INDEXABLE_SLUG_RE.test(product.slug)) return false
  if (product.tags?.some((t) => NON_INDEXABLE_TAGS.has(t))) return false
  return true
}
