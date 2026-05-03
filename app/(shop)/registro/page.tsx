'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

export default function RegistroPage() {
  const router = useRouter()
  const { signUp, signInWithGoogle } = useAuth()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    const { error, session } = await signUp(form.email, form.password, form.fullName)
    if (error) {
      setError(error.message === 'User already registered'
        ? 'Ya existe una cuenta con ese email. Prueba a iniciar sesión.'
        : (error.message || 'Error al crear la cuenta. Inténtalo de nuevo.'))
      setLoading(false)
      return
    }
    // Confirmación por email desactivada en Supabase: sesión lista al instante.
    if (session) {
      router.push('/cuenta')
      router.refresh()
      setLoading(false)
      return
    }
    setSuccess(true)
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError(null)
    const { error } = await signInWithGoogle('/cuenta')
    if (error) {
      setError('No se pudo conectar con Google. Inténtalo de nuevo.')
      setGoogleLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#fdfcfa] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2d4a3e]/10 mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#2d4a3e]" />
          </div>
          <h1 className="text-2xl font-bold text-[#2a2a2a] mb-2">¡Cuenta creada!</h1>
          <p className="text-[#a08c7a] mb-6">
            Hemos enviado un email de confirmación a <strong>{form.email}</strong>.<br />
            Confírmalo para activar tu cuenta.
          </p>
          <Button asChild>
            <Link href="/login">Ir a iniciar sesión</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — ambiente degradado verdoso (sin texto/logo; marca en columna del formulario) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden min-h-screen" aria-hidden>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#022c22] via-[#0f766e] to-[#14532d]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#6ee7b7]/20 via-transparent to-[#065f46]/45" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(209,250,229,0.35)_0%,transparent_50%)]" />
          <Image
            src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1400&q=88"
            alt=""
            fill
            className="object-cover opacity-40 transition-opacity duration-200"
            priority
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-[#052e16]/85" />
        </div>
      </div>

      {/* Right panel — formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#fdfcfa]">
        <div className="w-full max-w-md">
          <div className="mb-8 hidden lg:block">
            <Link href="/" className="text-2xl font-bold tracking-tight text-[#2a2a2a] hover:text-[#2d4a3e] transition-colors">
              INMOALIA
            </Link>
            <p className="text-[10px] tracking-[0.25em] text-[#a08c7a] uppercase mt-1">Hogar &amp; Jardín</p>
          </div>
          {/* Logo mobile */}
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex flex-col items-center">
              <span className="text-2xl font-bold tracking-tight text-[#2a2a2a]">INMOALIA</span>
              <span className="text-[10px] tracking-[0.25em] text-[#a08c7a] uppercase">Hogar & Jardín</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-[#2a2a2a] mb-1">Crear cuenta</h1>
          <p className="text-sm text-[#a08c7a] mb-7">Únete a INMOALIA y disfruta de una experiencia personalizada.</p>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-xl border border-[#e8ddd0] bg-white text-sm font-medium text-[#2a2a2a] hover:bg-[#f9f6f1] hover:border-[#d0c5bb] transition-colors disabled:opacity-50 shadow-sm mb-4"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            Registrarse con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#e8ddd0]" />
            <span className="text-xs text-[#a08c7a]">o con tu email</span>
            <div className="flex-1 h-px bg-[#e8ddd0]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                type="text"
                required
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="María García López"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="tu@email.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a08c7a] hover:text-[#2a2a2a] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repite la contraseña"
                className="mt-1"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading || googleLoading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creando cuenta...</> : 'Crear cuenta'}
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-[#a08c7a]">
            Al registrarte aceptas nuestros{' '}
            <Link href="/terminos" className="underline hover:text-[#2d4a3e]">términos y condiciones</Link>{' '}
            y la{' '}
            <Link href="/privacidad" className="underline hover:text-[#2d4a3e]">política de privacidad</Link>.
          </p>

          <div className="mt-5 text-center text-sm text-[#a08c7a]">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#2d4a3e] font-medium hover:underline">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
