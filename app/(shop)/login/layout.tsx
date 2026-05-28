import type { Metadata } from 'next'
import { shopPageMetadata } from '@/lib/seo/page-metadata'

export const metadata: Metadata = shopPageMetadata(
  'Iniciar sesión — INMOALIA',
  'Accede a tu cuenta de INMOALIA.',
  '/login',
  { noindex: true },
)

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
