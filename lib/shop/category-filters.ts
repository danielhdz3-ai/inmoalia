import type { CategoryEntry } from '@/lib/shop/category-meta'

/** Slugs con lógica de filtrado personalizada (no solo parent + dbSubcategory). */
export const SPECIAL_CATEGORY_SLUGS = new Set([
  'mesas',
  'muebles',
  'hogar',
  'ofertas',
  'salon',
  'sillas-oficina',
  'sillas-comedor',
  'sillas-exterior',
  'sillas-ergonomicas',
])

export function applyCategoryFilter<Q extends { or: (filter: string) => Q; eq: (col: string, val: string) => Q }>(
  q: Q,
  categoria: string,
  meta: CategoryEntry,
): Q {
  if (categoria === 'mesas') {
    return q.or('category.eq.mesas,tags.cs.{mesas}')
  }
  if (categoria === 'muebles' || categoria === 'hogar') {
    return q.eq('category', 'hogar')
  }
  if (categoria === 'ofertas') {
    return q.or('category.eq.ofertas,tags.cs.{ofertas}')
  }
  if (categoria === 'salon') {
    return q.or('and(category.eq.hogar,subcategory.eq.Salón),tags.cs.{salon}')
  }
  if (categoria === 'sillas-oficina') {
    return q.or(
      'and(category.eq.sillas,subcategory.eq.Sillas de oficina),' +
        'and(category.eq.ofertas,subcategory.eq.Sillas de oficina),' +
        'tags.cs.{oficina}',
    )
  }
  if (categoria === 'sillas-comedor') {
    return q.or(
      'and(category.eq.sillas,subcategory.eq.Sillas de comedor),' +
        'and(category.eq.sillas,tags.cs.{comedor}),' +
        'and(category.eq.sillas,tags.cs.{butaca})',
    )
  }
  if (categoria === 'sillas-ergonomicas') {
    return q.or(
      'and(category.eq.sillas,tags.cs.{ergonómico}),' +
        'and(category.eq.sillas,tags.cs.{ergonomico}),' +
        'and(category.eq.ofertas,subcategory.eq.Sillas de oficina,tags.cs.{ergonómico}),' +
        'and(category.eq.ofertas,subcategory.eq.Sillas de oficina,tags.cs.{ergonomico})',
    )
  }
  if (categoria === 'sillas-exterior') {
    return q.or(
      'and(category.eq.jardin,tags.cs.{silla}),' +
        'and(category.eq.jardin,tags.cs.{exterior}),' +
        'and(category.eq.sillas,subcategory.eq.Sillas de exterior),' +
        'and(category.eq.sillas,tags.cs.{exterior})',
    )
  }
  if (meta.parent && meta.dbSubcategory) {
    return q.eq('category', meta.parent).eq('subcategory', meta.dbSubcategory)
  }
  return q.eq('category', categoria)
}
