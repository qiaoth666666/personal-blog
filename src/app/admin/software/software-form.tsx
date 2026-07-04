'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Upload, Image, Monitor, Apple, Smartphone, Globe, Info, FolderOpen, RefreshCw } from 'lucide-react'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { toast } from 'sonner'

interface SoftwareFormData {
  name: string
  version: string | null
  description: string | null
  detailContent: string | null
  officialUrl: string | null
  downloadUrl: string | null
  downloadFile: string | null
  fileSize: string | null
  platform: string | null
  category: string | null
  tags: string | null
  iconUrl: string | null
  notes: string | null
  sortOrder: number
}

interface SoftwareFormProps {
  software?: Partial<SoftwareFormData & { id: number }>
}

const PLATFORM_OPTIONS: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: 'Windows', label: 'Windows', icon: <Monitor size={13} strokeWidth={1.5} /> },
  { key: 'Mac', label: 'Mac', icon: <Apple size={13} strokeWidth={1.5} /> },
  { key: 'Linux', label: 'Linux', icon: <Monitor size={13} strokeWidth={1.5} /> },
  { key: 'Android', label: 'Android', icon: <Smartphone size={13} strokeWidth={1.5} /> },
  { key: 'iOS', label: 'iOS', icon: <Smartphone size={13} strokeWidth={1.5} /> },
  { key: 'Web', label: 'Web', icon: <Globe size={13} strokeWidth={1.5} /> },
]

const SECTION_LABEL =
  'block mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--sp-muted)]'

