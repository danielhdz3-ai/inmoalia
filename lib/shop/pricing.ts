/** IVA general en España (productos estándar). */
export const IVA_RATE = 0.21

export function roundEuros(amount: number): number {
  return Math.round(amount * 100) / 100
}

/** Aplica IVA al precio base (sin IVA → con IVA). */
export function applyIva(basePrice: number): number {
  return roundEuros(basePrice * (1 + IVA_RATE))
}

/** Cuota de IVA incluida en un precio con IVA. */
export function extractIvaFromGross(grossPrice: number): number {
  return roundEuros((grossPrice * IVA_RATE) / (1 + IVA_RATE))
}

/** Base imponible a partir de un precio con IVA incluido. */
export function grossToNet(grossPrice: number): number {
  return roundEuros(grossPrice / (1 + IVA_RATE))
}

/**
 * Tarifa de transporte proveedor (península) según importe del pedido.
 * Fuente: tabla Grupo SDM — coste real incluido en el PVP.
 */
export const SHIPPING_TIERS: ReadonlyArray<{ min: number; max: number; cost: number }> = [
  { min: 1, max: 60, cost: 22 },
  { min: 61, max: 120, cost: 28 },
  { min: 121, max: 190, cost: 33 },
  { min: 191, max: 300, cost: 39 },
  { min: 301, max: 400, cost: 45 },
  { min: 401, max: 500, cost: 49 },
  { min: 501, max: 599, cost: 59 },
]

/** Coste de transporte según importe del pedido (€). */
export function getShippingCostByOrderAmount(orderAmountEuros: number): number {
  const amount = Math.max(0, orderAmountEuros)
  if (amount < 1) return SHIPPING_TIERS[0].cost

  const tier = SHIPPING_TIERS.find((t) => amount >= t.min && amount <= t.max)
  return tier?.cost ?? SHIPPING_TIERS[SHIPPING_TIERS.length - 1].cost
}

/** Beneficio neto mínimo objetivo (€): base imponible − coste − transporte. */
export const MIN_NET_PROFIT_EUR = 60

/** PVP mínimo (IVA incl.) para alcanzar un beneficio neto dado. */
export function minPvpForNetProfit(
  costPrice: number,
  minNetProfit = MIN_NET_PROFIT_EUR,
): number {
  const coste = roundEuros(Number(costPrice))
  const transporte = getShippingCostByOrderAmount(coste)
  const baseImponible = roundEuros(coste + transporte + minNetProfit)
  return applyIva(baseImponible)
}

export interface ProductCostBreakdown {
  /** PVP mostrado al cliente (IVA incluido). */
  pvpConIva: number
  /** Base imponible (sin IVA). */
  baseImponible: number
  /** Cuota de IVA incluida en el PVP. */
  iva: number
  /** Coste proveedor. */
  coste: number | null
  /** Transporte estimado incluido en el precio. */
  transporte: number
  /** Margen % sobre base imponible: (base − coste − transporte) / base. */
  margenPct: number | null
  /** Beneficio neto estimado: base imponible − coste − transporte. */
  neto: number | null
}

export function getProductCostBreakdown(
  pvpConIva: number,
  costPrice: number | null,
): ProductCostBreakdown {
  const baseImponible = grossToNet(pvpConIva)
  const iva = extractIvaFromGross(pvpConIva)
  const coste = costPrice != null ? roundEuros(Number(costPrice)) : null
  const transporte = getShippingCostByOrderAmount(coste ?? baseImponible)

  let neto: number | null = null
  let margenPct: number | null = null

  if (coste != null && baseImponible > 0) {
    neto = roundEuros(baseImponible - coste - transporte)
    margenPct = Math.round(((baseImponible - coste - transporte) / baseImponible) * 100)
  }

  return {
    pvpConIva,
    baseImponible,
    iva,
    coste,
    transporte,
    margenPct,
    neto,
  }
}
