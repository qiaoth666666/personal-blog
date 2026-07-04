import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <h1
          className="font-display text-8xl font-bold text-[var(--sp-hairline)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          404
        </h1>
        <p
          className="mt-4 font-serif text-xl italic text-[var(--sp-muted)]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          页面不存在
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-sm text-[var(--sp-accent-teal)] no-underline transition-colors hover:text-[var(--sp-ink)]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <ArrowLeft size={16} />
          返回首页
        </Link>
      </div>
    </div>
  )
}
