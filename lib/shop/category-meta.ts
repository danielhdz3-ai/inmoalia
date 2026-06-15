/** Metadatos de rutas `/categorias/[slug]`. Debe coincidir con la lógica de filtrado en la página. */
export interface CategoryEntry {
  name: string
  description: string
  parent?: string
  dbSubcategory?: string
  /** Párrafo SEO adicional bajo el listado de productos */
  seoContent?: string
  /** Guías del blog enlazadas desde la categoría */
  relatedGuides?: ReadonlyArray<{ href: string; label: string }>
  /** Subcategorías hijas (solo en categorías padre) */
  childSlugs?: readonly string[]
}

export const CATEGORY_META: Record<string, CategoryEntry> = {
  jardin: { name: 'Jardín y Exterior', description: 'Muebles y accesorios para transformar tu jardín y terraza en un espacio de lujo.' },
  mesas: { name: 'Mesas', description: 'Mesas de comedor, jardín y auxiliares en madera, cerámica y más materiales.' },
  sillas: {
    name: 'Sillas y Butacas',
    description: 'Sillas de comedor, butacas y taburetes para cada estancia.',
    childSlugs: ['sillas-oficina', 'sillas-ergonomicas', 'sillas-comedor', 'sillas-exterior'],
    seoContent:
      'Compra sillas online con envío incluido en el precio y entrega en 4–8 días laborables a toda España. Explora por tipo: oficina y teletrabajo, comedor, exterior o modelos ergonómicos.',
    relatedGuides: [
      { href: '/blog/como-elegir-sillon-oficina-ergonomico', label: 'Cómo elegir silla de oficina' },
      { href: '/blog/como-elegir-sillas-comedor', label: 'Guía de sillas de comedor' },
    ],
  },
  'sillas-oficina': {
    name: 'Sillas de oficina',
    description:
      'Sillones ergonómicos, ejecutivos y operativos para despacho y teletrabajo. Malla transpirable, basculante y regulación de altura.',
    parent: 'sillas',
    dbSubcategory: 'Sillas de oficina',
    seoContent:
      'Sillas de oficina con envío incluido y IVA en el precio. Ideales para teletrabajo, estudios y despachos profesionales. Regulación de altura, respaldo en malla o tejido y mecanismo basculante.',
    relatedGuides: [
      { href: '/blog/como-elegir-sillon-oficina-ergonomico', label: 'Guía de compra ergonómica' },
      { href: '/blog/silla-oficina-vs-gaming-diferencias', label: 'Oficina vs gaming' },
      { href: '/blog/teletrabajo-setup-silla-escritorio', label: 'Setup de teletrabajo' },
    ],
  },
  'sillas-ergonomicas': {
    name: 'Sillas ergonómicas',
    description:
      'Sillas diseñadas para largas jornadas: soporte lumbar, malla transpirable, syncro y respaldo alto.',
    seoContent:
      'Sillas ergonómicas para cuidar la espalda en jornadas de 6–8 horas. Prioriza malla, basculante o syncro según tu uso diario.',
    relatedGuides: [
      { href: '/blog/como-elegir-sillon-oficina-ergonomico', label: 'Cómo elegir sillón ergonómico' },
      { href: '/blog/teletrabajo-setup-silla-escritorio', label: 'Postura y setup' },
    ],
  },
  'sillas-comedor': {
    name: 'Sillas de comedor',
    description:
      'Sillas y butacas para mesa de comedor: tapizado, madera y diseños contemporáneos para tu comedor.',
    seoContent:
      'Sillas de comedor con envío a toda España. Combínalas con nuestras mesas de comedor y crea un conjunto coordinado.',
    relatedGuides: [
      { href: '/blog/como-elegir-sillas-comedor', label: 'Cómo elegir sillas de comedor' },
      { href: '/blog/cuantas-sillas-mesa-comedor', label: 'Cuántas sillas por mesa' },
    ],
  },
  'sillas-exterior': {
    name: 'Sillas de exterior',
    description:
      'Sillas para terraza, jardín y piscina. Materiales resistentes a intemperie y sol.',
    seoContent:
      'Sillas de exterior y jardín con envío incluido. Resistentes al sol y la humedad; ideales para terrazas, porches y zonas de piscina.',
    relatedGuides: [
      { href: '/blog/sillas-terraza-jardin-guia', label: 'Guía de sillas para terraza' },
    ],
  },
  iluminacion: { name: 'Iluminación', description: 'Lámparas de pie, apliques y colgantes para crear la atmósfera perfecta.' },
  textil: { name: 'Textil Hogar', description: 'Cojines, alfombras, mantas y cortinas de materiales naturales premium.' },
  hogar: { name: 'Hogar', description: 'Sofás, salón y piezas para completar tu hogar con estilo.' },
  muebles: { name: 'Muebles', description: 'Sofás, salón, almacenaje y piezas para completar tu hogar.' },
  ofertas: { name: 'Ofertas', description: 'Las mejores ofertas de nuestra selección con descuentos especiales.' },
  'sofas-butacas': {
    name: 'Sofás y Butacas',
    description: 'Sofás, butacas y sillones para el salón y zonas de descanso.',
    parent: 'hogar',
    dbSubcategory: 'Sofás y butacas',
  },
  salon: {
    name: 'Salón',
    description: 'Muebles de TV, mesas bajas y complementos para el salón con acabados premium.',
    parent: 'hogar',
    dbSubcategory: 'Salón',
  },
  'conjuntos-exterior': {
    name: 'Conjuntos Exterior',
    description: 'Sets completos de mesa y sillas para terraza y jardín.',
    parent: 'jardin',
    dbSubcategory: 'Conjuntos exterior',
  },
  tumbonas: {
    name: 'Tumbonas',
    description: 'Tumbonas y hamacas para disfrutar del jardín y la piscina.',
    parent: 'jardin',
    dbSubcategory: 'Tumbonas',
  },
  pergolas: {
    name: 'Pérgolas',
    description: 'Pérgolas y cenadores para crear espacios de sombra en exterior.',
    parent: 'jardin',
    dbSubcategory: 'Pérgolas',
  },
  barbacoas: {
    name: 'Barbacoas',
    description: 'Barbacoas, braseros y accesorios para disfrutar al aire libre.',
    parent: 'jardin',
    dbSubcategory: 'Barbacoas',
  },
}
