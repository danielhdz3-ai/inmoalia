'use client'

/** Evita importar `sonner` en el bundle SSR (acceso a `location`). */
export async function toastOk(message: string) {
  const { toast } = await import('sonner')
  toast.success(message)
}

export async function toastErr(message: string) {
  const { toast } = await import('sonner')
  toast.error(message)
}
