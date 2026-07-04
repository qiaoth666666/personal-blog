'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, Plus, Trash2, Upload, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { ResumeStyleEditor } from '@/components/admin/resume-style-editor'
import type { ResumeStyleConfig } from '@/lib/resume-styles'

const TABS = ['基本信息', '教育经历', '专业技能', '项目经历', '技能证书', '自我介绍', 'A4样式设置']

/** 字段定义：支持 text / date / markdown 三种类型 */
interface FieldDef {
  key: string
  label: string
  type: 'text' | 'date' | 'markdown'
  placeholder?: string
}

const PROJECT_FIELDS: FieldDef[] = [
  { key: 'name', label: '项目名称', type: 'text' },
  { key: 'role', label: '角色', type: 'text' },
  { key: 'startDate', label: '开始时间', type: 'date' },
  { key: 'endDate', label: '结束时间', type: 'date' },
  { key: 'description', label: '项目描述', type: 'markdown' },
  { key: 'techStack', label: '技术栈', type: 'text', placeholder: '逗号分隔' },
  { key: 'link', label: '链接', type: 'text' },
]

const CERT_FIELDS: FieldDef[] = [
  { key: 'name', label: '证书名称', type: 'text' },
  { key: 'issuer', label: '颁发机构', type: 'text' },
  { key: 'issueDate', label: '颁发日期', type: 'date' },
  { key: 'description', label: '详细描述', type: 'markdown' },
]

const EDU_FIELDS: FieldDef[] = [
  { key: 'school', label: '学校', type: 'text' },
  { key: 'degree', label: '学位', type: 'text' },
  { key: 'major', label: '专业', type: 'text' },
  { key: 'startDate', label: '开始时间', type: 'date' },
  { key: 'endDate', label: '结束时间', type: 'date' },
  { key: 'description', label: '简介', type: 'markdown' },
]

export default function AdminResumePage() {
  const [tab, setTab] = useState('基本信息')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/resume')
      if (res.ok) setData(await res.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function save(section: string, payload: any) {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/resume/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast.success('已保存')
      fetchAll()
    } catch { toast.error('保存失败') } finally { setSaving(false) }
  }

  if (loading) return <p className="text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>加载中...</p>
  if (!data) return <p className="text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>数据加载失败</p>

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>简历编辑</h1>

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

      {tab === '基本信息' && <ProfileTab data={data.profile} save={(d: any) => save('profile', d)} saving={saving} />}
      {tab === '教育经历' && <EditableListTab items={data.education} section="education" save={save} saving={saving} fields={EDU_FIELDS} />}
      {tab === '专业技能' && <SkillContentTab data={data.skillContent} save={(d: any) => save('skill-content', d)} saving={saving} />}
      {tab === '项目经历' && <EditableListTab items={data.projects} section="projects" save={save} saving={saving} fields={PROJECT_FIELDS} />}
      {tab === '技能证书' && <EditableListTab items={data.certificates} section="certificates" save={save} saving={saving} fields={CERT_FIELDS} />}
      {tab === '自我介绍' && <IntroTab data={data.intro} save={(d: any) => save('intro', d)} saving={saving} />}
      {tab === 'A4样式设置' && <StyleTab initialConfig={data.style?.config} saving={saving} />}
    </div>
  )
}

