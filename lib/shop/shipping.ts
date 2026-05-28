/**
 * Gastos de envío cobrados al cliente (€).
 * En INMOALIA el transporte va incluido en el precio mostrado: siempre 0 al pagar.
 */
export function getShippingCostEuros(_subtotalEuros: number): number {
  return 0
}

/** Referencia interna histórica (ya no aplica al cliente). */
export const FREE_SHIPPING_MIN_EUROS = 600
