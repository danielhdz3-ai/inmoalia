'use client'

import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

export function useCart() {
  const store = useCartStore()
  const subtotal = store.getSubtotal()

  return {
    ...store,
    formattedTotal: formatPrice(store.getTotal()),
    formattedSubtotal: formatPrice(subtotal),
    shippingCost: 0,
    hasFreeShipping: true,
  }
}
