import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  currentPage: number
  totalPages: number
  buildUrl: (page: number) => string
}

export default function Pagination({ currentPage, totalPages, buildUrl }: Props) {
  if (totalPages <= 1) return null

  const pages = buildPageNumbers(currentPage, totalPages)

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-1 mt-10">
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm text-[#6b5344] hover:text-[#2d4a3e] hover:bg-[#f9f6f1] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-sm text-[#e8ddd0] cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </span>
      )}

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-[#a08c7a]">…</span>
          ) : (
            <Link
              key={p}
              href={buildUrl(p as number)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === currentPage
                  ? 'bg-[#2d4a3e] text-white'
                  : 'text-[#6b5344] hover:bg-[#f9f6f1] hover:text-[#2d4a3e]'
              }`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </Link>
          )
        )}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm text-[#6b5344] hover:text-[#2d4a3e] hover:bg-[#f9f6f1] rounded-lg transition-colors"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-sm text-[#e8ddd0] cursor-not-allowed">
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  )
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)

  return pages
}
