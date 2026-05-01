'use client'

import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // TODO: integrar con Resend / lista de suscriptores
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <p className="text-[#c9a84c] font-semibold text-lg">
        ¡Suscrito! Pronto recibirás nuestras novedades.
      </p>
    )
  }

  return (
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
        className="flex-1 h-12 px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c9a84c] transition-colors"
      />
      <button
        type="submit"
        className="h-12 px-6 bg-[#c9a84c] hover:bg-[#b8972e] text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
      >
        Suscribirme
      </button>
    </form>
  )
}
