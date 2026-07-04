import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  category?: string
}

export function Pagination({ currentPage, totalPages, category }: PaginationProps) {
  if (totalPages <= 1) return null

  const buildUrl = (page: number) => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (category) params.set('category', category)
    return `/articles?${params.toString()}`
  }

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-4"
      style={{ fontFamily: 'var(--font-sans)' }}
      aria-label="分页导航"
    >
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="inline-flex items-center gap-1 text-sm text-[var(--sp-muted)] no-underline transition-colors hover:text-[var(--sp-ink)]"
        >
          <ChevronLeft size={16} />
          上一页
        </Link>
      )}

      <span className="text-sm text-[var(--sp-muted)]">
        {currentPage} / {totalPages}
      </span>

      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="inline-flex items-center gap-1 text-sm text-[var(--sp-muted)] no-underline transition-colors hover:text-[var(--sp-ink)]"
        >
          下一页
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  )
}
