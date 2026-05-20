/** Metadatos de rutas `/categorias/[slug]`. Debe coincidir con la lógica de filtrado en la página. */
export interface CategoryEntry {
  name: string
  description: string
  parent?: string
  dbSubcategory?: string
}

export const CATEGORY_META: Record<string, CategoryEntry> = {
  jardin: { name: 'Jardín y Exterior', description: 'Muebles y accesorios para transformar tu jardín y terraza en un espacio de lujo.' },
  mesas: { name: 'Mesas', description: 'Mesas de comedor, jardín y auxiliares en madera, cerámica y más materiales.' },
  sillas: { name: 'Sillas y Butacas', description: 'Sillas de comedor, butacas y taburetes para cada estancia.' },
  iluminacion: { name: 'Iluminación', description: 'Lámparas de pie, apliques y colgantes para crear la atmósfera perfecta.' },
  textil: { name: 'Textil Hogar', description: 'Cojines, alfombras, mantas y cortinas de materiales naturales premium.' },
  hogar: { name: 'Hogar', description: 'Sofás, salón y piezas para completar tu hogar con estilo.' },
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
