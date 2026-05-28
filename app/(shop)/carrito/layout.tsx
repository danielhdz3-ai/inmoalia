import type { Metadata } from 'next'
import { shopPageMetadata } from '@/lib/seo/page-metadata'

export const metadata: Metadata = shopPageMetadata(
  'Carrito — INMOALIA',
  'Revisa los productos de tu carrito antes de finalizar la compra.',
  '/carrito',
  { noindex: true },
)

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return children
}
