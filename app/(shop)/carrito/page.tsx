'use client'

import { Suspense, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { useCartStore } from '@/store/cart'
import type { CartItem } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { DELIVERY_TIME_LABEL } from '@/lib/shop/shipping'

function sanitizeCartPayload(rawList: unknown): CartItem[] {
  if (!Array.isArray(rawList)) return []
  const out: CartItem[] = []
  for (const raw of rawList) {
    if (!raw || typeof raw !== 'object') continue
    const o = raw as Partial<CartItem>
    if (!o.id || !o.slug || typeof o.name !== 'string' || typeof o.price !== 'number') continue
    const stock = typeof o.stock === 'number' ? o.stock : 99
    const qty = Math.max(1, Math.min(Number(o.quantity) || 1, stock))
    out.push({
      id: o.id,
      slug: o.slug,
      name: o.name,
      price: o.price,
      image: typeof o.image === 'string' ? o.image : '',
      quantity: qty,
      supplier_sku: o.supplier_sku ?? null,
      supplier: o.supplier ?? null,
      stock,
    })
  }
  return out
}

function CartPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recoveryToken = searchParams.get('recovery')
  const [recoveryDone, setRecoveryDone] = useState(!recoveryToken)

  const { items, removeItem, updateQuantity, getSubtotal } = useCart()

  useEffect(() => {
    if (!recoveryToken) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/cart-reminder/restore?token=${encodeURIComponent(recoveryToken)}`)
        if (cancelled || !res.ok) return
        const data = (await res.json()) as { items?: unknown }
        const cleaned = sanitizeCartPayload(data.items)
        if (cleaned.length > 0) {
          useCartStore.setState({ items: cleaned })
          router.replace('/carrito')
        }
      } catch {
        // silencioso
      } finally {
        if (!cancelled) setRecoveryDone(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [recoveryToken, router])

  if (!recoveryDone) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-[#6b5344]">Recuperando tu carrito…</p>
      </div>
    )
  }

  const subtotal = getSubtotal()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-[#e8ddd0] mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-[#2a2a2a] mb-3">Tu carrito está vacío</h1>
        <p className="text-[#a08c7a] mb-8">Descubre nuestra selección de muebles y decoración premium.</p>
        <Button asChild size="lg">
          <Link href="/productos">Ver productos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-[#2a2a2a] mb-8">Tu carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#2d4a3e]/5 border border-[#2d4a3e]/10 rounded-xl p-4">
            <p className="text-sm text-[#2d4a3e] font-medium">{DELIVERY_TIME_LABEL}</p>
          </div>

          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white border border-[#e8ddd0] rounded-xl p-4">
              <Link href={`/productos/${item.slug}`} className="shrink-0">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-[#f9f6f1]">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/productos/${item.slug}`}>
                  <h3 className="font-medium text-[#2a2a2a] hover:text-[#2d4a3e] transition-colors leading-snug">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-lg font-bold text-[#2a2a2a] mt-1">{formatPrice(item.price)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center bg-[#f9f6f1] border border-[#e8ddd0] rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-[#e8ddd0] transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-9 h-9 flex items-center justify-center hover:bg-[#e8ddd0] transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#2d4a3e]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-[#a08c7a] hover:text-[#c0392b] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/productos"
            className="inline-flex items-center gap-2 text-sm text-[#6b5344] hover:text-[#2d4a3e] transition-colors mt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Seguir comprando
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[#f9f6f1] border border-[#e8ddd0] rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-[#2a2a2a] mb-5">Resumen del pedido</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b5344]">Productos</span>
                <span className="text-[#2a2a2a] font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b5344]">Envío</span>
                <span className="text-[#27ae60] font-medium">Incluido</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b5344]">IVA (incluido)</span>
                <span className="text-[#a08c7a]">Incluido en el precio</span>
              </div>
            </div>

            <div className="border-t border-[#e8ddd0] pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-bold text-[#2a2a2a]">Total</span>
                <span className="text-xl font-bold text-[#2d4a3e]">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-[#a08c7a] mt-1">IVA incluido en el precio final</p>
            </div>

            <Button asChild size="lg" className="w-full gap-2">
              <Link href="/checkout">
                Proceder al pago <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#a08c7a]">
              <span>🔒 Pago seguro con Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-24 text-center text-[#6b5344]">Cargando carrito…</div>
      }
    >
      <CartPageContent />
    </Suspense>
  )
}
