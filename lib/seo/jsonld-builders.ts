import { absoluteUrl, getSiteUrl } from '@/lib/site'
import { productImageAbsoluteUrl } from '@/lib/seo/product-images'
import { CATEGORY_META } from '@/lib/shop/category-meta'
import { getShippingCostEuros } from '@/lib/shop/shipping'
import type { Product } from '@/lib/supabase/types'

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000)
}

export function organizationJsonLd() {
  const base = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'OnlineStore'],
    name: 'INMOALIA',
    alternateName: 'INMOALIA Tienda de Muebles',
    description:
      'Tienda online de muebles, decoración e iluminación para hogar, jardín y oficina. No somos una agencia inmobiliaria.',
    url: base,
    logo: absoluteUrl('/logo.png'),
    image: absoluteUrl('/logo.png'),
    areaServed: { '@type': 'Country', name: 'España' },
    knowsAbout: ['muebles', 'decoración', 'iluminación', 'jardín', 'sillas de oficina'],
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
    ? product.images
        .map((x) => (typeof x === 'string' && x.length > 0 ? productImageAbsoluteUrl(x) : undefined))
        .filter((x): x is string => Boolean(x))
    : []
  const availability =
    product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
  const descSource = product.description ?? product.meta_desc ?? ''
  const desc = stripHtml(descSource || product.name)
  const category =
    product.subcategory?.trim() ?? CATEGORY_META[product.category]?.name ?? product.category
  const shippingCost = getShippingCostEuros(product.price)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: desc,
    image: images.length ? images : undefined,
    sku: product.sku ?? undefined,
    mpn: product.sku ?? undefined,
    url,
    category,
    brand: { '@type': 'Brand', name: 'INMOALIA' },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'EUR',
      price: product.price,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'INMOALIA',
        url: base,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: String(shippingCost),
          currency: 'EUR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'ES',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
      },
    },
  }
}

export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function articleJsonLd(post: {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
}) {
  const base = getSiteUrl()
  const url = `${base}/blog/${encodeURIComponent(post.slug)}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { '@type': 'Organization', name: 'INMOALIA' },
    publisher: {
      '@type': 'Organization',
      name: 'INMOALIA',
      logo: { '@type': 'ImageObject', url: absoluteUrl('/file.svg') },
    },
    mainEntityOfPage: url,
    url,
  }
}

export function breadcrumbCollectionJsonLd(slug: string, title: string) {
  const base = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Colecciones', item: `${base}/colecciones` },
      { '@type': 'ListItem', position: 3, name: title, item: `${base}/colecciones/${encodeURIComponent(slug)}` },
    ],
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
