'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Plus,
  Minus,
  Package,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/supabase/types'
import ProductCard from './ProductCard'
import WaitlistForm from './WaitlistForm'

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const dimensions = product.dimensions as { width?: number; height?: number; depth?: number } | null

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? '',
        supplier_sku: product.supplier_sku,
        supplier: product.supplier,
        stock: product.stock,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const hasDiscount = product.cost_price && product.cost_price > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.cost_price! - product.price) / product.cost_price!) * 100)
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#a08c7a] mb-6">
        <Link href="/" className="hover:text-[#2d4a3e] transition-colors">Inicio</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/productos" className="hover:text-[#2d4a3e] transition-colors">Productos</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/categorias/${product.category}`} className="hover:text-[#2d4a3e] transition-colors capitalize">
          {product.category}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#2a2a2a] font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f9f6f1] border border-[#e8ddd0]">
            <Image
              src={product.images[selectedImage] ?? product.images[0] ?? ''}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {product.is_featured && (
              <div className="absolute top-4 left-4">
                <Badge variant="gold">Destacado</Badge>
              </div>
            )}
            {discountPct && (
              <div className="absolute top-4 right-4">
                <Badge variant="sale">-{discountPct}%</Badge>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i
                      ? 'border-[#2d4a3e] shadow-md'
                      : 'border-[#e8ddd0] hover:border-[#a08c7a]'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Category + SKU */}
          <div className="flex items-center justify-between mb-3">
            <Link
              href={`/categorias/${product.category}`}
              className="text-xs font-semibold text-[#a08c7a] uppercase tracking-wider hover:text-[#2d4a3e] transition-colors"
            >
              {product.subcategory || product.category}
            </Link>
            {product.sku && (
              <span className="text-xs text-[#a08c7a]">Ref: {product.sku}</span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#2a2a2a] leading-tight mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-[#2a2a2a]">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-[#a08c7a] line-through">
                  {formatPrice(product.cost_price!)}
                </span>
                <Badge variant="sale">Ahorras {formatPrice(product.cost_price! - product.price)}</Badge>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-[#27ae60]" />
                <span className="text-sm text-[#27ae60] font-medium">
                  {product.stock > 10 ? 'En stock' : `Solo quedan ${product.stock} unidades`}
                </span>
              </>
            ) : (
              <>
                <Package className="w-4 h-4 text-[#a08c7a]" />
                <span className="text-sm text-[#a08c7a]">Sin stock — Añadir a lista de espera</span>
              </>
            )}
          </div>

          {/* Add to cart */}
          {product.stock > 0 ? (
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center bg-[#f9f6f1] border border-[#e8ddd0] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-[#e8ddd0] transition-colors"
                  >
                    <Minus className="w-4 h-4 text-[#6b5344]" />
                  </button>
                  <span className="w-10 text-center font-semibold text-[#2a2a2a]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-[#e8ddd0] transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#6b5344]" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1 gap-2"
                  variant={added ? 'secondary' : 'default'}
                >
                  {added ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      ¡Añadido!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Añadir al carrito
                    </>
                  )}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#c0392b] text-[#c0392b]' : ''}`} />
                  {isWishlisted ? 'En favoritos' : 'Favoritos'}
                </Button>
                <Button variant="secondary" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Compartir
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <WaitlistForm productId={product.id} />
            </div>
          )}

          {/* Benefits */}
          <div className="space-y-3 py-6 border-t border-[#e8ddd0]">
            {[
              { icon: Truck, text: 'Envío gratis en pedidos superiores a 99€. Entrega en 2-5 días.' },
              { icon: Shield, text: 'Pago 100% seguro con cifrado SSL. Stripe certificado.' },
              { icon: RotateCcw, text: 'Devolución gratuita en 30 días sin preguntas.' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-[#2d4a3e] shrink-0" />
                <span className="text-sm text-[#6b5344]">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Specs */}
          <div className="mt-6 pt-6 border-t border-[#e8ddd0]">
            <h3 className="text-sm font-semibold text-[#2a2a2a] mb-4">Especificaciones</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {product.material && (
                <>
                  <dt className="text-xs text-[#a08c7a]">Material</dt>
                  <dd className="text-xs text-[#2a2a2a] font-medium">{product.material}</dd>
                </>
              )}
              {product.color && (
                <>
                  <dt className="text-xs text-[#a08c7a]">Color</dt>
                  <dd className="text-xs text-[#2a2a2a] font-medium">{product.color}</dd>
                </>
              )}
              {dimensions && (
                <>
                  <dt className="text-xs text-[#a08c7a]">Dimensiones</dt>
                  <dd className="text-xs text-[#2a2a2a] font-medium">
                    {dimensions.width && dimensions.height && dimensions.depth
                      ? `${dimensions.width} × ${dimensions.height} × ${dimensions.depth} cm`
                      : '-'}
                  </dd>
                </>
              )}
              {product.weight_kg && (
                <>
                  <dt className="text-xs text-[#a08c7a]">Peso</dt>
                  <dd className="text-xs text-[#2a2a2a] font-medium">{product.weight_kg} kg</dd>
                </>
              )}
              {product.supplier && (
                <>
                  <dt className="text-xs text-[#a08c7a]">Proveedor</dt>
                  <dd className="text-xs text-[#2a2a2a] font-medium capitalize">{product.supplier}</dd>
                </>
              )}
            </dl>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#e8ddd0]">
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/productos?q=${encodeURIComponent(tag)}`}
                    className="text-xs px-2.5 py-1 rounded-full border border-[#e8ddd0] text-[#6b5344] hover:border-[#2d4a3e] hover:text-[#2d4a3e] transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <section className="mt-16 max-w-3xl">
          <h2 className="text-xl font-bold text-[#2a2a2a] mb-4">Descripción del producto</h2>
          <p className="text-[#6b5344] leading-relaxed text-base">{product.description}</p>
        </section>
      )}

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#e8ddd0]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#2a2a2a]">También te puede gustar</h2>
            <Link
              href={`/categorias/${product.category}`}
              className="text-sm text-[#2d4a3e] hover:text-[#1e3329] font-medium transition-colors"
            >
              Ver más →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
