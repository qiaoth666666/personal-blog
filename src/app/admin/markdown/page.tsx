'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { MarkdownContentType, MarkdownVarMap } from '@/lib/constants'
import { MARKDOWN_DEFAULTS, MD_VAR_KEYS, MD_VAR_GROUPS, MD_TYPE_LABELS, MD_VAR_LABELS } from '@/lib/constants'

const CONTENT_TYPES: MarkdownContentType[] = ['article', 'software', 'resume-web', 'resume-a4', 'about', 'preview']

export default function AdminMarkdownPage() {
  const [config, setConfig] = useState<Record<string, MarkdownVarMap>>({})
  const [activeTab, setActiveTab] = useState<MarkdownContentType>('article')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // 加载已有配置
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/markdown-config')
      if (res.ok) {
        const data = await res.json()
        if (data.config) setConfig(data.config)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  // 获取当前 Tab 的值（用户自定义 > 默认值）
  const currentVars = config[activeTab] ?? MARKDOWN_DEFAULTS[activeTab]

  // 更新单个变量
  function updateVar(key: string, value: string) {
    setConfig((prev) => {
      const typeConfig = { ...(prev[activeTab] ?? MARKDOWN_DEFAULTS[activeTab]), [key]: value }
      return { ...prev, [activeTab]: typeConfig }
    })
  }

  // 恢复当前 Tab 到默认值
  function resetTab() {
    setConfig((prev) => {
      const copy = { ...prev }
      delete copy[activeTab]
      return copy
    })
    toast.success(`已恢复「${MD_TYPE_LABELS[activeTab]}」到默认值`)
  }

  // 保存全部
  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/markdown-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      if (!res.ok) throw new Error()
      toast.success('已保存 Markdown 排版配置')
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[var(--sp-muted)]">加载中…</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {/* 页面标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--sp-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}>
            Markdown 格式编辑
          </h1>
          <p className="mt-1 text-sm text-[var(--sp-muted)]">
            分别调节文章、软件、简历等不同场景下的 Markdown 排版间距
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetTab}
            className="inline-flex items-center gap-2 border border-[var(--sp-hairline)] px-4 py-2 text-sm text-[var(--sp-muted)] transition-colors hover:text-[var(--sp-ink)] cursor-pointer"
          >
            <RotateCcw size={14} />
            恢复默认
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[var(--sp-ink)] px-4 py-2 text-sm text-[var(--sp-ground)] transition-opacity hover:opacity-80 disabled:opacity-50 cursor-pointer"
          >
            <Save size={14} />
            {saving ? '保存中…' : '保存配置'}
          </button>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="mb-6 flex gap-1 border-b border-[var(--sp-hairline)]">
        {CONTENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={cn(
              '-mb-px px-4 py-2.5 text-sm transition-colors cursor-pointer',
              activeTab === type
                ? 'border-b-2 border-[var(--sp-ink)] text-[var(--sp-ink)] font-medium'
                : 'text-[var(--sp-muted)] hover:text-[var(--sp-ink)]',
            )}
          >
            {MD_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* 变量编辑区 */}
      <div className="space-y-8">
        {MD_VAR_GROUPS.map((group) => (
          <div key={group.label}>
            <h2 className="mb-3 font-display text-base font-semibold text-[var(--sp-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}>
              {group.label}
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {group.keys.map((key) => {
                const currentValue = currentVars[key] ?? ''
                const defaultValue = MARKDOWN_DEFAULTS[activeTab][key] ?? ''
                const isModified = currentValue !== defaultValue

                return (
                  <div
                    key={key}
                    className={cn(
                      'flex flex-col gap-1 border p-3 transition-all',
                      isModified
                        ? 'border-[var(--sp-accent-teal)] bg-[var(--sp-accent-teal)]/8 shadow-[inset_3px_0_0_var(--sp-accent-teal)]'
                        : 'border-transparent bg-[var(--sp-surface)]/40 opacity-70',
                    )}
                  >
                    <label className="flex items-center justify-between text-xs text-[var(--sp-muted)]">
                      <code className="text-[11px]">{key}</code>
                      <span className="text-[11px]">{MD_VAR_LABELS[key]}</span>
                    </label>
                    <input
                      type="text"
                      value={currentValue}
                      onChange={(e) => updateVar(key, e.target.value)}
                      className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-1 font-mono text-sm text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-ink)]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                    <span className="text-[10px] text-[var(--sp-muted)]">
                      默认: {defaultValue}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 底部保存按钮 */}
      <div className="mt-10 border-t border-[var(--sp-hairline)] pt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[var(--sp-ink)] px-6 py-2.5 text-sm text-[var(--sp-ground)] transition-opacity hover:opacity-80 disabled:opacity-50 cursor-pointer"
        >
          <Save size={14} />
          {saving ? '保存中…' : '保存全部配置'}
        </button>
      </div>
    </div>
  )
}
