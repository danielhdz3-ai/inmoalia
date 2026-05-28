import type { Metadata } from 'next'
import { shopPageMetadata } from '@/lib/seo/page-metadata'

export const metadata: Metadata = shopPageMetadata(
  'Crear cuenta — INMOALIA',
  'Regístrate en INMOALIA para gestionar pedidos y favoritos.',
  '/registro',
  { noindex: true },
)

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return children
}
