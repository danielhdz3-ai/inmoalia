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
  muebles: { name: 'Muebles', description: 'Sofás, estanterías y muebles para completar tu hogar.' },
  outlet: { name: 'Outlet', description: 'Las mejores ofertas de nuestra selección con descuentos especiales.' },
  'sofas-butacas': {
    name: 'Sofás y Butacas',
    description: 'Sofás, butacas y sillones para el salón y zonas de descanso.',
    parent: 'muebles',
    dbSubcategory: 'Sofás y butacas',
  },
  estanterias: {
    name: 'Estanterías',
    description: 'Estanterías, librerías y módulos de almacenaje para el hogar.',
    parent: 'muebles',
    dbSubcategory: 'Estanterías',
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
