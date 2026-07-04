import { notFound } from 'next/navigation'
import { queryOne } from '@/lib/db'
import type { Article } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { ArticleForm } from '../../article-form'

interface Props { params: Promise<{ id: string }> }

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params
  let article: (Article & RowDataPacket) | null = null
  try {
    article = await queryOne<Article & RowDataPacket>(
      'SELECT * FROM `Article` WHERE id = ?', [parseInt(id, 10)],
    )
  } catch {}
  if (!article) notFound()

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>编辑文章</h1>
      <ArticleForm article={article} />
    </div>
  )
}
