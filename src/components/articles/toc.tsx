'use client'

import { useState, useEffect } from 'react'
import { List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

/**
 * 文章目录 TOC
 *
 * 桌面端: 侧边 sticky
 * 移动端: 顶部折叠按钮
 */
export function ArticleToc({ content }: { content: string }) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [mobileOpen, setMobileOpen] = useState(false)

  // 从 Markdown 内容提取标题
  useEffect(() => {
    const regex = /^(#{2,3})\s+(.+)$/gm
    const items: TocItem[] = []
    let match
    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2]
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9一-龥]+/g, '-')
        .replace(/(^-|-$)/g, '')
      items.push({ id, text, level })
    }
    setHeadings(items)
  }, [content])

  // IntersectionObserver 高亮当前标题
  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )
    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <>
      {/* Mobile Toggle */}
      <div className="mb-6 lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 text-sm text-[var(--sp-muted)] cursor-pointer"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <List size={16} />
          目录
        </button>
        {mobileOpen && (
          <nav className="mt-3 border-l-2 border-[var(--sp-hairline)] pl-4">
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={cn(
                  'block py-1 text-sm no-underline transition-colors hover:text-[var(--sp-ink)]',
                  h.level === 3 && 'pl-3',
                  activeId === h.id ? 'text-[var(--sp-accent-teal)]' : 'text-[var(--sp-muted)]',
                )}
                style={{ fontFamily: 'var(--font-sans)' }}
                onClick={() => setMobileOpen(false)}
              >
                {h.text}
              </a>
            ))}
          </nav>
        )}
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden lg:block lg:sticky lg:top-24">
        <h4
          className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          目录
        </h4>
        <ul className="space-y-1 border-l-2 border-[var(--sp-hairline)] pl-4">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={cn(
                  'block py-1 text-sm no-underline transition-colors hover:text-[var(--sp-ink)]',
                  h.level === 3 && 'pl-3',
                  activeId === h.id
                    ? 'text-[var(--sp-accent-teal)] font-medium'
                    : 'text-[var(--sp-muted)]',
                )}
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
