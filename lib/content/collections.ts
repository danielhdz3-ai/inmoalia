import { chairSubcategorySlug } from '@/lib/shop/chair-seo'
import type { Product } from '@/lib/supabase/types'

export interface CollectionDef {
  slug: string
  name: string
  description: string
  /** Tag en products.tags (mayúsculas) o null si usa categoryFilter / categorySlug */
  tag?: string
  categoryFilter?: string
  /** Slug de categoría con filtro avanzado (p. ej. sillas-oficina) */
  categorySlug?: string
  heroImage?: string
  relatedCategoryHref?: string
}

export const COLLECTIONS: Record<string, CollectionDef> = {
  eloise: {
    slug: 'eloise',
    name: 'Colección ELOISE',
    description:
      'Mueble de TV y mesa baja en bilaminado mármol blanco con detalles dorados. Línea coordinada para un salón elegante y contemporáneo.',
    tag: 'ELOISE',
    heroImage: '/imagenes/productos/mueble-de-tv-eloise-biiaminado-marmol-blanco-con-detalles-dorados-180-cms-1.jpg',
    relatedCategoryHref: '/categorias/salon',
  },
  siena: {
    slug: 'siena',
    name: 'Colección SIENA',
    description:
      'Muebles de TV en mármol negro o blanco con estructura metálica dorada. Diseño premium para salones con carácter.',
    tag: 'SIENA',
    heroImage: '/imagenes/productos/mueble-de-tv-siena-biiaminado-marmol-negro-con-metal-dorado-160-cms-1.jpg',
    relatedCategoryHref: '/categorias/salon',
  },
  'sillas-oficina': {
    slug: 'sillas-oficina',
    name: 'Sillas de oficina',
    description:
      'Sillones ergonómicos, ejecutivos y gaming para teletrabajo y despacho. Malla transpirable, basculante y regulación de altura.',
    categorySlug: 'sillas-oficina',
    heroImage: '/imagenes/productos/sillon-oficina-verton-blanco-malla-y-asiento-verde-1.jpg',
    relatedCategoryHref: '/categorias/sillas-oficina',
  },
  larios: {
    slug: 'larios',
    name: 'Sofás LARIOS',
    description: 'Sofás de 2 y 3 plazas con patas doradas. Velvet, corduroy y similpiel para el salón.',
    tag: 'LARIOS',
    heroImage: '/imagenes/productos/sofa-larios-2-plazas-tejido-velvet-verde-agua-58-1.jpg',
    relatedCategoryHref: '/categorias/sofas-butacas',
  },
}

export function collectionForProduct(
  tags: string[] | null | undefined,
  category: string,
  subcategory?: string | null,
): string | null {
  const upper = new Set((tags ?? []).map((t) => t.toUpperCase()))
  for (const col of Object.values(COLLECTIONS)) {
    if (col.tag && upper.has(col.tag.toUpperCase())) return col.slug
  }
  const chairSlug = chairSubcategorySlug({
    category,
    subcategory: subcategory ?? null,
    tags: tags ?? [],
  })
  if (chairSlug === 'sillas-oficina' || chairSlug === 'sillas-ergonomicas') {
    return 'sillas-oficina'
  }
  return null
}
