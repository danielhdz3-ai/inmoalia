'use client'

import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

export function useCart() {
  const store = useCartStore()

  return {
    ...store,
    formattedTotal: formatPrice(store.getTotal()),
    formattedSubtotal: formatPrice(store.getSubtotal()),
    shippingCost: store.getSubtotal() >= 99 ? 0 : 5.99,
    freeShippingRemaining: Math.max(0, 99 - store.getSubtotal()),
    hasFreeShipping: store.getSubtotal() >= 99,
  }
}
