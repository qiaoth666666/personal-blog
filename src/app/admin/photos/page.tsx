'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, GripVertical, Save, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface Photo {
  id: number
  url: string
  caption: string | null
  sortOrder: number
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [newUrl, setNewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function fetchPhotos() {
    try {
      const res = await fetch('/api/admin/photos')
      if (res.ok) setPhotos(await res.json())
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchPhotos() }, [])

  async function addPhoto() {
    if (!newUrl.trim()) { toast.error('请输入图片 URL'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl.trim(), section: 'strip', sortOrder: photos.length }),
      })
      if (!res.ok) throw new Error()
      toast.success('已添加')
      setNewUrl('')
      fetchPhotos()
    } catch { toast.error('添加失败') } finally { setSaving(false) }
  }

  async function deletePhoto(id: number) {
    try {
      await fetch(`/api/admin/photos/${id}`, { method: 'DELETE' })
      toast.success('已删除')
      fetchPhotos()
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
      setNewUrl(`/pictures/${data.fileName}`)
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
      <h1 className="mb-8 font-display text-2xl font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>图片管理</h1>
      <p className="mb-8 text-sm text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>首页摄影带横向滚动图片。建议尺寸：宽 800px+。</p>

      {/* 添加新图片 */}
      <div className="mb-8 flex gap-3">
        <input
          type="text"
          placeholder="图片 URL 或点击「上传」按钮上传本地图片"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="flex-1 border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]"
          style={{ fontFamily: 'var(--font-sans)' }}
          onKeyDown={(e) => e.key === 'Enter' && addPhoto()}
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
          onClick={addPhoto}
          disabled={saving}
          className="inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-4 py-2 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <Plus size={14} /> 添加
        </button>
      </div>

      {/* 图片列表 */}
      {photos.length > 0 ? (
        <div className="space-y-2">
          {photos.map((photo) => (
            <div key={photo.id} className="flex items-center gap-3 border border-[var(--sp-hairline)] p-3">
              <GripVertical size={16} className="text-[var(--sp-hairline)]" />
              <img src={photo.url} alt="" className="h-14 w-20 object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-sans)' }}>{photo.url}</p>
                {photo.caption && <p className="text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-serif)' }}>{photo.caption}</p>}
              </div>
              <span className="text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>#{photo.sortOrder}</span>
              <button
                onClick={() => deletePhoto(photo.id)}
                className="text-[var(--sp-muted)] hover:text-[var(--sp-accent-sienna)] transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>暂无图片</p>
      )}
    </div>
  )
}
