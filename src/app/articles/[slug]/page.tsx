import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { queryOne } from '@/lib/db'
import type { Article } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { renderMarkdown } from '@/lib/markdown'
import { PageTransition } from '@/components/effects/page-transition'
import { ArticleToc } from '@/components/articles/toc'
import { ResumeFallback } from '@/components/resume/resume-fallback'
import type { Metadata } from 'next'

// 文章详情页必须每次请求都动态渲染，避免新文章/旧 slug 被缓存为 404
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params
  let slug: string
  try { slug = decodeURIComponent(rawSlug) } catch { slug = rawSlug }
  try {
    const article = await queryOne<Pick<Article, 'title' | 'excerpt'> & RowDataPacket>(
      'SELECT title, excerpt FROM `Article` WHERE slug = ? LIMIT 1',
      [slug],
    )
    if (article) {
      return {
        title: article.title,
        description: article.excerpt || article.title,
      }
    }
  } catch {}
  return { title: '文章未找到' }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params
  // Next.js 16 对中文 slug 可能未完全解码，这里做一次安全解码
  let slug: string
  try {
    slug = decodeURIComponent(rawSlug)
  } catch {
    slug = rawSlug
  }

  let article: {
    id: number
    title: string
    content: string
    excerpt: string | null
    category: string | null
    tags: string | null
    createdAt: Date
  } | null = null
  let prevSlug: string | null = null
  let nextSlug: string | null = null
  let dbError = false

  try {
    article = await queryOne<Pick<Article, 'id' | 'title' | 'content' | 'excerpt' | 'category' | 'tags' | 'createdAt'> & RowDataPacket>(
      'SELECT id, title, content, excerpt, category, tags, createdAt FROM `Article` WHERE slug = ? AND published = true LIMIT 1',
      [slug],
    )

    if (article) {
      // 前后篇导航
      const [prev, next] = await Promise.all([
        queryOne<Pick<Article, 'slug' | 'title'> & RowDataPacket>(
          'SELECT slug, title FROM `Article` WHERE published = true AND createdAt < ? ORDER BY createdAt DESC LIMIT 1',
          [article.createdAt],
        ),
        queryOne<Pick<Article, 'slug' | 'title'> & RowDataPacket>(
          'SELECT slug, title FROM `Article` WHERE published = true AND createdAt > ? ORDER BY createdAt ASC LIMIT 1',
          [article.createdAt],
        ),
      ])
      prevSlug = prev?.slug ?? null
      nextSlug = next?.slug ?? null
    }
  } catch {
    dbError = true
  }

  if (dbError) {
    return (
      <PageTransition>
        <ResumeFallback />
      </PageTransition>
    )
  }

  if (!article) {
    notFound()
  }

  // 简易 MDX 渲染 (将 Markdown 转为基本 HTML)
  // 在生产中推荐使用 next-mdx-remote
  const htmlContent = renderMarkdown(article.content)
  const tags = article.tags
    ? article.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  return (
    <PageTransition>
      <article className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        {/* 文章头 */}
        <header className="mb-16 text-center">
          {article.category && (
            <span
              className="text-xs font-medium uppercase tracking-wider text-[var(--sp-accent-teal)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {article.category}
            </span>
          )}
          <h1
            className="mt-3 font-display text-3xl font-bold leading-tight text-[var(--sp-ink)] md:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {article.title}
          </h1>
          <time
            className="mt-4 block font-serif text-base italic text-[var(--sp-muted)]"
            style={{ fontFamily: 'var(--font-serif)' }}
            dateTime={article.createdAt.toISOString()}
          >
            {new Date(article.createdAt).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </header>

        {/* 正文 + 侧边 TOC */}
        <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-12">
          {/* TOC - 移动端顶部 / 桌面端侧边 */}
          <div className="lg:order-last">
            <ArticleToc content={article.content} />
          </div>

          {/* 正文 */}
          <div
            className="article-content prose prose-lg max-w-none"
            style={{ fontFamily: 'var(--font-serif)' }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* 标签 */}
        {tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="border-b border-[var(--sp-hairline)] pb-0.5 text-xs text-[var(--sp-muted)]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 前后导航 */}
        <nav className="mt-20 grid grid-cols-2 gap-4 border-t border-[var(--sp-hairline)] pt-8">
          <div>
            {prevSlug && (
              <Link
                href={`/articles/${encodeURIComponent(prevSlug)}`}
                className="group inline-flex items-center gap-2 text-sm text-[var(--sp-muted)] no-underline transition-colors hover:text-[var(--sp-ink)]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                上一篇
              </Link>
            )}
          </div>
          <div className="text-right">
            {nextSlug && (
              <Link
                href={`/articles/${encodeURIComponent(nextSlug)}`}
                className="group inline-flex items-center gap-2 text-sm text-[var(--sp-muted)] no-underline transition-colors hover:text-[var(--sp-ink)]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                下一篇
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </nav>
      </article>
    </PageTransition>
  )
}
