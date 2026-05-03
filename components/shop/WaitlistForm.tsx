'use client'

import { useState } from 'react'
import { Bell, Loader2, CheckCircle } from 'lucide-react'

interface WaitlistFormProps {
  productId: string
}

export default function WaitlistForm({ productId }: WaitlistFormProps) {
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
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, product_id: productId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al apuntarte. Inténtalo de nuevo.')
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
      <div className="bg-[#2d4a3e]/5 border border-[#2d4a3e]/20 rounded-2xl p-5 text-center">
        <CheckCircle className="w-8 h-8 text-[#2d4a3e] mx-auto mb-2" />
        <p className="font-semibold text-[#2d4a3e] text-sm">¡Anotado!</p>
        <p className="text-xs text-[#6b5344] mt-1">
          Te avisaremos en <span className="font-medium">{email}</span> cuando este producto vuelva a estar disponible.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-[#e8ddd0] rounded-2xl p-5 bg-[#f9f6f1]">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-[#2d4a3e]" />
        <p className="font-semibold text-[#2a2a2a] text-sm">Avisarme cuando haya stock</p>
      </div>
      <p className="text-xs text-[#a08c7a] mb-4">
        Introduce tu email y te notificaremos en cuanto el producto esté disponible.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="flex-1 text-sm border border-[#e8ddd0] rounded-lg px-3 py-2.5 bg-white text-[#2a2a2a] placeholder-[#a08c7a] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 bg-[#2d4a3e] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#1e3329] transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
          Avisar
        </button>
      </form>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  )
}
