/**
 * Gastos de envío cobrados al cliente (€).
 * En INMOALIA el transporte va incluido en el precio mostrado: siempre 0 al pagar.
 */
export function getShippingCostEuros(_subtotalEuros: number): number {
  return 0
}

/** Referencia interna histórica (ya no aplica al cliente). */
export const FREE_SHIPPING_MIN_EUROS = 600

/** Plazo de entrega estándar (días laborables). */
export const DELIVERY_DAYS_MIN = 4
export const DELIVERY_DAYS_MAX = 8

export const DELIVERY_TIME_SHORT = `${DELIVERY_DAYS_MIN}–${DELIVERY_DAYS_MAX} días laborables`
export const DELIVERY_TIME_ASCII = `${DELIVERY_DAYS_MIN}-${DELIVERY_DAYS_MAX} días laborables`
export const DELIVERY_SCOPE = 'toda España'

export const DELIVERY_TIME_LABEL = `Entrega en ${DELIVERY_TIME_SHORT} en ${DELIVERY_SCOPE}`
export const DELIVERY_INCLUDED_LINE = `Envío incluido en el precio · ${DELIVERY_TIME_LABEL}`
export const DELIVERY_INCLUDED_BENEFITS = `Envío e IVA incluidos en el precio. Entrega en ${DELIVERY_TIME_SHORT} en ${DELIVERY_SCOPE}.`

