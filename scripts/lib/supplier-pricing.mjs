/** Helpers de precio compartidos entre scripts de sincronización. */

export const IVA_RATE = 0.21
export const MIN_NET_PROFIT_EUR = 60

export const SHIPPING_TIERS = [
  { min: 1, max: 60, cost: 22 },
  { min: 61, max: 120, cost: 28 },
  { min: 121, max: 190, cost: 33 },
  { min: 191, max: 300, cost: 39 },
  { min: 301, max: 400, cost: 45 },
  { min: 401, max: 500, cost: 49 },
  { min: 501, max: 599, cost: 59 },
]

export function roundEuros(n) {
  return Math.round(n * 100) / 100
}

export function getShippingCost(coste) {
  const amount = Math.max(0, coste)
  if (amount < 1) return SHIPPING_TIERS[0].cost
  const tier = SHIPPING_TIERS.find((t) => amount >= t.min && amount <= t.max)
  return tier?.cost ?? SHIPPING_TIERS[SHIPPING_TIERS.length - 1].cost
}

/** PVP mínimo (IVA incl.) con beneficio neto ≥ minNet. */
export function minPvpForNetProfit(coste, minNet = MIN_NET_PROFIT_EUR) {
  const transporte = getShippingCost(coste)
  const base = roundEuros(coste + transporte + minNet)
  return roundEuros(base * (1 + IVA_RATE))
}

/** Desglose de precio para altas de producto (coste + transporte + neto mínimo + IVA). */
export function getPricingBreakdown(coste, minNet = MIN_NET_PROFIT_EUR) {
  const costeRounded = roundEuros(Number(coste))
  const transporte = getShippingCost(costeRounded)
  const baseImponible = roundEuros(costeRounded + transporte + minNet)
  const pvp = roundEuros(baseImponible * (1 + IVA_RATE))
  const iva = roundEuros(pvp - baseImponible)
  return {
    coste: costeRounded,
    transporte,
    neto: minNet,
    baseImponible,
    iva,
    pvp,
  }
}
