'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/api/auth/callback?next=/cuenta/nueva-password`
        : undefined

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    })

    if (error) {
      setError('No se pudo enviar el email. Comprueba la dirección e inténtalo de nuevo.')
    } else {
      setSent(true)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#fdfcfa] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center">
            <span className="text-2xl font-bold tracking-tight text-[#2a2a2a]">INMOALIA</span>
            <span className="text-[10px] tracking-[0.25em] text-[#a08c7a] uppercase">Hogar & Jardín</span>
          </Link>
        </div>

        <div className="bg-white border border-[#e8ddd0] rounded-2xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-[#27ae60]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-[#27ae60]" />
              </div>
              <h1 className="text-xl font-bold text-[#2a2a2a] mb-2">Email enviado</h1>
              <p className="text-sm text-[#a08c7a] mb-6">
                Hemos enviado un enlace de recuperación a <span className="font-medium text-[#2a2a2a]">{email}</span>.
                Revisa tu bandeja de entrada y sigue las instrucciones.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-[#2d4a3e] font-medium hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#2a2a2a] mb-1">Recuperar contraseña</h1>
              <p className="text-sm text-[#a08c7a] mb-6">
                Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="mt-1"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Enviando...</>
                    : 'Enviar enlace de recuperación'
                  }
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-[#a08c7a] hover:text-[#2d4a3e] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
