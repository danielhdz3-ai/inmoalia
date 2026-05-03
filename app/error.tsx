'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#fdfcfa] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#2a2a2a] mb-3">Algo salió mal</h1>
        <p className="text-[#a08c7a] mb-8 leading-relaxed">
          Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo o vuelve al inicio.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 bg-[#2d4a3e] text-white px-6 py-3 rounded-lg hover:bg-[#1e3329] transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="border border-[#e8ddd0] text-[#2a2a2a] px-6 py-3 rounded-lg hover:bg-[#f9f6f1] transition-colors text-sm font-medium"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
