'use client'

import { useState, useCallback } from 'react'
import { Send, Loader2, BellRing, Users } from 'lucide-react'
import { toast } from 'sonner'

type NotifyType = 'article' | 'software'

/**
 * 管理后台 — 邮件通知页面
 *
 * 管理员可以选择文章或软件类型，填写标题/摘要后向所有已审核订阅者群发通知邮件。
 */
export default function NotifyPage() {
  const [notifyType, setNotifyType] = useState<NotifyType>('article')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; total: number } | null>(null)

  const handleSend = useCallback(async () => {
    if (notifyType === 'article') {
      if (!title.trim()) {
        toast.error('请填写文章标题')
        return
      }
      if (!slug.trim()) {
        toast.error('请填写文章 Slug')
        return
      }
    } else {
      if (!name.trim()) {
        toast.error('请填写软件名称')
        return
      }
    }

    setSending(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notifyType,
          title: notifyType === 'article' ? title.trim() : undefined,
          slug: notifyType === 'article' ? slug.trim() : undefined,
          excerpt: notifyType === 'article' ? excerpt.trim() || null : undefined,
          name: notifyType === 'software' ? name.trim() : undefined,
          description: notifyType === 'software' ? description.trim() || null : undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({ sent: data.sent, total: data.total })
        toast.success(data.message || '发送完成')
        // 清空表单
        setTitle('')
        setSlug('')
        setExcerpt('')
        setName('')
        setDescription('')
      } else {
        toast.error(data.error || '发送失败')
      }
    } catch {
      toast.error('网络错误，请稍后重试')
    } finally {
      setSending(false)
    }
  }, [notifyType, title, slug, excerpt, name, description])

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      <h1
        className="mb-2 text-2xl font-bold text-[var(--sp-ink)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        邮件通知
      </h1>
      <p className="mb-8 text-sm text-[var(--sp-muted)]">
        向所有已审核通过的订阅者发送新内容通知邮件。
      </p>

      {/* 类型选择 */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-[var(--sp-ink)]">
          通知类型
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setNotifyType('article')
              setResult(null)
            }}
            className="px-4 py-2 text-sm border transition-colors cursor-pointer"
            style={{
              fontFamily: 'var(--font-sans)',
              borderColor: notifyType === 'article' ? 'var(--sp-ink)' : 'var(--sp-hairline)',
              color: notifyType === 'article' ? 'var(--sp-ink)' : 'var(--sp-muted)',
              fontWeight: notifyType === 'article' ? 600 : 400,
            }}
          >
            📝 新文章
          </button>
          <button
            onClick={() => {
              setNotifyType('software')
              setResult(null)
            }}
            className="px-4 py-2 text-sm border transition-colors cursor-pointer"
            style={{
              fontFamily: 'var(--font-sans)',
              borderColor: notifyType === 'software' ? 'var(--sp-ink)' : 'var(--sp-hairline)',
              color: notifyType === 'software' ? 'var(--sp-ink)' : 'var(--sp-muted)',
              fontWeight: notifyType === 'software' ? 600 : 400,
            }}
          >
            💿 新软件
          </button>
        </div>
      </div>

      {/* 表单 */}
      <div className="mb-8 max-w-xl space-y-4 border border-[var(--sp-hairline)] bg-[var(--sp-surface)] p-6">
        {notifyType === 'article' ? (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--sp-muted)]">
                文章标题 <span className="text-[var(--sp-accent-sienna)]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：深入理解 JavaScript 闭包"
                className="w-full border-b-2 border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-ink)] placeholder:text-[var(--sp-muted)]/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--sp-muted)]">
                Slug <span className="text-[var(--sp-accent-sienna)]">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="例如：javascript-closures"
                className="w-full border-b-2 border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-ink)] placeholder:text-[var(--sp-muted)]/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--sp-muted)]">
                文章摘要 <span className="text-[var(--sp-muted)]/50">（选填）</span>
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="文章的前 150 字摘要..."
                className="w-full border-b-2 border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-ink)] placeholder:text-[var(--sp-muted)]/50 resize-none"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--sp-muted)]">
                软件名称 <span className="text-[var(--sp-accent-sienna)]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：VS Code"
                className="w-full border-b-2 border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-ink)] placeholder:text-[var(--sp-muted)]/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--sp-muted)]">
                软件描述 <span className="text-[var(--sp-muted)]/50">（选填）</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="软件的简短介绍..."
                className="w-full border-b-2 border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-ink)] placeholder:text-[var(--sp-muted)]/50 resize-none"
              />
            </div>
          </>
        )}

        {/* 发送按钮 */}
        <button
          onClick={handleSend}
          disabled={sending}
          className="inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-5 py-2 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer"
        >
          {sending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              发送中...
            </>
          ) : (
            <>
              <Send size={14} />
              发送通知
            </>
          )}
        </button>
      </div>

      {/* 发送结果 */}
      {result && (
        <div className="mb-6 max-w-xl border border-[var(--sp-hairline)] bg-[var(--sp-ground)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-[var(--sp-hairline)]">
              <Users size={18} strokeWidth={1.5} className="text-[var(--sp-ink)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--sp-ink)]">
                发送完成
              </p>
              <p className="text-xs text-[var(--sp-muted)]">
                成功发送 {result.sent} / {result.total} 封邮件
                {result.sent < result.total && '（部分发送失败，请检查 SMTP 配置）'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SMTP 配置提示 */}
      <div className="max-w-xl border border-[var(--sp-hairline)]/50 bg-[var(--sp-surface)]/50 p-5">
        <p className="text-xs text-[var(--sp-muted)]/70 leading-relaxed">
          <strong>提示：</strong>邮件发送依赖 SMTP 配置。
          请确保 <code className="text-[var(--sp-accent-teal)]">.env</code> 中已设置
          <code className="text-[var(--sp-accent-teal)]"> SMTP_HOST</code>、
          <code className="text-[var(--sp-accent-teal)]"> SMTP_PORT</code>、
          <code className="text-[var(--sp-accent-teal)]"> SMTP_USER</code>、
          <code className="text-[var(--sp-accent-teal)]"> SMTP_PASS</code> 和
          <code className="text-[var(--sp-accent-teal)]"> SMTP_FROM</code>。
          未配置时将跳过发送。
        </p>
      </div>
    </div>
  )
}
