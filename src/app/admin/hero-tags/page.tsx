'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Trash2, Tag, Image as ImageIcon, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface HeroTag {
  id: number
  tag: string
  imageUrl: string | null
  sortOrder: number
}

export default function AdminHeroTagsPage() {
  const [tags, setTags] = useState<HeroTag[]>([])
  const [loading, setLoading] = useState(true)
  const [newTag, setNewTag] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/hero-tags')
      if (res.ok) setTags(await res.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTags() }, [fetchTags])

  async function addTag() {
    if (!newTag.trim()) { toast.error('请输入标签名'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/hero-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: newTag.trim(), imageUrl: newImageUrl.trim() || null, sortOrder: tags.length }),
      })
      if (!res.ok) throw new Error()
      toast.success('已添加')
      setNewTag('')
      setNewImageUrl('')
      fetchTags()
    } catch { toast.error('添加失败') } finally { setSaving(false) }
  }

  async function deleteTag(id: number) {
    if (!confirm('确定删除此标签？')) return
    try {
      await fetch(`/api/admin/hero-tags/${id}`, { method: 'DELETE' })
      toast.success('已删除')
      fetchTags()
    } catch { toast.error('删除失败') }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/pictures/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '上传失败')
      }
      const data = await res.json()
      setNewImageUrl(`/pictures/${data.fileName}`)
      toast.success(`图片已上传: ${data.originalName}`)
    } catch (err: any) {
      toast.error(err.message || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <p className="text-sm text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>加载中...</p>

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>首页标签管理</h1>
      <p className="mb-8 text-sm text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>
        每个标签可关联一张图片。鼠标悬停在首页标签上时，右侧叠图会丝滑切换到对应图片。
      </p>

      {/* 添加新标签 */}
      <div className="mb-8 flex gap-3">
        <input
          type="text"
          placeholder="标签名，如「羽毛球」「音乐」"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          className="w-40 shrink-0 border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]"
          style={{ fontFamily: 'var(--font-sans)' }}
          onKeyDown={(e) => e.key === 'Enter' && addTag()}
        />
        <input
          type="text"
          placeholder="图片 URL 或点击「上传」按钮上传本地图片"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          className="flex-1 border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]"
          style={{ fontFamily: 'var(--font-sans)' }}
          onKeyDown={(e) => e.key === 'Enter' && addTag()}
        />
        <label className="inline-flex cursor-pointer items-center gap-2 border border-[var(--sp-hairline)] px-3 py-2 text-sm text-[var(--sp-muted)] transition-colors hover:border-[var(--sp-accent-teal)] hover:text-[var(--sp-accent-teal)] shrink-0">
          <Upload size={14} />
          {uploading ? '上传中...' : '上传'}
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleImageUpload}
            disabled={uploading}
          />
        </label>
        <button
          onClick={addTag}
          disabled={saving}
          className="inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-4 py-2 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <Plus size={14} /> 添加
        </button>
      </div>

      {/* 标签列表 */}
      {tags.length > 0 ? (
        <div className="space-y-2">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-4 border border-[var(--sp-hairline)] p-3">
              <Tag size={16} className="text-[var(--sp-accent-teal)] shrink-0" />
              {tag.imageUrl ? (
                <img src={tag.imageUrl} alt={tag.tag} className="h-14 w-20 shrink-0 object-cover" />
              ) : (
                <div className="flex h-14 w-20 shrink-0 items-center justify-center border border-dashed border-[var(--sp-hairline)] bg-[var(--sp-surface)]">
                  <ImageIcon size={16} className="text-[var(--sp-hairline)]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display text-base font-semibold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>{tag.tag}</p>
                {tag.imageUrl ? (
                  <p className="truncate text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>{tag.imageUrl}</p>
                ) : (
                  <p className="text-xs text-[var(--sp-hairline)] italic" style={{ fontFamily: 'var(--font-sans)' }}>未设置图片</p>
                )}
              </div>
              <span className="text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>#{tag.sortOrder}</span>
              <button
                onClick={() => deleteTag(tag.id)}
                className="text-[var(--sp-muted)] hover:text-[var(--sp-accent-sienna)] transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>
          暂无标签。添加标签后即可在首页展示。
        </p>
      )}
    </div>
  )
}
