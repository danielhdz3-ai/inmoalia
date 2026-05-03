import type { Metadata } from 'next'
import Link from 'next/link'
import { PenLine } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog de decoración — INMOALIA',
  description: 'Ideas, tendencias y consejos de decoración para tu hogar y jardín.',
}

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">Blog de decoración</h1>
        <p className="text-[#a08c7a]">Ideas, tendencias y consejos para transformar tu hogar.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e8ddd0] p-16 text-center">
        <div className="w-16 h-16 bg-[#2d4a3e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <PenLine className="w-8 h-8 text-[#2d4a3e]" />
        </div>
        <h2 className="text-xl font-bold text-[#2a2a2a] mb-2">Próximamente</h2>
        <p className="text-[#a08c7a] text-sm max-w-sm mx-auto mb-6">
          Estamos preparando artículos con las últimas tendencias en decoración, ideas DIY y guías de estilo para tu hogar.
        </p>
        <p className="text-sm text-[#6b5344] mb-6">
          Suscríbete a nuestro newsletter para ser el primero en leer nuestros artículos.
        </p>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 bg-[#2d4a3e] text-white px-6 py-3 rounded-lg hover:bg-[#1e3329] transition-colors text-sm font-medium"
        >
          Explorar productos
        </Link>
      </div>
    </div>
  )
}
