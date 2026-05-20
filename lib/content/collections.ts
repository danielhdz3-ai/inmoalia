export interface CollectionDef {
  slug: string
  name: string
  description: string
  /** Tag en products.tags (mayúsculas) o null si usa categoryFilter */
  tag?: string
  categoryFilter?: string
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
    categoryFilter: 'sillas',
    heroImage: '/imagenes/productos/sillon-oficina-verton-blanco-malla-y-asiento-verde-1.jpg',
    relatedCategoryHref: '/categorias/sillas',
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

export function collectionForProduct(tags: string[] | null | undefined, category: string): string | null {
  const upper = new Set((tags ?? []).map((t) => t.toUpperCase()))
  for (const col of Object.values(COLLECTIONS)) {
    if (col.tag && upper.has(col.tag.toUpperCase())) return col.slug
  }
  if (category === 'sillas') return 'sillas-oficina'
  return null
}
