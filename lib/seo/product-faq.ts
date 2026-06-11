import type { Product } from '@/lib/supabase/types'
import { DELIVERY_SCOPE, DELIVERY_TIME_SHORT } from '@/lib/shop/shipping'
import { SUPPORT_EMAIL } from '@/lib/support'

export interface ProductFaqItem {
  question: string
  answer: string
}

export function buildProductFaqs(product: Product): ProductFaqItem[] {
  const faqs: ProductFaqItem[] = []

  faqs.push({
    question: '¿Cuál es el plazo de entrega?',
    answer:
      `Enviamos en ${DELIVERY_TIME_SHORT} en ${DELIVERY_SCOPE}. Recibirás confirmación y seguimiento por email cuando salga tu pedido.`,
  })

  if (product.stock > 0) {
    faqs.push({
      question: '¿Hay stock disponible?',
      answer:
        product.stock <= 5
          ? `Sí, quedan ${product.stock} unidades en stock. Te recomendamos completar la compra pronto.`
          : `Sí, disponemos de stock (${product.stock} unidades).`,
    })
  } else {
    faqs.push({
      question: '¿Hay stock disponible?',
      answer: 'Actualmente sin stock. Puedes apuntarte a la lista de espera en esta misma ficha.',
    })
  }

  const dims = product.dimensions as { width?: number; height?: number; depth?: number } | null
  if (dims?.width || dims?.height || dims?.depth) {
    const parts = [
      dims.width != null ? `ancho ${dims.width} cm` : null,
      dims.depth != null ? `fondo ${dims.depth} cm` : null,
      dims.height != null ? `alto ${dims.height} cm` : null,
    ].filter(Boolean)
    faqs.push({
      question: '¿Cuáles son las dimensiones?',
      answer: `${product.name.split('·')[0].trim()}: ${parts.join(', ')}.`,
    })
  }

  if (product.material) {
    faqs.push({
      question: '¿De qué material está hecho?',
      answer: `Material principal: ${product.material}.`,
    })
  }

  faqs.push({
    question: '¿Cuánto cuesta el envío?',
    answer:
      `El envío está incluido en el precio que ves. No se añaden gastos de transporte al pagar. Entrega en ${DELIVERY_TIME_SHORT} en ${DELIVERY_SCOPE}.`,
  })

  faqs.push({
    question: '¿Puedo devolver el producto?',
    answer:
      `Dispones de 30 días para devoluciones. Consulta nuestra política en la página de devoluciones o escríbenos a ${SUPPORT_EMAIL} si tienes dudas sobre medidas o compatibilidad.`,
  })

  return faqs
}
