import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { query } from '@/lib/db'
import type { Article } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { cache } from '@/lib/cache'
import { TextileSection } from '@/components/effects/textile-overlay'
import { ArticleCard } from '@/components/articles/article-card'

/**
 * 精选文章摘要 —— Server Component v2
 *
 * 增强: 区段头部带装饰图标 + 更新排版
 */
export async function RecentArticles() {
  let articles: Array<{
    id: number
    title: string
    slug: string
    excerpt: string | null
    category: string | null
    createdAt: Date
  }> = []

  try {
    articles = await cache('home:recent-articles', 30, () =>
      query<Pick<Article, 'id' | 'title' | 'slug' | 'excerpt' | 'category' | 'createdAt'> & RowDataPacket>(
        'SELECT id, title, slug, excerpt, category, createdAt FROM `Article` WHERE published = true ORDER BY createdAt DESC LIMIT 3',
      )
    )
  } catch {
    // 数据库不可用 — 显示占位
  }

  return (
    <TextileSection className="py-24" opacity={0.25}>
      <div className="mx-auto max-w-3xl px-6">
        {/* Section 标题 */}
        <div className="mb-16 text-center">
          <h2
            className="font-display text-h2 font-bold text-[var(--sp-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            最新文章
          </h2>
        </div>

        {articles.length > 0 ? (
          <div className="space-y-0">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          /* 占位状态 */
          <div className="space-y-0">
            {[
              { title: '文章即将上线', excerpt: '这里将展示最新的博客文章，敬请期待。', cat: '随笔' },
              { title: '开始写作吧', excerpt: '文章将通过 Markdown 撰写，支持代码高亮与优雅排版。', cat: '技术' },
            ].map((placeholder, i) => (
              <div
                key={i}
                className="border-t border-[var(--sp-hairline)] py-8 first:border-t-0"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider"
                      style={{
                        fontFamily: 'var(--font-sans)',
                        backgroundColor: 'color-mix(in srgb, var(--sp-accent-teal) 12%, transparent)',
                        color: 'var(--sp-accent-teal)',
                      }}
                    >
                      {placeholder.cat}
                    </span>
                    <span
                      className="text-xs text-[var(--sp-muted)]"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      即将发布
                    </span>
                  </div>
                  <h3
                    className="font-display text-xl font-bold text-[var(--sp-muted)] md:text-2xl"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {placeholder.title}
                  </h3>
                  <p
                    className="line-clamp-2 text-base leading-relaxed text-[var(--sp-muted)]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {placeholder.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 浏览全部 */}
        <div className="mt-14 text-center">
          <Link
            href="/articles"
            className="group inline-flex items-center gap-2 border border-[var(--sp-hairline)]/50 px-5 py-2.5 text-sm font-medium text-[var(--sp-muted)] no-underline transition-all duration-300 hover:border-[var(--sp-accent-teal)]/40 hover:text-[var(--sp-accent-teal)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            浏览全部文章
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </TextileSection>
  )
}
