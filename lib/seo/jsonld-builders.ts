import { absoluteUrl, getSiteUrl } from '@/lib/site'
import { CATEGORY_META } from '@/lib/shop/category-meta'
import type { Product } from '@/lib/supabase/types'

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000)
}

export function organizationJsonLd() {
  const base = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'INMOALIA',
    url: base,
    logo: absoluteUrl('/file.svg'),
  }
}

export function webSiteJsonLd() {
  const base = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'INMOALIA',
    url: `${base}/`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${base}/buscar?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbCategoryJsonLd(categoriaSlug: string, categoryTitle: string) {
  const base = getSiteUrl()
  const items = [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${base}/` },
    { '@type': 'ListItem', position: 2, name: 'Categorías', item: `${base}/categorias` },
    {
      '@type': 'ListItem',
      position: 3,
      name: categoryTitle,
      item: `${base}/categorias/${encodeURIComponent(categoriaSlug)}`,
    },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

export function productJsonLd(product: Product) {
  const base = getSiteUrl()
  const url = `${base}/productos/${encodeURIComponent(product.slug)}`
  const images = Array.isArray(product.images)
    ? product.images.filter((x): x is string => typeof x === 'string' && x.length > 0)
    : []
  const availability =
    product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
  const descSource = product.description ?? product.meta_desc ?? ''
  const desc = stripHtml(descSource || product.name)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: desc,
    image: images.length ? images : undefined,
    sku: product.sku ?? undefined,
    url,
    brand: { '@type': 'Brand', name: 'INMOALIA' },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'EUR',
      price: product.price,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
    },
  }
}

export function breadcrumbProductJsonLd(product: Product) {
  const base = getSiteUrl()
  const catSlug = product.category
  const catLabel = CATEGORY_META[catSlug]?.name ?? catSlug

  const items = [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${base}/` },
    {
      '@type': 'ListItem',
      position: 2,
      name: catLabel,
      item: `${base}/categorias/${encodeURIComponent(catSlug)}`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: product.name,
      item: `${base}/productos/${encodeURIComponent(product.slug)}`,
    },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}
