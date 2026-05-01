'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function SearchInput({ initialValue = '' }: { initialValue?: string }) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(value.trim())}`)
    }
  }

  const handleClear = () => {
    setValue('')
    inputRef.current?.focus()
    router.push('/buscar')
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-[#a08c7a] pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar productos, categorías, materiales..."
          autoFocus
          className="w-full h-14 pl-12 pr-24 rounded-xl border-2 border-[#e8ddd0] bg-white text-[#2a2a2a] placeholder:text-[#a08c7a] focus:outline-none focus:border-[#2d4a3e] transition-colors text-base"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-lg text-[#a08c7a] hover:text-[#2a2a2a] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="h-10 px-4 bg-[#2d4a3e] text-white text-sm font-medium rounded-lg hover:bg-[#1e3329] transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>
    </form>
  )
}
