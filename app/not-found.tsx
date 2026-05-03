import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fdfcfa] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-[#e8ddd0] mb-4 leading-none">404</div>
        <h1 className="text-2xl font-bold text-[#2a2a2a] mb-3">Página no encontrada</h1>
        <p className="text-[#a08c7a] mb-8 leading-relaxed">
          La página que buscas no existe o ha sido movida. Prueba a buscar lo que necesitas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-[#2d4a3e] text-white px-6 py-3 rounded-lg hover:bg-[#1e3329] transition-colors text-sm font-medium"
          >
            Volver al inicio
          </Link>
          <Link
            href="/buscar"
            className="flex items-center justify-center gap-2 border border-[#e8ddd0] text-[#2a2a2a] px-6 py-3 rounded-lg hover:bg-[#f9f6f1] transition-colors text-sm font-medium"
          >
            <Search className="w-4 h-4" />
            Buscar productos
          </Link>
        </div>
      </div>
    </div>
  )
}
