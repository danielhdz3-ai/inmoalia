import { formatPrice } from '@/lib/utils'
import type { ProductBundle } from '@/lib/content/bundles'
import type { Product } from '@/lib/supabase/types'
import ProductCard from './ProductCard'
import Link from 'next/link'

interface ProductBundleBlockProps {
  bundle: ProductBundle
  products: Product[]
  currentSlug: string
}

export default function ProductBundleBlock({ bundle, products, currentSlug }: ProductBundleBlockProps) {
  if (products.length < 2) return null

  const sum = products.reduce((acc, p) => acc + Number(p.price), 0)
  const bundlePrice = Math.round(sum * (1 - bundle.discountPct / 100) * 100) / 100
  const savings = Math.round((sum - bundlePrice) * 100) / 100

  return (
    <section className="mt-12 p-6 md:p-8 rounded-2xl border-2 border-[#c9a84c]/40 bg-gradient-to-br from-[#fdfcfa] to-[#f9f6f1]">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold text-[#c9a84c] uppercase tracking-wide mb-1">Pack ahorro</p>
          <h2 className="text-xl font-bold text-[#2a2a2a]">{bundle.name}</h2>
          <p className="text-sm text-[#6b5344] mt-1">{bundle.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-[#a08c7a] line-through">{formatPrice(sum)}</p>
          <p className="text-2xl font-bold text-[#2a2a2a]">{formatPrice(bundlePrice)}</p>
          {savings > 0 && (
            <p className="text-xs text-[#27ae60] font-medium">Ahorras {formatPrice(savings)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {products.map((p) => (
          <div key={p.id} className={p.slug === currentSlug ? 'ring-2 ring-[#2d4a3e] rounded-xl' : ''}>
            <ProductCard product={p} hideFavoriteButton />
          </div>
        ))}
      </div>

      <p className="text-xs text-[#a08c7a]">
        Añade cada producto al carrito por separado. Descuento pack aplicable contactando por{' '}
        <Link href="/contacto" className="text-[#2d4a3e] underline">
          WhatsApp
        </Link>{' '}
        con referencia <strong>{bundle.slug}</strong>.
      </p>
    </section>
  )
}
