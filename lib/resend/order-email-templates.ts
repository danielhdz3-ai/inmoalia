export type OrderEmailTemplate = 'processing' | 'ready_to_ship' | 'shipped' | 'delivered'

export const ORDER_EMAIL_TEMPLATE_OPTIONS: ReadonlyArray<{
  value: OrderEmailTemplate
  label: string
  description: string
}> = [
  {
    value: 'processing',
    label: 'En proceso',
    description: 'El pedido se está gestionando en nuestro sistema.',
  },
  {
    value: 'ready_to_ship',
    label: 'A punto de salir del almacén',
    description: 'El pedido está preparado y saldrá del almacén en breve.',
  },
  {
    value: 'shipped',
    label: 'Pedido enviado',
    description: 'El pedido va de camino hacia la dirección del cliente.',
  },
  {
    value: 'delivered',
    label: 'Pedido entregado',
    description: 'El pedido ha sido entregado correctamente.',
  },
]

export const ORDER_EMAIL_TEMPLATE_COPY: Record<
  OrderEmailTemplate,
  { headline: string; body: string; subjectSuffix: string; statusLabel: string }
> = {
  processing: {
    headline: 'Estamos gestionando tu pedido',
    body: 'Tu pedido está siendo gestionado. Estamos procesando tu compra y te mantendremos informado de cada paso.',
    subjectSuffix: 'en proceso',
    statusLabel: 'En proceso',
  },
  ready_to_ship: {
    headline: 'Tu pedido sale del almacén en breve',
    body: 'Tu pedido está preparado y saldrá de nuestro almacén en breve. Te avisaremos en cuanto esté en camino.',
    subjectSuffix: 'salida de almacén',
    statusLabel: 'A punto de salir del almacén',
  },
  shipped: {
    headline: '¡Tu pedido va de camino!',
    body: 'Tu pedido ha salido de nuestro almacén y está en camino hacia tu dirección.',
    subjectSuffix: 'en camino',
    statusLabel: 'Enviado',
  },
  delivered: {
    headline: 'Pedido entregado',
    body: 'Tu pedido ha sido entregado. Esperamos que disfrutes de tu compra. Si necesitas ayuda, estamos a tu disposición.',
    subjectSuffix: 'entregado',
    statusLabel: 'Entregado',
  },
}

export function buildOrderEmailBody(template: OrderEmailTemplate, tracking?: string): string {
  const copy = ORDER_EMAIL_TEMPLATE_COPY[template]
  const t = tracking?.trim()

  switch (template) {
    case 'ready_to_ship':
      if (t) {
        return `Tu pedido saldrá de nuestro almacén en breve. Tu número de seguimiento es ${t}. Conserva este código para consultar el estado del envío.`
      }
      return copy.body
    case 'shipped':
      if (t) {
        return `Tu pedido ya ha salido de nuestro almacén y va de camino hacia tu dirección. Tu número de seguimiento es ${t}.`
      }
      return copy.body
    case 'processing':
      if (t) {
        return `${copy.body} Referencia de envío asignada: ${t}.`
      }
      return copy.body
    case 'delivered':
      if (t) {
        return `${copy.body} Referencia del envío: ${t}.`
      }
      return copy.body
    default:
      return copy.body
  }
}

/** Plantillas que muestran el bloque destacado de tracking si hay número. */
export const TEMPLATES_WITH_TRACKING = new Set<OrderEmailTemplate>([
  'ready_to_ship',
  'shipped',
  'processing',
])
