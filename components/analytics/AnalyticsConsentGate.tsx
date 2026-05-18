'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'inmoalia_cookie_consent'

function loadMeasurementId(): string | null {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()
  return id || null
}

function parseAllowsAnalytics(raw: string | null): boolean {
  if (!raw) return false
  try {
    const parsed = JSON.parse(raw) as { analytics?: boolean }
    return parsed.analytics === true
  } catch {
    return false
  }
}

/**
 * Inserta GA4 solo tras consentimiento analítico en el banner de cookies.
 * Configura `NEXT_PUBLIC_GA_MEASUREMENT_ID` en producción y declara el script en la política de cookies.
 */
export default function AnalyticsConsentGate() {
  const [allow, setAllow] = useState(false)
  const gaId = loadMeasurementId()

  useEffect(() => {
    try {
      if (parseAllowsAnalytics(localStorage.getItem(STORAGE_KEY))) setAllow(true)
      const onConsent = (e: Event) => {
        const d = (e as CustomEvent<{ analytics?: boolean }>).detail
        if (d?.analytics) setAllow(true)
      }
      window.addEventListener('inmoalia-cookie-consent', onConsent)
      return () => window.removeEventListener('inmoalia-cookie-consent', onConsent)
    } catch {
      return undefined
    }
  }, [])

  if (!gaId || !allow) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-config" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  )
}
