'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toastOk, toastErr } from '@/lib/toast-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function SeguridadPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toastErr('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      toastErr('Las contraseñas no coinciden.')
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (error) {
      toastErr(error.message || 'No se pudo actualizar la contraseña.')
      return
    }

    toastOk('Contraseña actualizada correctamente.')
    setPassword('')
    setConfirm('')
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-sm text-[#a08c7a]">
          <Link href="/cuenta" className="hover:text-[#2d4a3e] transition-all duration-200">
            Mi cuenta
          </Link>
          <span className="text-[#d4c4b0] mx-2 select-none" aria-hidden>
            ·
          </span>
          <span className="text-[#2a2a2a] font-medium">Seguridad</span>
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2a2a2a] mt-3">Seguridad</h1>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#a08c7a] mt-2 font-medium">
          Contraseña de acceso
        </p>
        <p className="text-sm text-[#a08c7a] mt-2 leading-relaxed">
          Elige una contraseña segura que no uses en otros sitios.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-[#e8ddd0] shadow-sm p-6 md:p-8">
          <h2 className="font-semibold text-[#2a2a2a] text-lg tracking-tight mb-6">Cambiar contraseña</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-pass">Nueva contraseña</Label>
              <div className="relative mt-1">
                <Input
                  id="new-pass"
                  type={show1 ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="pr-10 rounded-lg transition-all duration-200"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow1(!show1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a08c7a] hover:text-[#2a2a2a] transition-all duration-200"
                  aria-label={show1 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {show1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm-pass">Confirmar nueva contraseña</Label>
              <div className="relative mt-1">
                <Input
                  id="confirm-pass"
                  type={show2 ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="pr-10 rounded-lg transition-all duration-200"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow2(!show2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a08c7a] hover:text-[#2a2a2a] transition-all duration-200"
                  aria-label={show2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {show2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Button type="submit" size="lg" disabled={saving} className="transition-all duration-200">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                'Guardar nueva contraseña'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
