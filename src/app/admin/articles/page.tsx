import Link from 'next/link'
import { Plus, Edit } from 'lucide-react'
import { query } from '@/lib/db'
import type { Article } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { DeleteArticleButton } from './delete-button'
import { PublishButton } from './publish-button'

export default async function AdminArticlesPage() {
  let articles: Array<{
    id: number; title: string; slug: string; category: string | null
    published: boolean; createdAt: Date; viewCount: number
  }> = []

  try {
    articles = await query<Pick<Article, 'id' | 'title' | 'slug' | 'category' | 'published' | 'createdAt' | 'viewCount'> & RowDataPacket>(
      'SELECT id, title, slug, category, published, createdAt, viewCount FROM `Article` ORDER BY createdAt DESC',
    )
  } catch {}

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>文章管理</h1>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-4 py-2 text-sm font-medium text-[var(--sp-ground)] no-underline transition-colors hover:bg-transparent hover:text-[var(--sp-ink)]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <Plus size={14} /> 新建文章
        </Link>
      </div>

      <div className="border-t border-[var(--sp-hairline)]">
        {articles.length > 0 ? (
          articles.map((a) => (
            <div key={a.id} className="flex items-center justify-between border-b border-[var(--sp-hairline)] px-2 py-3">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/articles/${a.id}/edit`} className="font-serif text-base text-[var(--sp-ink)] no-underline hover:opacity-70" style={{ fontFamily: 'var(--font-serif)' }}>
                  {a.title}
                </Link>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>{a.slug}</span>
                  {a.category && <span className="text-xs text-[var(--sp-accent-teal)]" style={{ fontFamily: 'var(--font-sans)' }}>{a.category}</span>}
                  <span className={`text-xs ${a.published ? 'text-green-700' : 'text-[var(--sp-muted)]'}`} style={{ fontFamily: 'var(--font-sans)' }}><PublishButton id={a.id} published={a.published} /></span>
                  <span className="text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>{a.viewCount} 阅读</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/admin/articles/${a.id}/edit`} className="text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors"><Edit size={16} /></Link>
                <DeleteArticleButton id={a.id} title={a.title} />
              </div>
            </div>
          ))
        ) : (
          <p className="py-12 text-center text-sm text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>暂无文章</p>
        )}
      </div>
    </div>
  )
}
