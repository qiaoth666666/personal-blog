'use client'

import { useState } from 'react'
import { X, BellRing, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SubscribeDialogProps {
  open: boolean
  onClose: () => void
}

export function SubscribeDialog({ open, onClose }: SubscribeDialogProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('请输入邮箱地址')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || '订阅成功')
        setEmail('')
        onClose()
      } else {
        toast.error(data.error || data.message || '订阅失败')
      }
    } catch {
      toast.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗 */}
      <div className="relative mx-4 w-full max-w-md border border-[var(--sp-hairline)] bg-[var(--sp-ground)] p-8 shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors cursor-pointer"
          aria-label="关闭"
        >
          <X size={18} />
        </button>

        {/* 内容 */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-[var(--sp-hairline)]">
            <BellRing size={18} className="text-[var(--sp-ink)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
              订阅更新
            </h2>
            <p className="text-sm text-[var(--sp-muted)]">
              新文章和软件资源第一时间通知你
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入你的邮箱地址"
              required
              className="w-full border-b-2 border-[var(--sp-hairline)] bg-transparent py-2.5 text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-ink)] placeholder:text-[var(--sp-muted)]"
            />
          </div>
          <p className="text-xs text-[var(--sp-muted)] leading-relaxed">
            提交后需等待管理员审核，审核通过后即可收到通知邮件。
            每封邮件底部都包含退订链接。
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-4 py-2.5 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                提交中...
              </>
            ) : (
              '确认订阅'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
