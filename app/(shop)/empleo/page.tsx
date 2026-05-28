import type { Metadata } from 'next'
import Link from 'next/link'
import { Briefcase } from 'lucide-react'
import { shopPageMetadata } from '@/lib/seo/page-metadata'

export const metadata: Metadata = shopPageMetadata(
  'Trabaja con nosotros — INMOALIA',
  'Únete al equipo de INMOALIA. Somos una startup de e-commerce en crecimiento.',
  '/empleo',
)

export default function EmpleoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">Trabaja con nosotros</h1>
        <p className="text-[#a08c7a]">Únete a un equipo apasionado por el diseño y el comercio electrónico.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e8ddd0] p-16 text-center mb-8">
        <div className="w-16 h-16 bg-[#2d4a3e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-[#2d4a3e]" />
        </div>
        <h2 className="text-xl font-bold text-[#2a2a2a] mb-2">No hay vacantes abiertas en este momento</h2>
        <p className="text-[#a08c7a] text-sm max-w-sm mx-auto mb-6">
          Estamos creciendo y pronto abriremos nuevas posiciones. Déjanos tu candidatura espontánea y nos pondremos en contacto si surge algo.
        </p>
        <Link
          href="mailto:info@inmoalia.com?subject=Candidatura espontánea INMOALIA"
          className="inline-flex items-center gap-2 bg-[#2d4a3e] text-white px-6 py-3 rounded-lg hover:bg-[#1e3329] transition-colors text-sm font-medium"
        >
          Enviar candidatura
        </Link>
      </div>
    </div>
  )
}