export function SoftwareForm({ software }: SoftwareFormProps) {
  const router = useRouter()
  const isEdit = !!software
  const [name, setName] = useState(software?.name || '')
  const [version, setVersion] = useState(software?.version ?? '')
  const [description, setDescription] = useState(software?.description ?? '')
  const [detailContent, setDetailContent] = useState(software?.detailContent ?? '')
  const [officialUrl, setOfficialUrl] = useState(software?.officialUrl ?? '')
  const [downloadUrl, setDownloadUrl] = useState(software?.downloadUrl ?? '')
  const [downloadFile, setDownloadFile] = useState(software?.downloadFile ?? '')
  const [fileSize, setFileSize] = useState(software?.fileSize ?? '')
  const [platform, setPlatform] = useState(software?.platform ?? '')
  const [category, setCategory] = useState(software?.category ?? '')
  const [tags, setTags] = useState(software?.tags ?? '')
  const [iconUrl, setIconUrl] = useState(software?.iconUrl ?? '')
  const [notes, setNotes] = useState(software?.notes ?? '')
  const [sortOrder, setSortOrder] = useState(software?.sortOrder ?? 0)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // 已有文件列表
  const [existingFiles, setExistingFiles] = useState<
    { name: string; size: number; mtime: string }[]
  >([])
  const [loadingFiles, setLoadingFiles] = useState(false)

  const fetchFiles = async () => {
    setLoadingFiles(true)
    try {
      const res = await fetch('/api/admin/software/files')
      if (res.ok) {
        const data = await res.json()
        setExistingFiles(data.files || [])
      }
    } catch {}
    setLoadingFiles(false)
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleSelectFile = (name: string) => {
    setDownloadFile(name)
    const f = existingFiles.find((x) => x.name === name)
    if (f && !fileSize) {
      const mb = (f.size / (1024 * 1024)).toFixed(1)
      setFileSize(f.size > 1024 * 1024 ? `${mb} MB` : `${(f.size / 1024).toFixed(1)} KB`)
    }
  }

  const togglePlatform = (p: string) => {
    const current = platform.split(',').map((s) => s.trim()).filter(Boolean)
    const next = current.includes(p)
      ? current.filter((x) => x !== p)
      : [...current, p]
    setPlatform(next.join(','))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const res = await fetch('/api/admin/software/upload', {
        method: 'POST',
        headers: {
          'X-Filename': encodeURIComponent(file.name),
          'Content-Type': 'application/octet-stream',
        },
        body: file,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '上传失败')
      }
      const data = await res.json()
      setDownloadFile(data.fileName)
      if (!fileSize) {
        const sizeMB = (data.size / (1024 * 1024)).toFixed(1)
        setFileSize(
          data.size > 1024 * 1024
            ? `${sizeMB} MB`
            : `${(data.size / 1024).toFixed(1)} KB`
        )
      }
      toast.success(`文件已上传: ${data.originalName}`)
      e.target.value = ''
    } catch (err: any) {
      toast.error(err.message || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/pictures/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '上传失败')
      }
      const data = await res.json()
      setIconUrl(`/pictures/${data.fileName}`)
      toast.success(`图标已上传: ${data.originalName}`)
    } catch (err: any) {
      toast.error(err.message || '上传失败')
    } finally {
      setImageUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('软件名不能为空')
      return
    }
    setSaving(true)
    try {
      const url = isEdit
        ? `/api/admin/software/${software!.id}`
        : '/api/admin/software'
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          version: version.trim() || null,
          description: description.trim() || null,
          detailContent: detailContent.trim() || null,
          officialUrl: officialUrl.trim() || null,
          downloadUrl: downloadUrl.trim() || null,
          downloadFile: downloadFile || null,
          fileSize: fileSize.trim() || null,
          platform: platform || null,
          category: category.trim() || null,
          tags: tags.trim() || null,
          iconUrl: iconUrl.trim() || null,
          notes: notes.trim() || null,
          sortOrder,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(isEdit ? '软件已更新' : '软件已添加')
      router.push('/admin/software')
      router.refresh()
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full border-b border-[var(--sp-hairline)] bg-transparent py-2.5 text-sm text-[var(--sp-ink)] outline-none transition-colors placeholder:text-[var(--sp-muted)]/40 focus:border-[var(--sp-accent-teal)]'

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl space-y-8"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* === 基本信息 === */}
      <fieldset className="space-y-4 border-0 p-0">
        <legend className={SECTION_LABEL}>基本信息</legend>
        <input
          type="text"
          placeholder="软件名称 *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
          style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="版本号 (如 24.09)"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="文件大小 (如 24.5 MB)"
            value={fileSize}
            onChange={(e) => setFileSize(e.target.value)}
            className={inputClass}
          />
        </div>
        <textarea
          placeholder="简介 — 卡片展示用的简短描述，建议 2-3 句话"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </fieldset>

      {/* === 下载资源 === */}
      <fieldset className="space-y-4 border-0 p-0">
        <legend className={SECTION_LABEL}>下载资源</legend>

        {/* 已有文件选择器 */}
        <div className="border border-[var(--sp-hairline)] bg-[var(--sp-surface)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen size={14} strokeWidth={1.5} className="text-[var(--sp-muted)]" />
              <span className="text-xs font-medium text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-sans)' }}>
                选择已有文件
              </span>
              <span className="text-[10px] text-[var(--sp-muted)]">
                ({existingFiles.length} 个)
              </span>
            </div>
            <button
              type="button"
              onClick={fetchFiles}
              disabled={loadingFiles}
              className="text-[var(--sp-muted)] hover:text-[var(--sp-ink)] disabled:opacity-30 cursor-pointer"
              title="刷新列表"
            >
              <RefreshCw size={12} className={loadingFiles ? 'animate-spin' : ''} />
            </button>
          </div>

          {existingFiles.length > 0 ? (
            <select
              value={downloadFile || ''}
              onChange={(e) => handleSelectFile(e.target.value)}
              className="w-full border border-[var(--sp-hairline)] bg-[var(--sp-ground)] py-2 px-3 text-sm text-[var(--sp-ink)] outline-none"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <option value="">-- 不选择（仅提供外链） --</option>
              {existingFiles.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} ({(f.size / 1024 / 1024).toFixed(1)} MB)
                </option>
              ))}
            </select>
          ) : (
            <p className="text-[11px] text-[var(--sp-muted)]">
              {loadingFiles ? '加载中...' : 'public/downloads/ 目录为空'}
            </p>
          )}

          {downloadFile && (
            <p className="mt-2 text-[10px] text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
              下载链接：/api/download?file={downloadFile}
            </p>
          )}
        </div>

        {/* 小上传按钮（补充用） */}
        <div className="flex items-center gap-2 text-[11px] text-[var(--sp-muted)]">
          <span className="h-px flex-1 bg-[var(--sp-hairline)]" />
          <label className="inline-flex cursor-pointer items-center gap-1 text-[var(--sp-muted)]/60 hover:text-[var(--sp-accent-teal)] transition-colors">
            <Upload size={11} />
            {uploading ? '上传中...' : '上传新文件'}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          <span className="h-px flex-1 bg-[var(--sp-hairline)]" />
        </div>

        {/* 外部链接 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="url"
            placeholder="官方网站 URL"
            value={officialUrl}
            onChange={(e) => setOfficialUrl(e.target.value)}
            className={inputClass}
          />
          <input
            type="url"
            placeholder="备用下载链接 (外部)"
            value={downloadUrl}
            onChange={(e) => setDownloadUrl(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* 提示 */}
        <div className="flex items-start gap-2 text-[11px] text-[var(--sp-muted)]/50">
          <Info size={12} className="mt-0.5 shrink-0" />
          <span>
            文件放到 public/downloads/ 后点刷新，下拉选择即可链接。
            部署时文件随项目一起上传服务器。
          </span>
        </div>
      </fieldset>

      {/* === 分类与标签 === */}
      <fieldset className="space-y-4 border-0 p-0">
        <legend className={SECTION_LABEL}>分类与标签</legend>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="分类 (工具 / 开发 / 设计 / 效率...)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="标签，逗号分隔 (开源,压缩,免费)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* 平台选择 */}
        <div>
          <span className="mb-2 block text-xs text-[var(--sp-muted)]">支持平台</span>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORM_OPTIONS.map(({ key, label, icon }) => {
              const active = platform.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePlatform(key)}
                  className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs transition-all"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    borderColor: active
                      ? 'var(--sp-accent-teal)'
                      : 'var(--sp-hairline)',
                    color: active
                      ? 'var(--sp-accent-teal)'
                      : 'var(--sp-muted)',
                    backgroundColor: active
                      ? 'var(--sp-accent-teal)/8'
                      : 'transparent',
                  }}
                >
                  {icon}
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </fieldset>

      {/* === 图标/截图 === */}
      <fieldset className="space-y-3 border-0 p-0">
        <legend className={SECTION_LABEL}>图标 / 截图</legend>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="图标 URL (如 https://example.com/icon.png)"
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
            className={`flex-1 ${inputClass}`}
          />
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 border border-[var(--sp-hairline)] px-3 py-2 text-xs text-[var(--sp-muted)] transition-colors hover:border-[var(--sp-accent-teal)] hover:text-[var(--sp-accent-teal)]">
            <Image size={13} strokeWidth={1.5} />
            {imageUploading ? '...' : '上传'}
            <input
              ref={imageInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              onChange={handleImageUpload}
              disabled={imageUploading}
            />
          </label>
        </div>
        {iconUrl && (
          <p className="text-[11px] text-[var(--sp-muted)]">
            预览: {iconUrl}
          </p>
        )}
      </fieldset>

      {/* === 详细介绍 Markdown === */}
      <fieldset className="space-y-3 border-0 p-0">
        <p className="text-[11px] leading-relaxed text-[var(--sp-muted)]/60">
          此处内容将展示在软件详情页的「详细介绍」区域。
        </p>
        <MarkdownEditor
          value={detailContent}
          onChange={setDetailContent}
          placeholder="## 功能特点&#10;&#10;- **特点一** — 详细描述&#10;- **特点二** — 详细描述&#10;&#10;## 使用建议&#10;&#10;推荐安装配置说明..."
          label="详细介绍（Markdown）"
          minHeight="360px"
        />
      </fieldset>

      {/* === 备注 === */}
      <fieldset className="space-y-3 border-0 p-0">
        <legend className={SECTION_LABEL}>备注 / 提示</legend>
        <textarea
          placeholder="安装说明、激活方式、使用技巧等额外信息..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </fieldset>

      {/* === 排序 === */}
      <fieldset className="space-y-3 border-0 p-0">
        <legend className={SECTION_LABEL}>排序权重</legend>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
          className={`${inputClass} w-24`}
        />
        <p className="text-[11px] text-[var(--sp-muted)]/60">
          数字越小越靠前。默认为 0。
        </p>
      </fieldset>

      {/* 提交按钮 */}
      <div className="flex items-center gap-3 border-t border-[var(--sp-hairline)] pt-6">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-6 py-2.5 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <Save size={14} />
          {saving ? '保存中...' : isEdit ? '更新软件' : '添加软件'}
        </button>
        <button
          type="button"
          onClick={() => {
            router.push('/admin/software')
            router.refresh()
          }}
          className="border border-[var(--sp-hairline)] px-5 py-2.5 text-sm text-[var(--sp-muted)] transition-colors hover:text-[var(--sp-ink)] cursor-pointer"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          取消
        </button>
      </div>
    </form>
  )
}
