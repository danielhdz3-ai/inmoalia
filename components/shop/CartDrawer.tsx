'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getItemCount,
    getSubtotal,
  } = useCart()

  const itemCount = getItemCount()
  const subtotal = getSubtotal()

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#e8ddd0]">
          <SheetTitle className="flex items-center gap-2 text-[#2a2a2a]">
            <ShoppingBag className="w-5 h-5 text-[#2d4a3e]" />
            Tu carrito
            {itemCount > 0 && (
              <span className="ml-1 bg-[#2d4a3e] text-white text-xs font-bold rounded-full px-2 py-0.5">
                {itemCount}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length > 0 && (
          <div className="px-6 py-3 bg-[#2d4a3e]/5 border-b border-[#2d4a3e]/10">
            <p className="text-xs text-[#2d4a3e] font-medium flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              Envío incluido en el precio
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="w-12 h-12 text-[#e8ddd0] mb-4" />
              <p className="text-[#2a2a2a] font-medium mb-1">Tu carrito está vacío</p>
              <p className="text-sm text-[#a08c7a] mb-6">Descubre nuestra selección de hogar y jardín</p>
              <Button asChild onClick={closeCart}>
                <Link href="/productos">Ver productos</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 group">
                  <Link href={`/productos/${item.slug}`} onClick={closeCart} className="shrink-0">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#f9f6f1] border border-[#e8ddd0]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/productos/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-[#2a2a2a] hover:text-[#2d4a3e] transition-colors line-clamp-2 leading-tight"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm font-semibold text-[#2d4a3e] mt-1">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 bg-[#f9f6f1] rounded-lg border border-[#e8ddd0] p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#e8ddd0] transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#e8ddd0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg text-[#a08c7a] hover:text-[#c0392b] hover:bg-red-50 transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#e8ddd0] px-6 py-5 space-y-3 bg-[#fdfcfa]">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b5344]">Envío</span>
                <span className="text-[#27ae60] font-medium">Incluido</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-[#e8ddd0]">
                <span className="text-[#2a2a2a]">Total</span>
                <span className="text-[#2d4a3e]">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <Button asChild size="lg" className="w-full" onClick={closeCart}>
              <Link href="/checkout" className="flex items-center justify-center gap-2">
                Finalizar compra
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="secondary" size="sm" className="w-full" asChild onClick={closeCart}>
              <Link href="/carrito">Ver carrito completo</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
