import type { Metadata } from 'next'
import SeguridadPasswordForm from '@/components/account/SeguridadPasswordForm'

export const metadata: Metadata = {
  title: 'Seguridad',
}

export default function CuentaSeguridadPage() {
  return <SeguridadPasswordForm />
}
