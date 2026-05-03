import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import CookieBanner from '@/components/layout/CookieBanner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'INMOALIA — Hogar, Jardín y Decoración Premium',
    template: '%s | INMOALIA',
  },
  description:
    'Descubre muebles y decoración de calidad europea para tu hogar y jardín. Selección curada, envío en 2-5 días. Estilo nórdico y mediterráneo a precios justos.',
  keywords: ['muebles', 'decoración hogar', 'jardín', 'terraza', 'ratán', 'madera', 'iluminación', 'dropshipping hogar'],
  authors: [{ name: 'INMOALIA' }],
  creator: 'INMOALIA',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://inmoalia.com',
    siteName: 'INMOALIA',
    title: 'INMOALIA — Hogar, Jardín y Decoración Premium',
    description: 'Muebles y decoración de calidad europea. Estilo nórdico y mediterráneo.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@inmoalia',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
