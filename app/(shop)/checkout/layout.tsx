import type { Metadata } from 'next'
import { shopPageMetadata } from '@/lib/seo/page-metadata'

export const metadata: Metadata = shopPageMetadata(
  'Checkout — INMOALIA',
  'Finaliza tu compra de forma segura en INMOALIA.',
  '/checkout',
  { noindex: true },
)

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
