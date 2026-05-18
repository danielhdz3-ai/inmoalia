'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ConsentState = {
  necessary: true
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = 'inmoalia_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [consent, setConsent] = useState<ConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const save = (c: ConsentState) => {
    const payload = { ...c, savedAt: new Date().toISOString() }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {}
    setVisible(false)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inmoalia-cookie-consent', { detail: c }))
    }
  }

  const acceptAll = () => save({ necessary: true, analytics: true, marketing: true })
  const acceptNecessary = () => save({ necessary: true, analytics: false, marketing: false })
  const saveCustom = () => save(consent)

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Preferencias de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-[#e8ddd0] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e8ddd0] flex items-center gap-3">
          <Cookie className="w-5 h-5 text-[#c9a84c] shrink-0" />
          <h2 className="font-semibold text-[#2a2a2a] text-sm flex-1">Usamos cookies</h2>
          <button
            onClick={acceptNecessary}
            className="text-[#a08c7a] hover:text-[#2a2a2a] transition-colors p-1"
            aria-label="Cerrar y aceptar solo las necesarias"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-[#6b5344] leading-relaxed">
            Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y
            mostrarte contenido personalizado. Puedes aceptarlas todas, elegir solo las necesarias o
            personalizar tu elección. Más información en nuestra{' '}
            <Link href="/cookies" className="underline hover:text-[#2d4a3e]">política de cookies</Link>.
          </p>

          {/* Expandable config */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 flex items-center gap-1.5 text-xs text-[#a08c7a] hover:text-[#2d4a3e] transition-colors font-medium"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Personalizar preferencias
          </button>

          {expanded && (
            <div className="mt-4 space-y-3">
              <ToggleRow
                label="Cookies necesarias"
                description="Sesión, carrito y seguridad. No se pueden desactivar."
                checked={true}
                disabled
                onChange={() => {}}
              />
              <ToggleRow
                label="Cookies analíticas"
                description="Nos ayudan a entender cómo usas la tienda (p. ej. con Google Analytics solo si lo activáis en configuración)."
                checked={consent.analytics}
                onChange={(v) => setConsent((c) => ({ ...c, analytics: v }))}
              />
              <ToggleRow
                label="Cookies de marketing"
                description="Permiten mostrarte anuncios relevantes en otras plataformas."
                checked={consent.marketing}
                onChange={(v) => setConsent((c) => ({ ...c, marketing: v }))}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-col sm:flex-row gap-2 justify-end">
          {expanded ? (
            <>
              <Button variant="secondary" size="sm" onClick={acceptNecessary}>
                Solo necesarias
              </Button>
              <Button size="sm" onClick={saveCustom}>
                Guardar preferencias
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={acceptNecessary}>
                Solo necesarias
              </Button>
              <Button size="sm" onClick={acceptAll}>
                Aceptar todas
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[#f0e8df] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#2a2a2a]">{label}</p>
        <p className="text-xs text-[#a08c7a] mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative shrink-0 mt-0.5 w-10 h-5.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d4a3e] ${
          checked ? 'bg-[#2d4a3e]' : 'bg-[#e8ddd0]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${
            checked ? 'translate-x-4.5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
