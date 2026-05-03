'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al suscribirse. Inténtalo de nuevo.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <p className="text-[#c9a84c] font-semibold text-lg">
        ¡Suscrito! Revisa tu email para confirmar.
      </p>
    )
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      >
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="flex-1 h-12 px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c9a84c] transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 px-6 bg-[#c9a84c] hover:bg-[#b8972e] text-white font-semibold rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Enviando...' : 'Suscribirme'}
        </button>
      </form>
      {error && (
        <p className="text-red-300 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
