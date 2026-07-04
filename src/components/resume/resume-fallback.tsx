'use client'

import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

/**
 * 简历数据兜底 —— 提示刷新而非"去后台创建"
 */
export function ResumeFallback() {
  const router = useRouter()

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <p
          className="text-lg italic text-[var(--sp-muted)]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          数据加载失败
        </p>
        <p
          className="mt-2 text-sm text-[var(--sp-muted)]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          可能是网络波动或数据库暂时不可用
        </p>
        <button
          onClick={() => router.refresh()}
          className="mt-6 inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] px-5 py-2.5 text-sm font-medium text-[var(--sp-ink)] transition-colors hover:bg-[var(--sp-ink)] hover:text-[var(--sp-ground)] cursor-pointer"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <RefreshCw size={15} />
          刷新页面
        </button>
      </div>
    </div>
  )
}
