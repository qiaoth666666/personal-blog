'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { MarkdownEditor } from '@/components/admin/markdown-editor'

const TABS = ['基本信息', '站点设置', '站点简介', '个人介绍', '联系方式']

export default function AdminAboutPage() {
  const [tab, setTab] = useState('基本信息')
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/about-config')
      if (res.ok) {
        const data = await res.json()
        if (data) setForm(data)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchConfig() }, [fetchConfig])

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/about-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('关于页设置已保存')
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
      const result = await res.json()
      update('avatarUrl', `/pictures/${result.fileName}`)
      toast.success(`头像已上传: ${result.originalName}`)
    } catch (err: any) {
      toast.error(err.message || '上传失败')
    } finally {
      setImageUploading(false)
    }
  }

  if (loading)
    return (
      <p className="text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>
        加载中...
      </p>
    )

  return (
    <div>
      <h1
        className="mb-8 font-display text-2xl font-bold text-[var(--sp-ink)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        关于页设置
      </h1>

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-1 border-b border-[var(--sp-hairline)]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm transition-colors cursor-pointer ${
              tab === t
                ? 'border-b-2 border-[var(--sp-ink)] text-[var(--sp-ink)] font-medium'
                : 'text-[var(--sp-muted)] hover:text-[var(--sp-ink)]'
            }`}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="max-w-2xl space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
        {/* ============ 基本信息 ============ */}
        {tab === '基本信息' && (
          <div className="space-y-4">
            {/* 头像 */}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]">
                头像
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={form.avatarUrl || ''}
                  onChange={(e) => update('avatarUrl', e.target.value)}
                  placeholder="头像 URL 或上传本地图片"
                  className="flex-1 border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]"
                />
                <label className="inline-flex cursor-pointer items-center gap-2 border border-[var(--sp-hairline)] px-3 py-2 text-sm text-[var(--sp-muted)] transition-colors hover:border-[var(--sp-accent-teal)] hover:text-[var(--sp-accent-teal)] shrink-0">
                  <Upload size={14} />
                  {imageUploading ? '上传中...' : '上传'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                  />
                </label>
              </div>
              {form.avatarUrl && (
                <div className="mt-3 h-20 w-20 overflow-hidden border border-[var(--sp-hairline)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.avatarUrl}
                    alt="头像预览"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <TextField
              label="显示名称"
              value={form.displayName || ''}
              onChange={(v) => update('displayName', v)}
              placeholder="关于页展示的名称"
            />
            <TextField
              label="个人标签"
              value={form.tagline || ''}
              onChange={(v) => update('tagline', v)}
              placeholder="一句话介绍自己，如：开发者 · 写作者 · 音乐爱好者"
            />
          </div>
        )}

        {/* ============ 站点设置 ============ */}
        {tab === '站点设置' && (
          <div className="space-y-4">
            <TextField
              label="站点名称"
              value={form.siteName || ''}
              onChange={(v) => update('siteName', v)}
              placeholder="显示在浏览器标题栏和 Header 中"
            />
            <TextField
              label="站点描述"
              value={form.siteDescription || ''}
              onChange={(v) => update('siteDescription', v)}
              placeholder="SEO 描述，显示在 Footer 底部"
            />
            <TextField
              label="站点作者"
              value={form.siteAuthor || ''}
              onChange={(v) => update('siteAuthor', v)}
              placeholder="显示在 Footer 版权信息中"
            />
          </div>
        )}

        {/* ============ 站点简介 ============ */}
        {tab === '站点简介' && (
          <div>
            <p className="mb-4 text-sm text-[var(--sp-muted)]">
              关于页展示的站点介绍，支持 Markdown 格式。
            </p>
            <MarkdownEditor
              value={form.siteIntro || ''}
              onChange={(v) => update('siteIntro', v)}
              placeholder="写下你的站点简介…&#10;&#10;## 关于这个博客&#10;&#10;这里是**个人博客** —— 一座温润、人文、有温度的私人数字花园。"
              label="站点简介"
              minHeight="300px"
            />
          </div>
        )}

        {/* ============ 个人介绍 ============ */}
        {tab === '个人介绍' && (
          <div>
            <p className="mb-4 text-sm text-[var(--sp-muted)]">
              关于页展示的个人介绍，支持 Markdown 格式。首段将被提取为 Pull Quote。
            </p>
            <MarkdownEditor
              value={form.personalBio || ''}
              onChange={(v) => update('personalBio', v)}
              placeholder="写一段自我介绍...&#10;&#10;**热爱技术与人文的交叉点**&#10;&#10;这里可以写下你的故事、兴趣和信念。&#10;&#10;> 生活不是我们活过的日子，而是我们记住的日子。"
              label="个人介绍"
              minHeight="360px"
            />
          </div>
        )}

        {/* ============ 联系方式 ============ */}
        {tab === '联系方式' && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--sp-muted)]">
              以下联系方式将显示在关于页和 Footer 中，留空则不显示。
            </p>
            <TextField
              label="邮箱"
              value={form.email || ''}
              onChange={(v) => update('email', v)}
              placeholder="your@email.com"
            />
            <TextField
              label="GitHub"
              value={form.github || ''}
              onChange={(v) => update('github', v)}
              placeholder="https://github.com/yourname"
            />
            <TextField
              label="QQ"
              value={form.qq || ''}
              onChange={(v) => update('qq', v)}
              placeholder="QQ 号"
            />
            <TextField
              label="Twitter"
              value={form.twitter || ''}
              onChange={(v) => update('twitter', v)}
              placeholder="https://twitter.com/yourname"
            />
            <TextField
              label="Bilibili"
              value={form.bilibili || ''}
              onChange={(v) => update('bilibili', v)}
              placeholder="https://space.bilibili.com/xxx"
            />
          </div>
        )}

        {/* 保存按钮 */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-6 py-2.5 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer"
          >
            <Save size={14} /> {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  )
}

/** 简易文本字段 */
function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]"
      />
    </div>
  )
}
