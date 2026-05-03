import type { Metadata } from 'next'
import CuentaFavoritosClient from '@/components/account/CuentaFavoritosClient'

export const metadata: Metadata = {
  title: 'Favoritos',
}

export default function CuentaFavoritosPage() {
  return <CuentaFavoritosClient />
}
