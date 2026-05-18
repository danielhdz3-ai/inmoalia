/** Mínimo de pedido (€, IVA incl.) para envío gratuito. */
export const FREE_SHIPPING_MIN_EUROS = 600

/**
 * Gastos de envío en euros según importe del pedido (tras descuentos en checkout).
 * Tramos según tabla operativa INMOALIA; gratis desde {@link FREE_SHIPPING_MIN_EUROS}.
 */
export function getShippingCostEuros(subtotalEuros: number): number {
  const s = Math.max(0, subtotalEuros)
  if (s >= FREE_SHIPPING_MIN_EUROS) return 0
  if (s <= 60) return 22
  if (s <= 120) return 28
  if (s <= 190) return 33
  if (s <= 300) return 39
  if (s <= 400) return 45
  if (s <= 500) return 49
  if (s <= 599) return 59
  return 0
}
