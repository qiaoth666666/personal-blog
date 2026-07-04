import { query } from '@/lib/db'
import type { Article } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { PageTransition } from '@/components/effects/page-transition'
import { ArticleList } from '@/components/articles/article-list'
import { ResumeFallback } from '@/components/resume/resume-fallback'
import type { Metadata } from 'next'

// 文章列表必须动态渲染，确保新发布的文章立即可见
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '文章',
  description: '技术思考、生活随笔与读书笔记',
}

export default async function ArticlesPage() {
  let articles: Array<{
    id: number
    title: string
    slug: string
    excerpt: string | null
    category: string | null
    createdAt: Date
  }> = []
  let categories: string[] = []
  let dbError = false

  try {
    // 一次性获取全部已发布文章，分类过滤和分页交给客户端
    articles = await query<Pick<Article, 'id' | 'title' | 'slug' | 'excerpt' | 'category' | 'createdAt'> & RowDataPacket>(
      'SELECT id, title, slug, excerpt, category, createdAt FROM `Article` WHERE published = true ORDER BY createdAt DESC',
    )

    const catSet = new Set(
      (articles as Article[]).map((a) => a.category).filter(Boolean) as string[]
    )
    categories = Array.from(catSet).sort()
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

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        {/* 标题 */}
        <div className="mb-16 text-center">
          <h1
            className="font-display text-h1 font-bold text-[var(--sp-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            文章
          </h1>
          <p
            className="mt-3 font-serif text-lg italic text-[var(--sp-muted)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            技术思考、生活随笔与读书笔记
          </p>
        </div>

        {/* 客户端文章列表（分类过滤 + 分页） */}
        {articles.length > 0 ? (
          <ArticleList articles={articles} categories={categories} />
        ) : (
          <ResumeFallback />
        )}
      </div>
    </PageTransition>
  )
}
