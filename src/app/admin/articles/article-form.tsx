'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import type { Article } from '@/types/db'

export function ArticleForm({ article }: { article?: Partial<Article> }) {
  const router = useRouter()
  const isEdit = !!article
  const [title, setTitle] = useState(article?.title || '')
  const [slug, setSlug] = useState(article?.slug || '')
  const [content, setContent] = useState(article?.content || '')
  const [excerpt, setExcerpt] = useState(article?.excerpt || '')
  const [category, setCategory] = useState(article?.category || '')
  const [tags, setTags] = useState(typeof article?.tags === 'string' ? article.tags : (Array.isArray(article?.tags) ? (article.tags as string[]).join(', ') : ''))
  const [published, setPublished] = useState(article?.published ?? true)
  const [saving, setSaving] = useState(false)

  function generateSlug(title: string) {
    // 先将中文转换为拼音占位，避免 URL 编码问题
    const slug = title
      .toLowerCase()
      // 保留英文、数字、中文，其他替换为 -
      .replace(/[^a-z0-9一-鿿]+/g, '-')
      .replace(/(^-|-$)/g, '')
    // 如果 slug 全是中文（无 ASCII 字符），用时间戳
    if (!/[a-z0-9]/.test(slug) || slug.length < 2) {
      return 'post-' + Date.now().toString(36)
    }
    return slug || 'untitled'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) { toast.error('标题和内容不能为空'); return }
    setSaving(true)
    try {
      const finalSlug = slug.trim() || generateSlug(title)
      const url = isEdit ? `/api/admin/articles/${article!.id}` : '/api/admin/articles'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), slug: finalSlug, content, excerpt: excerpt.trim() || null, category: category.trim() || null, tags: tags.trim() || null, published }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success(isEdit ? '文章已更新' : '文章已创建')
      router.push('/admin/articles')
      router.refresh()
    } catch { toast.error('保存失败') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <input type="text" placeholder="文章标题" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border-b-2 border-[var(--sp-hairline)] bg-transparent py-2 text-xl text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]" style={{ fontFamily: 'var(--font-display)' }} />
          <input type="text" placeholder="slug (留空自动生成)" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-muted)] outline-none focus:border-[var(--sp-accent-teal)]" />
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="## 开始撰写 Markdown…"
            label="文章内容（Markdown）"
            minHeight="480px"
          />
        </div>
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]">分类</label>
            <input type="text" placeholder="技术 / 随笔 / ..." value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]">标签 (逗号分隔)</label>
            <input type="text" placeholder="Next.js, React, 前端" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]">摘要</label>
            <textarea placeholder="文章摘要 (≤500 字)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={500} rows={3} className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)] resize-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--sp-ink)] cursor-pointer">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="cursor-pointer" />
            发布
          </label>
          <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-4 py-2.5 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer">
            <Save size={14} /> {saving ? '保存中...' : (isEdit ? '更新文章' : '创建文章')}
          </button>
        </div>
      </div>
    </form>
  )
}
