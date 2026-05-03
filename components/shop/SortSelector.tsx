'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ArrowUpDown } from 'lucide-react'

const OPTIONS = [
  { value: 'newest',     label: 'Más recientes' },
  { value: 'price_asc',  label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'featured',   label: 'Destacados primero' },
]

export default function SortSelector({ currentSort }: { currentSort?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', e.target.value)
    params.delete('page') // reset to page 1 when sort changes
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-3.5 h-3.5 text-[#a08c7a] shrink-0" />
      <select
        value={currentSort ?? 'newest'}
        onChange={handleChange}
        className="text-sm text-[#2a2a2a] bg-transparent border-none outline-none cursor-pointer focus:ring-0 pr-1"
        aria-label="Ordenar productos"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
