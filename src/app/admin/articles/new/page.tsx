import { ArticleForm } from '../article-form'

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>新建文章</h1>
      <ArticleForm />
    </div>
  )
}
