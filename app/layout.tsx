import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import CookieBanner from '@/components/layout/CookieBanner'
import AppToaster from '@/components/providers/AppToaster'
import FavoriteSync from '@/components/providers/FavoriteSync'
import AnalyticsConsentGate from '@/components/analytics/AnalyticsConsentGate'
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationJsonLd, webSiteJsonLd } from '@/lib/seo/jsonld-builders'
import { getSiteUrl, indexingRobotsMetadata } from '@/lib/site'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'INMOALIA — Tienda de Muebles, Jardín y Decoración',
    template: '%s | INMOALIA',
  },
  description:
    'Tienda online de muebles y decoración de calidad europea para hogar, jardín y oficina. Envío en 2-5 días. No confundir con agencias inmobiliarias.',
  keywords: ['muebles', 'decoración hogar', 'jardín', 'terraza', 'ratán', 'madera', 'iluminación', 'dropshipping hogar'],
  authors: [{ name: 'INMOALIA' }],
  creator: 'INMOALIA',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: '/',
    siteName: 'INMOALIA',
    title: 'INMOALIA — Hogar, Jardín y Decoración Premium',
    description: 'Muebles y decoración de calidad europea. Estilo nórdico y mediterráneo.',
    images: [{ url: '/logo.png', width: 1024, height: 1024, alt: 'INMOALIA — Hogar y Jardín' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@inmoalia',
    images: ['/logo.png'],
  },
  robots: indexingRobotsMetadata(),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={webSiteJsonLd()} />
        {children}
        <AppToaster />
        <CookieBanner />
        <AnalyticsConsentGate />
        <FavoriteSync />
      </body>
    </html>
  )
}
