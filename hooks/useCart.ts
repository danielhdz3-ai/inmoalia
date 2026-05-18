'use client'

import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { FREE_SHIPPING_MIN_EUROS, getShippingCostEuros } from '@/lib/shop/shipping'

export function useCart() {
  const store = useCartStore()
  const subtotal = store.getSubtotal()
  const shippingCost = getShippingCostEuros(subtotal)

  return {
    ...store,
    formattedTotal: formatPrice(store.getTotal()),
    formattedSubtotal: formatPrice(subtotal),
    shippingCost,
    freeShippingRemaining: Math.max(0, FREE_SHIPPING_MIN_EUROS - subtotal),
    hasFreeShipping: subtotal >= FREE_SHIPPING_MIN_EUROS,
  }
}
