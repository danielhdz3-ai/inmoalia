'use client'

import { useMemo, useState } from 'react'

interface Props {
  defaultValue?: string
}

/** Textarea controlada para `images`: una URL por línea + miniaturas con <img>. */
export function ProductImagesUrlsInput({ defaultValue = '' }: Props) {
  const [val, setVal] = useState(defaultValue)
  const urls = useMemo(
    () =>
      val
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => /^https?:\/\//i.test(line)),
    [val]
  )

  return (
    <div className="space-y-3">
      <textarea
        name="images"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Una URL por línea&#10;https://..."
        rows={5}
        className="w-full px-3 py-2 rounded-lg border border-[#e8ddd0] bg-white text-sm text-[#2a2a2a] placeholder:text-[#c8bdb5] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30 resize-none font-mono text-[13px]"
      />
      <p className="text-xs text-[#a08c7a]">
        {urls.length} URL válida(s) · Puedes subir ficheros a{' '}
        <strong>Supabase Storage</strong> (bucket <code className="text-[#6b5344]">product-images</code>)
        y pegar aquí las URLs públicas.
      </p>
      {urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {urls.slice(0, 12).map((u) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <div
              key={u}
              className="relative aspect-square rounded-lg overflow-hidden bg-[#f9f6f1] border border-[#e8ddd0]"
            >
              <img src={u} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
