'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrintPedidoButton() {
  return (
    <Button
      type="button"
      variant="secondary"
      className="no-print gap-2 border-[#e8ddd0] transition-all duration-200"
      onClick={() => window.print()}
    >
      <Printer className="w-4 h-4" aria-hidden />
      Imprimir resumen
    </Button>
  )
}
