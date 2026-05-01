import ProductCard from './ProductCard'
import type { Product } from '@/lib/supabase/types'

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
}

export default function ProductGrid({ products, columns = 3 }: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
  }[columns]

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f9f6f1] flex items-center justify-center mb-4">
          <span className="text-2xl">🏠</span>
        </div>
        <h3 className="text-lg font-medium text-[#2a2a2a] mb-2">No hay productos disponibles</h3>
        <p className="text-sm text-[#a08c7a]">Prueba con otros filtros o categorías</p>
      </div>
    )
  }

  return (
    <div className={`grid ${gridCols} gap-4 md:gap-6`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  )
}
