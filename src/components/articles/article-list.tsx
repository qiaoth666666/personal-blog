'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ArticleCard } from '@/components/articles/article-card'
import { PAGINATION } from '@/lib/constants'
import type { Article } from '@/types/db'

interface ArticleListProps {
  articles: Pick<Article, 'id' | 'title' | 'slug' | 'excerpt' | 'category' | 'createdAt'>[]
  categories: string[]
}

export function ArticleList({ articles, categories }: ArticleListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const limit = PAGINATION.articlesPerPage

  // 每个分类的数量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    articles.forEach((a) => {
      if (a.category) {
        counts[a.category] = (counts[a.category] || 0) + 1
      }
    })
    return counts
  }, [articles])

  // 按分类过滤
  const filtered = useMemo(() => {
    if (activeCategory == null) return articles
    return articles.filter((a) => a.category === activeCategory)
  }, [articles, activeCategory])

  // 切换分类时重置到第一页
  const handleCategoryChange = (cat: string | null) => {
    setActiveCategory(cat)
    setCurrentPage(1)
  }

  // 客户端分页
  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((currentPage - 1) * limit, currentPage * limit)

  return (
    <div>
      {/* 分类筛选 */}
      {categories.length > 0 && (
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => handleCategoryChange(null)}
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
              ({articles.length})
            </span>
          </button>
          {categories.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() =>
                  handleCategoryChange(isActive ? null : cat)
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

      {/* 文章列表 */}
      {paged.length > 0 ? (
        <AnimatePresence mode="popLayout">
          {paged.map((article, idx) => (
            <motion.div
              key={article.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{
                duration: 0.3,
                delay: idx * 0.03,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <ArticleCard article={article} />
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center text-sm text-[var(--sp-muted)]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          该分类下暂无文章
        </motion.p>
      )}

      {/* 分页导航 */}
      {totalPages > 1 && (
        <nav
          className="mt-12 flex items-center justify-center gap-4"
          style={{ fontFamily: 'var(--font-sans)' }}
          aria-label="分页导航"
        >
          {currentPage > 1 && (
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              className="inline-flex items-center gap-1 text-sm text-[var(--sp-muted)] transition-colors hover:text-[var(--sp-ink)] cursor-pointer"
            >
              <ChevronLeft size={16} />
              上一页
            </button>
          )}

          <span className="text-sm text-[var(--sp-muted)]">
            {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages && (
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="inline-flex items-center gap-1 text-sm text-[var(--sp-muted)] transition-colors hover:text-[var(--sp-ink)] cursor-pointer"
            >
              下一页
              <ChevronRight size={16} />
            </button>
          )}
        </nav>
      )}
    </div>
  )
}
