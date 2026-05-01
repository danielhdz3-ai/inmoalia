import type { Metadata } from 'next'
import FavoritesClient from '@/components/shop/FavoritesClient'

export const metadata: Metadata = {
  title: 'Mis favoritos — INMOALIA',
}

export default function FavoritosPage() {
  return <FavoritesClient />
}
