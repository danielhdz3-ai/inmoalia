import type { Metadata } from 'next'
import FavoritesClient from '@/components/shop/FavoritesClient'
import { shopPageMetadata } from '@/lib/seo/page-metadata'

export const metadata: Metadata = shopPageMetadata(
  'Mis favoritos — INMOALIA',
  'Tus productos favoritos guardados en INMOALIA.',
  '/favoritos',
  { noindex: true },
)

export default function FavoritosPage() {
  return <FavoritesClient />
}
