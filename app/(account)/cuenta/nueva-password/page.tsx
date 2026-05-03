'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function NuevaPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Verificar que hay una sesión activa (el callback la habrá establecido)
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
      } else {
        router.replace('/recuperar-password')
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('No se pudo actualizar la contraseña. El enlace puede haber caducado.')
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/cuenta'), 3000)
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#fdfcfa] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#2d4a3e]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdfcfa] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center">
            <span className="text-2xl font-bold tracking-tight text-[#2a2a2a]">INMOALIA</span>
            <span className="text-[10px] tracking-[0.25em] text-[#a08c7a] uppercase">Hogar & Jardín</span>
          </Link>
        </div>

        <div className="bg-white border border-[#e8ddd0] rounded-2xl p-8 shadow-sm">
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-[#27ae60]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-[#27ae60]" />
              </div>
              <h1 className="text-xl font-bold text-[#2a2a2a] mb-2">¡Contraseña actualizada!</h1>
              <p className="text-sm text-[#a08c7a]">
                Redirigiendo a tu cuenta en unos segundos...
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#2a2a2a] mb-1">Nueva contraseña</h1>
              <p className="text-sm text-[#a08c7a] mb-6">
                Elige una nueva contraseña segura para tu cuenta.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a08c7a] hover:text-[#2a2a2a]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm">Confirmar contraseña</Label>
                  <Input
                    id="confirm"
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="mt-1"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Actualizando...</>
                    : 'Establecer nueva contraseña'
                  }
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
