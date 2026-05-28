import { Mail } from 'lucide-react'
import { SUPPORT_EMAIL, productSupportMailto } from '@/lib/support'
import { cn } from '@/lib/utils'

interface ProductContactEmailProps {
  productName: string
  productSlug: string
  className?: string
}

export default function ProductContactEmail({
  productName,
  productSlug,
  className,
}: ProductContactEmailProps) {
  return (
    <a
      href={productSupportMailto(productName, productSlug)}
      className={cn(
        'inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#e8ddd0] bg-white px-4 py-2.5 text-sm font-medium text-[#2d4a3e] transition-colors hover:border-[#2d4a3e]/30 hover:bg-[#f9f6f1]',
        className,
      )}
    >
      <Mail className="w-4 h-4 shrink-0" aria-hidden />
      {SUPPORT_EMAIL}
    </a>
  )
}
