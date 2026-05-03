'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Eye, EyeOff } from 'lucide-react'
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

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signInWithGoogle } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectTo, setRedirectTo] = useState('/cuenta')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    if (redirect && redirect.startsWith('/')) setRedirectTo(redirect)

    const authError = params.get('error')
    if (authError === 'link_expired') setError('El enlace ha caducado. Solicita uno nuevo.')
    if (authError === 'auth_error') setError('Error de autenticación. Inténtalo de nuevo.')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(form.email, form.password)
    if (error) {
      setError('Email o contraseña incorrectos. Inténtalo de nuevo.')
      setLoading(false)
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError(null)
    const { error } = await signInWithGoogle(redirectTo)
    if (error) {
      setError('No se pudo conectar con Google. Inténtalo de nuevo.')
      setGoogleLoading(false)
    }
    // On success, Google redirects — no need to do anything else
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — imagen decorativa */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=85"
          alt="Interior elegante INMOALIA"
          fill
          className="object-cover"
          priority
          sizes="50vw"
        />
        {/* Overlay degradado */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e26]/80 via-[#1a2e26]/20 to-transparent" />

        {/* Brand overlay text */}
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-xs tracking-[0.3em] uppercase opacity-70 mb-2">Hogar & Jardín</p>
          <h2 className="text-3xl font-bold leading-snug mb-3">
            Spaces that<br />tell your story
          </h2>
          <p className="text-sm opacity-70 max-w-xs">
            Muebles y decoración de calidad europea para transformar tu hogar.
          </p>
        </div>

        {/* Logo top-left */}
        <div className="absolute top-8 left-10">
          <Link href="/" className="text-white font-bold text-xl tracking-tight">INMOALIA</Link>
        </div>
      </div>

      {/* Right panel — formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#fdfcfa]">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex flex-col items-center">
              <span className="text-2xl font-bold tracking-tight text-[#2a2a2a]">INMOALIA</span>
              <span className="text-[10px] tracking-[0.25em] text-[#a08c7a] uppercase">Hogar & Jardín</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-[#2a2a2a] mb-1">Bienvenido de nuevo</h1>
          <p className="text-sm text-[#a08c7a] mb-7">Accede a tu cuenta para ver tus pedidos y favoritos.</p>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-xl border border-[#e8ddd0] bg-white text-sm font-medium text-[#2a2a2a] hover:bg-[#f9f6f1] hover:border-[#d0c5bb] transition-colors disabled:opacity-50 shadow-sm mb-4"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#e8ddd0]" />
            <span className="text-xs text-[#a08c7a]">o con tu email</span>
            <div className="flex-1 h-px bg-[#e8ddd0]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="/recuperar-password" className="text-xs text-[#2d4a3e] hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading || googleLoading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Entrando...</> : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#a08c7a]">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-[#2d4a3e] font-medium hover:underline">
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