// ===================== 基本信息表单（不变） =====================
function ProfileTab({ data, save, saving }: { data: any; save: (d: any) => void; saving: boolean }) {
  const [form, setForm] = useState(data || {})
  const [imageUploading, setImageUploading] = useState(false)
  const fields = [
    { key: 'name', label: '姓名' },
    { key: 'title', label: '职位/头衔' },
    { key: 'email', label: '邮箱' },
    { key: 'phone', label: '电话' },
    { key: 'location', label: '所在地' },
    { key: 'website', label: '个人网站 URL' },
    { key: 'github', label: 'GitHub URL' },
    { key: 'linkedin', label: 'LinkedIn URL' },
    { key: 'twitter', label: 'Twitter URL' },
  ]
  const statuses = ['', '在职', '实习']

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/pictures/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '上传失败')
      }
      const result = await res.json()
      setForm({ ...form, avatarUrl: `/pictures/${result.fileName}` })
      toast.success(`头像已上传: ${result.originalName}`)
    } catch (err: any) {
      toast.error(err.message || '上传失败')
    } finally {
      setImageUploading(false)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(form) }} className="max-w-xl space-y-4" style={{ fontFamily: 'var(--font-sans)' }}>
      {fields.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]">{f.label}</label>
          <input type="text" value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]" />
        </div>
      ))}
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]">头像</label>
        <div className="flex items-center gap-3">
          <input type="text" value={form.avatarUrl || ''} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="头像 URL 或上传本地图片" className="flex-1 border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]" />
          <label className="inline-flex cursor-pointer items-center gap-2 border border-[var(--sp-hairline)] px-3 py-2 text-sm text-[var(--sp-muted)] transition-colors hover:border-[var(--sp-accent-teal)] hover:text-[var(--sp-accent-teal)] shrink-0">
            <Upload size={14} />
            {imageUploading ? '上传中...' : '上传'}
            <input type="file" className="hidden" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml" onChange={handleImageUpload} disabled={imageUploading} />
          </label>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]">首页自我描述</label>
        <input type="text" value={form.heroIntro || ''} onChange={(e) => setForm({ ...form, heroIntro: e.target.value })} className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]">当前状态</label>
        <select value={form.status || ''} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)] cursor-pointer" style={{ fontFamily: 'var(--font-sans)' }}>
          {statuses.map((s) => (
            <option key={s} value={s}>{s || '未设置'}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={saving} className="inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-6 py-2.5 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer">
        <Save size={14} /> {saving ? '保存中...' : '保存基本信息'}
      </button>
    </form>
  )
}

// ===================== 可编辑列表（支持 text / date / markdown 字段） =====================
function EditableListTab({ items, section, save, saving, fields }: { items: any[]; section: string; save: (section: string, d: any) => void; saving: boolean; fields: FieldDef[] }) {
  const [list, setList] = useState(items || [])

  function update(idx: number, key: string, val: string) {
    const next = [...list]
    next[idx] = { ...next[idx], [key]: val }
    setList(next)
  }

  function add() {
    const item: any = { sortOrder: list.length }
    fields.forEach((f) => (item[f.key] = ''))
    setList([...list, item])
  }

  function remove(idx: number) {
    setList(list.filter((_, i) => i !== idx))
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    const next = [...list]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setList(next)
  }

  function moveDown(idx: number) {
    if (idx === list.length - 1) return
    const next = [...list]
    ;[next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]
    setList(next)
  }

  function handleSave() {
    save(section, list)
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
      {list.map((item: any, idx: number) => {
        const isMarkdownField = (key: string) => fields.find(f => f.key === key)?.type === 'markdown'

        return (
          <div key={idx} className="border border-[var(--sp-hairline)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--sp-muted)]">#{idx + 1}</span>
                <button onClick={() => moveUp(idx)} disabled={idx === 0}
                  className="text-[var(--sp-muted)] hover:text-[var(--sp-ink)] disabled:opacity-20 cursor-pointer text-xs" title="上移">↑</button>
                <button onClick={() => moveDown(idx)} disabled={idx === list.length - 1}
                  className="text-[var(--sp-muted)] hover:text-[var(--sp-ink)] disabled:opacity-20 cursor-pointer text-xs" title="下移">↓</button>
              </div>
              <button onClick={() => remove(idx)} className="text-[var(--sp-muted)] hover:text-[var(--sp-accent-sienna)] cursor-pointer"><Trash2 size={14} /></button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((f) => {
                if (f.type === 'markdown') {
                  // Markdown 字段跨列全宽
                  return (
                    <div key={f.key} className="sm:col-span-2">
                      <label className="mb-1 block text-xs text-[var(--sp-muted)]">{f.label}</label>
                      <MarkdownEditor
                        value={item[f.key] || ''}
                        onChange={(v) => update(idx, f.key, v)}
                        minHeight="180px"
                      />
                    </div>
                  )
                }
                // 普通 text / date 字段
                return (
                  <div key={f.key}>
                    <label className="mb-1 block text-xs text-[var(--sp-muted)]">{f.label}</label>
                    <input
                      type={f.type === 'date' ? 'date' : 'text'}
                      value={f.type === 'date' ? (item[f.key] ? new Date(item[f.key]).toISOString().slice(0, 10) : '') : (item[f.key] || '')}
                      onChange={(e) => update(idx, f.key, f.type === 'date' ? new Date(e.target.value).toISOString() : e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-1.5 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      <div className="flex gap-3">
        <button onClick={add} className="inline-flex items-center gap-2 border border-[var(--sp-hairline)] px-4 py-2 text-sm text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors cursor-pointer"><Plus size={14} /> 添加</button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-6 py-2 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer">
          <Save size={14} /> {saving ? '保存中...' : '保存列表'}
        </button>
      </div>
    </div>
  )
}

// ===================== 自我介绍（Markdown） =====================
function IntroTab({ data, save, saving }: { data: any; save: (d: any) => void; saving: boolean }) {
  const [content, setContent] = useState(data?.content || '')
  return (
    <form onSubmit={(e) => { e.preventDefault(); save({ content }) }} className="max-w-2xl space-y-4">
      <MarkdownEditor
        value={content}
        onChange={setContent}
        placeholder="写一段自我介绍...&#10;&#10;**粗体** *斜体* [链接](url)&#10;&#10;- 列表项&#10;- 列表项&#10;&#10;> 引用文字"
        label="自我介绍（Markdown）"
        minHeight="360px"
      />
      <button type="submit" disabled={saving} className="inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-6 py-2.5 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer">
        <Save size={14} /> {saving ? '保存中...' : '保存介绍'}
      </button>
    </form>
  )
}

// ===================== 专业技能（单个 Markdown） =====================
function SkillContentTab({ data, save, saving }: { data: any; save: (d: any) => void; saving: boolean }) {
  const [content, setContent] = useState(data?.content || '')
  return (
    <form onSubmit={(e) => { e.preventDefault(); save({ content }) }} className="max-w-2xl space-y-4">
      <p className="text-sm text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>
        在此编写你的专业技能介绍，支持 Markdown 格式。
      </p>
      <MarkdownEditor
        value={content}
        onChange={setContent}
        placeholder="写下你的专业技能...&#10;&#10;## 前端开发&#10;- React / Next.js&#10;- TypeScript&#10;- 三年开发经验"
        label="专业技能（Markdown）"
        minHeight="360px"
      />
      <button type="submit" disabled={saving} className="inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-6 py-2.5 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer">
        <Save size={14} /> {saving ? '保存中...' : '保存专业技能'}
      </button>
    </form>
  )
}

// ===================== A4 样式设置 =====================
function StyleTab({ initialConfig, saving }: { initialConfig?: string | null; saving: boolean }) {
  const [styleSaving, setStyleSaving] = useState(false)

  async function handleSave(config: ResumeStyleConfig) {
    setStyleSaving(true)
    try {
      const res = await fetch('/api/admin/resume/style', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error()
      toast.success('样式配置已保存')
    } catch { toast.error('保存失败') } finally { setStyleSaving(false) }
  }

  return (
    <ResumeStyleEditor
      initialConfig={initialConfig}
      saving={saving || styleSaving}
      onSave={handleSave}
    />
  )
}
