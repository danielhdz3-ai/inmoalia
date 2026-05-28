'use client'

import Link from 'next/link'
import { Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductShippingLineProps {
  price: number
  /** Tarjeta de catálogo o ficha de producto */
  variant?: 'compact' | 'detail'
  className?: string
}

export function getProductShippingInfo(_price: number) {
  return {
    shipping: 0,
    total: _price,
    isIncluded: true,
  }
}

export default function ProductShippingLine({
  variant = 'compact',
  className,
}: ProductShippingLineProps) {
  if (variant === 'compact') {
    return (
      <p className={cn('text-[11px] text-[#6b5344] mt-1.5 leading-snug', className)}>
        Envío <span className="text-[#27ae60] font-semibold">incluido</span>
      </p>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-[#e8ddd0] bg-[#f9f6f1] px-4 py-3 mb-6',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Truck className="w-4 h-4 text-[#2d4a3e] shrink-0 mt-0.5" aria-hidden />
        <div className="text-sm text-[#6b5344] space-y-1">
          <p>
            <span className="font-semibold text-[#27ae60]">Envío incluido</span> en el precio · Entrega en 2–5 días
            laborables
          </p>
          <p className="text-xs">
            Entrega en península.{' '}
            <Link href="/envios" className="text-[#2d4a3e] underline underline-offset-2 hover:text-[#1e3329]">
              Más información de envío
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
