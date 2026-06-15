import { DELIVERY_SCOPE, DELIVERY_TIME_ASCII } from '@/lib/shop/shipping'

export interface GeoSillaLanding {
  slug: string
  city: string
  region: string
  title: string
  description: string
  /** Párrafo único con contexto local (evita thin content duplicado) */
  localIntro: string
  deliveryNote: string
  tips: readonly string[]
}

export const GEO_SILLA_LANDINGS: Record<string, GeoSillaLanding> = {
  madrid: {
    slug: 'madrid',
    city: 'Madrid',
    region: 'Comunidad de Madrid',
    title: 'Sillas online con envío a Madrid',
    description:
      'Compra sillas de oficina, comedor y exterior con envío incluido a Madrid y alrededores. Entrega en 4–8 días laborables.',
    localIntro:
      'En Madrid y área metropolitana muchos clientes buscan sillas de oficina para teletrabajo en pisos compactos o sillones ergonómicos para despachos en el centro. INMOALIA envía a toda la capital y municipios del cinturón (Móstoles, Alcalá, Las Rozas, Pozuelo…) con el mismo precio final: envío incluido.',
    deliveryNote:
      'El plazo habitual a Madrid es de 4–8 días laborables desde la confirmación del pedido. Recibirás tracking por email cuando el pedido salga del almacén.',
    tips: [
      'Mide el hueco bajo el escritorio si buscas silla de oficina (fondo útil ~50–55 cm).',
      'Para comedor en pisos pequeños, prioriza sillas apilables o sin brazos.',
      'Consulta nuestras guías de ergonomía antes de elegir modelo.',
    ],
  },
  barcelona: {
    slug: 'barcelona',
    city: 'Barcelona',
    region: 'Cataluña',
    title: 'Sillas online con envío a Barcelona',
    description:
      'Sillas de oficina, comedor y terraza con envío a Barcelona y área metropolitana. Precio con envío incluido.',
    localIntro:
      'Barcelona combina pisos urbanos, terrazas en ensanche y segundas residencias en el Maresme y Garraf. Ofrecemos sillas de oficina para teletrabajo, butacas de comedor y modelos de exterior resistentes al sol mediterráneo.',
    deliveryNote:
      'Enviamos a Barcelona ciudad, L’Hospitalet, Badalona, Sabadell, Terrassa y resto de provincia con entrega estimada de 4–8 días laborables.',
    tips: [
      'Para terrazas barcelonesas, elige materiales resistentes a humedad y salitre si vives cerca del mar.',
      'En loft abiertos, una silla de diseño sobrio encaja mejor que estética gaming.',
      'Revisa las medidas del ascensor si el pedido incluye butacas voluminosas.',
    ],
  },
  valencia: {
    slug: 'valencia',
    city: 'Valencia',
    region: 'Comunidad Valenciana',
    title: 'Sillas online con envío a Valencia',
    description:
      'Sillas ergonómicas, de comedor y jardín con envío a Valencia y provincia. IVA y transporte incluidos en el precio.',
    localIntro:
      'Valencia destaca por viviendas con terraza y comedor integrado al salón. Nuestra selección incluye sillas de exterior para patios valencianos y sillones de oficina para coworkings y teletrabajo en la ciudad del Turia.',
    deliveryNote:
      'Cobertura en Valencia capital, Alicante, Castellón y municipios costeros. Plazo orientativo: 4–8 días laborables en ' +
      DELIVERY_SCOPE +
      '.',
    tips: [
      'Para exterior en Valencia, prioriza tejidos y estructuras que soporten sol intenso.',
      'Si trabajas desde un chalet en la huerta, valora respaldo alto y ruedas para suelos duros.',
      'Combina sillas de comedor con nuestras mesas en la misma paleta de madera o tapizado.',
    ],
  },
  sevilla: {
    slug: 'sevilla',
    city: 'Sevilla',
    region: 'Andalucía',
    title: 'Sillas online con envío a Sevilla',
    description:
      'Compra sillas de oficina y comedor con envío a Sevilla y Andalucía occidental. Envío incluido en el precio.',
    localIntro:
      'En Sevilla el calor marca la elección: sillas de malla para oficina y modelos ligeros para terrazas y patios andaluces. Enviamos a la capital, Dos Hermanas, Alcalá de Guadaíra y provincia sin recargo por zona.',
    deliveryNote:
      'Entrega estimada de ' +
      DELIVERY_TIME_ASCII +
      ' a domicilio en Sevilla y resto de península.',
    tips: [
      'Malla transpirable es clave para despachos sin aire acondicionado en verano.',
      'En casas señoriales del centro, mide puertas estrechas antes de comprar butacas anchas.',
      'Para exterior, evita dejar sillas de tela expuestas al sol del mediodía sin protección.',
    ],
  },
  malaga: {
    slug: 'malaga',
    city: 'Málaga',
    region: 'Andalucía',
    title: 'Sillas online con envío a Málaga',
    description:
      'Sillas de terraza, oficina y comedor con envío a Málaga y Costa del Sol. Precio final con envío incluido.',
    localIntro:
      'Málaga y la Costa del Sol mezclan teletrabajo, turismo residencial y vida en terraza. Tenemos sillas de exterior para áticos en Marbella o Fuengirola y sillones ergonómicos para oficinas en el Parque Tecnológico o el centro histórico.',
    deliveryNote:
      'Envío a Málaga capital, Torremolinos, Benalmádena, Estepona y toda la provincia en ' +
      DELIVERY_TIME_ASCII +
      '.',
    tips: [
      'En viviendas de playa, elige materiales fáciles de limpiar (sal y arena).',
      'Para home office con vistas al mar, una silla de malla clara reduce calor visual.',
      'Consulta la guía de sillas de terraza antes de amueblar tu porche.',
    ],
  },
}

export function getGeoSillaLanding(slug: string): GeoSillaLanding | undefined {
  return GEO_SILLA_LANDINGS[slug]
}

export function getAllGeoSillaSlugs(): string[] {
  return Object.keys(GEO_SILLA_LANDINGS)
}
