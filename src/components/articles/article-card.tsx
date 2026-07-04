import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Article } from '@/types/db'

/**
 * 文章卡片 —— 列表项 v2
 *
 * 排版: 分类标签 + 日期 + 大标题 + 摘要
 * 增强: 悬浮左侧边框高亮 + 箭头动画 + 微位移
 */
export function ArticleCard({
  article,
}: {
  article: Pick<Article, 'title' | 'slug' | 'excerpt' | 'category' | 'createdAt'>
}) {
  return (
    <article className="group border-t border-[var(--sp-hairline)] py-8 first:border-t-0">
      <Link href={`/articles/${encodeURIComponent(article.slug)}`} className="no-underline">
        <div className="flex flex-col gap-3 pl-0 transition-all duration-400 group-hover:pl-3">
          {/* Meta 行 */}
          <div className="flex items-center gap-3">
            {article.category && (
              <span
                className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider"
                style={{
                  fontFamily: 'var(--font-sans)',
                  backgroundColor: 'color-mix(in srgb, var(--sp-accent-teal) 12%, transparent)',
                  color: 'var(--sp-accent-teal)',
                }}
              >
                {article.category}
              </span>
            )}
            <span
              className="text-xs text-[var(--sp-muted)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {new Date(article.createdAt).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* 标题行：标题 + 悬浮箭头 */}
          <div className="flex items-start justify-between gap-6">
            <h2
              className="font-display text-xl font-bold text-[var(--sp-ink)] transition-all duration-300 group-hover:text-[var(--sp-accent-teal)] md:text-2xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {article.title}
            </h2>
            <ArrowRight
              size={18}
              className="mt-1.5 shrink-0 text-[var(--sp-muted)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--sp-accent-teal)]"
            />
          </div>

          {/* 摘要 */}
          {article.excerpt && (
            <p
              className="line-clamp-2 max-w-lg text-base leading-relaxed text-[var(--sp-muted)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {article.excerpt}
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}
