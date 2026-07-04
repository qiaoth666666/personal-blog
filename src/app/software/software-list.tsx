'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Software } from '@/types/db'
import { SoftwareCard } from '@/components/software/software-card'
import type { CardVariant } from '@/components/software/software-card'
import { ViewSwitcher } from '@/components/software/view-switcher'
import { SortControl, type SortKey } from '@/components/software/sort-control'
import { Search, SlidersHorizontal, X } from 'lucide-react'

interface SoftwareListProps {
  softwareList: Software[]
  categories: string[]
}

export function SoftwareList({ softwareList, categories }: SoftwareListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<CardVariant>('grid')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortAsc, setSortAsc] = useState(true)

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    softwareList.forEach((s) => {
      if (s.category) {
        counts[s.category] = (counts[s.category] || 0) + 1
      }
    })
    return counts
  }, [softwareList])

  const filtered = useMemo(() => {
    let result = [...softwareList]

    if (activeCategory != null) {
      result = result.filter((s) => s.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((s) => {
        const nameMatch = s.name.toLowerCase().includes(q)
        const descMatch = s.description?.toLowerCase().includes(q) ?? false
        const tagMatch = s.tags
          ? s.tags
              .split(',')
              .map((t) => t.trim().toLowerCase())
              .some((t) => t.includes(q))
          : false
        return nameMatch || descMatch || tagMatch
      })
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') {
        cmp = a.name.localeCompare(b.name)
      } else if (sortKey === 'fileSize') {
        const parseSize = (s: string | null) => {
          if (!s) return 0
          const num = parseFloat(s)
          if (s.includes('GB')) return num * 1024 * 1024 * 1024
          if (s.includes('MB')) return num * 1024 * 1024
          if (s.includes('KB')) return num * 1024
          return num
        }
        cmp = parseSize(a.fileSize) - parseSize(b.fileSize)
      }
      return sortAsc ? cmp : -cmp
    })

    return result
  }, [softwareList, activeCategory, searchQuery, sortKey, sortAsc])

  /* ────────── 搜索 + 筛选 ────────── */
  const filtersBar = (
    <div className="space-y-5">
      <div className="mx-auto max-w-lg">
        <div className="relative">
          <Search
            size={15}
            strokeWidth={1.5}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--sp-muted)]/50"
          />
          <input
            type="text"
            placeholder="搜索软件名称、描述或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-3 pl-7 pr-8 text-sm text-[var(--sp-ink)] outline-none transition-colors placeholder:text-[var(--sp-muted)]/40 focus:border-[var(--sp-accent-teal)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--sp-muted)]/40 hover:text-[var(--sp-muted)] cursor-pointer"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className="group relative border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] transition-all cursor-pointer"
            style={{
              fontFamily: 'var(--font-sans)',
              borderColor:
                activeCategory === null
                  ? 'var(--sp-accent-teal)'
                  : 'var(--sp-hairline)',
              color:
                activeCategory === null
                  ? 'var(--sp-accent-teal)'
                  : 'var(--sp-muted)',
            }}
          >
            全部
            <span className="ml-1.5 text-[10px] opacity-50">
              ({softwareList.length})
            </span>
          </button>
          {categories.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
                className="group relative border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] transition-all cursor-pointer"
                style={{
                  fontFamily: 'var(--font-sans)',
                  borderColor: isActive
                    ? 'var(--sp-accent-teal)'
                    : 'var(--sp-hairline)',
                  color: isActive
                    ? 'var(--sp-accent-teal)'
                    : 'var(--sp-muted)',
                }}
              >
                {cat}
                <span className="ml-1.5 text-[10px] opacity-50">
                  ({categoryCounts[cat] || 0})
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  /* ────────── 网格视图 ────────── */
  const gridView = (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {filtered.map((sw) => (
          <motion.div
            key={sw.id}
            layout
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <SoftwareCard software={sw} variant="grid" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  /* ────────── 列表视图 ────────── */
  const listView = (
    <div className="divide-y divide-[var(--sp-hairline)]/40 border-t border-[var(--sp-hairline)]/40">
      <AnimatePresence mode="popLayout">
        {filtered.map((sw) => (
          <motion.div
            key={sw.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <SoftwareCard software={sw} variant="list" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  const activeView = viewMode === 'list' ? listView : gridView

  return (
    <>
      {/* 筛选区 + 工具栏 */}
      <div className="mb-10 space-y-5">
        {filtersBar}

        {/* 工具栏：排序 + 结果数 + 视图切换 */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span
              className="text-[11px] text-[var(--sp-muted)]/50"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {filtered.length} 个结果
            </span>
            <SortControl
              value={sortKey}
              asc={sortAsc}
              onKeyChange={setSortKey}
              onOrderToggle={() => setSortAsc(!sortAsc)}
            />
          </div>
          <ViewSwitcher value={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* 视图内容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {activeView}
        </motion.div>
      </AnimatePresence>

      {/* 空状态 */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center"
        >
          <SlidersHorizontal
            size={32}
            strokeWidth={1}
            className="mx-auto mb-4 text-[var(--sp-muted)]/30"
          />
          <p
            className="text-sm text-[var(--sp-muted)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            没有找到匹配的软件，试试其他关键字或分类
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setActiveCategory(null)
            }}
            className="mt-4 text-[11px] text-[var(--sp-accent-teal)]/70 hover:text-[var(--sp-accent-teal)] transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            清除所有筛选
          </button>
        </motion.div>
      )}
    </>
  )
}
