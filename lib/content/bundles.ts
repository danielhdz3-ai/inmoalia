export interface ProductBundle {
  slug: string
  name: string
  description: string
  productSlugs: string[]
  /** Descuento % sobre la suma de PVP individuales */
  discountPct: number
}

export const PRODUCT_BUNDLES: ProductBundle[] = [
  {
    slug: 'pack-salon-eloise',
    name: 'Pack Salón ELOISE',
    description: 'Mueble de TV 180 cm + mesa baja a juego. Ahorra comprando el conjunto.',
    productSlugs: [
      'mueble-de-tv-eloise-biiaminado-marmol-blanco-con-detalles-dorados-180-cms',
      'mesa-baja-eloise-biiaminado-marmol-blanco-89-5-cms',
    ],
    discountPct: 5,
  },
]

export function bundlesForProduct(slug: string): ProductBundle[] {
  return PRODUCT_BUNDLES.filter((b) => b.productSlugs.includes(slug) && b.productSlugs.length >= 2)
}
