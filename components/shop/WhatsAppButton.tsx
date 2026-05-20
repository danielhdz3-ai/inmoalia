'use client'

import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { getWhatsAppUrl, productWhatsAppMessage } from '@/lib/contact'
import { cn } from '@/lib/utils'

interface WhatsAppButtonProps {
  productName: string
  productSlug: string
  variant?: 'primary' | 'outline'
  className?: string
}

export default function WhatsAppButton({
  productName,
  productSlug,
  variant = 'outline',
  className,
}: WhatsAppButtonProps) {
  const href = getWhatsAppUrl(productWhatsAppMessage(productName, productSlug))

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors',
        variant === 'primary'
          ? 'bg-[#25D366] text-white hover:bg-[#1da851] px-5 py-3'
          : 'border border-[#25D366]/40 text-[#128C7E] hover:bg-[#25D366]/5 px-4 py-2.5',
        className,
      )}
    >
      <MessageCircle className="w-4 h-4 shrink-0" />
      Consultar por WhatsApp
    </a>
  )
}
