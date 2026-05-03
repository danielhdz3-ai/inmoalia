'use client'

import { useEffect, useState } from 'react'

/** Carga Sonner solo en cliente; el paquete toca `location` al importarse en SSR. */
export default function AppToaster() {
  const [node, setNode] = useState<React.ReactNode>(null)

  useEffect(() => {
    let cancelled = false
    void import('sonner').then(({ Toaster }) => {
      if (cancelled) return
      setNode(
        <Toaster
          position="top-center"
          closeButton
          toastOptions={{
            classNames: {
              toast:
                '!bg-[#fdfcfa] !border !border-[#e8ddd0] !text-[#2a2a2a] !shadow-md',
              title: '!font-semibold !tracking-tight',
              description: '!text-[#6b5344]',
              closeButton:
                '!bg-[#f9f6f1] !border-[#e8ddd0] !text-[#2a2a2a] transition-all duration-200',
            },
          }}
        />
      )
    })
    return () => {
      cancelled = true
    }
  }, [])

  return node
}
