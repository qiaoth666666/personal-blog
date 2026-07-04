'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, User, Mail, PenLine, X, Reply, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ReplyTarget {
  id: number
  nickname: string
}

/**
 * 留言表单 —— 玻璃质感卡片
 * 温润文学气质：柔和边框 + 微妙阴影 + 聚焦发光
 * 支持回复模式，含蜜罐反机器人
 */
export function MessageForm({
  onSuccess,
  replyTo,
  onCancelReply,
}: {
  onSuccess: () => void
  replyTo?: ReplyTarget | null
  onCancelReply?: () => void
}) {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 进入回复模式时自动聚焦
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [replyTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nickname.trim()) {
      toast.error('请填写昵称')
      return
    }

    if (!email.trim()) {
      toast.error('请填写邮箱地址')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.error('请填写有效的邮箱地址')
      return
    }

    if (!content.trim()) {
      toast.error('请填写留言内容')
      return
    }

    if (content.length > 500) {
      toast.error('留言内容不能超过 500 字')
      return
    }

    if (honeypot) return

    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        nickname: nickname.trim(),
        email: email.trim(),
        content: content.trim(),
      }
      if (replyTo) {
        body.parentId = replyTo.id
      }

      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '提交失败' }))
        throw new Error(err.error || '提交失败')
      }
      toast.success('留言已提交至后台，审核通过后即可显示，请耐心等待~')
      setNickname('')
      setEmail('')
      setContent('')
      onCancelReply?.()
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const contentRatio = content.length / 500
  const isNearLimit = content.length > 400
  const isAtLimit = content.length >= 500

  return (
    <section>
      {/* 区块标题 */}
      <div className="mb-7 text-center">
        <h2
          className="font-display text-2xl font-bold tracking-tight text-[var(--sp-ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          留下足迹
        </h2>
        <p
          className="mt-2 font-serif text-[0.95rem] italic text-[var(--sp-muted)]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          每一条留言都会经过审核后显示
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-card relative space-y-6 p-6 sm:p-8"
      >
        {/* 蜜罐 —— 对用户不可见 */}
        <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {/* 回复提示条 */}
        {replyTo && (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--sp-accent-teal)]/25 bg-[var(--sp-accent-teal)]/5 px-4 py-3">
            <Reply size={15} className="flex-shrink-0 text-[var(--sp-accent-teal)]" />
            <span
              className="flex-1 text-sm text-[var(--sp-accent-teal)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              正在回复{' '}
              <span className="font-semibold">@{replyTo.nickname}</span>
            </span>
            <button
              type="button"
              onClick={onCancelReply}
              className="flex-shrink-0 rounded-full p-1 text-[var(--sp-muted)] transition-all hover:bg-[var(--sp-hairline)]/30 hover:text-[var(--sp-ink)]"
              aria-label="取消回复"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* 昵称 + 邮箱 —— 双列 */}
        <div className="grid gap-5 sm:grid-cols-2">
          {/* 昵称 */}
          <div className="space-y-2">
            <label
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--sp-ink)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <User size={14} className="text-[var(--sp-muted)]" />
              昵称
              <span className="text-[var(--sp-accent-sienna)]">*</span>
            </label>
            <input
              type="text"
              placeholder="你的称呼"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={50}
              required
              className="w-full rounded-lg border border-[var(--sp-hairline)] bg-[var(--sp-ground)]/80 px-4 py-2.5 text-sm text-[var(--sp-ink)] outline-none transition-all duration-200 placeholder:text-[var(--sp-muted)]/50 focus:border-[var(--sp-accent-teal)] focus:bg-[var(--sp-ground)] focus:shadow-[0_0_0_3px_rgba(30,94,107,0.08)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            />
          </div>

          {/* 邮箱 */}
          <div className="space-y-2">
            <label
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--sp-ink)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <Mail size={14} className="text-[var(--sp-muted)]" />
              邮箱
              <span className="text-[var(--sp-accent-sienna)]">*</span>
              <span className="hidden sm:inline text-xs font-normal text-[var(--sp-muted)]">
                · 仅用于审核，不公开
              </span>
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={200}
              required
              className="w-full rounded-lg border border-[var(--sp-hairline)] bg-[var(--sp-ground)]/80 px-4 py-2.5 text-sm text-[var(--sp-ink)] outline-none transition-all duration-200 placeholder:text-[var(--sp-muted)]/50 focus:border-[var(--sp-accent-teal)] focus:bg-[var(--sp-ground)] focus:shadow-[0_0_0_3px_rgba(30,94,107,0.08)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            />
          </div>
        </div>

        {/* 留言内容 */}
        <div className="space-y-2">
          <label
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--sp-ink)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <PenLine size={14} className="text-[var(--sp-muted)]" />
            留言内容
            <span className="text-[var(--sp-accent-sienna)]">*</span>
          </label>
          <div className="relative">
            <textarea
              ref={textareaRef}
              id="message-content"
              placeholder={
                replyTo
                  ? `写下你想对 @${replyTo.nickname} 说的话...`
                  : '写下你想说的话...'
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              required
              rows={4}
              className="w-full rounded-lg border border-[var(--sp-hairline)] bg-[var(--sp-ground)]/80 px-4 py-3 text-[0.95rem] leading-relaxed text-[var(--sp-ink)] outline-none transition-all duration-200 placeholder:text-[var(--sp-muted)]/50 focus:border-[var(--sp-accent-teal)] focus:bg-[var(--sp-ground)] focus:shadow-[0_0_0_3px_rgba(30,94,107,0.08)] resize-none"
              style={{ fontFamily: 'var(--font-serif)' }}
            />
            {/* 衬线文字区底部装饰线 */}
            <div className="pointer-events-none absolute bottom-3 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[var(--sp-hairline)]/60 to-transparent" />
          </div>
        </div>

        {/* 底部栏：字符计数 + 提交按钮 */}
        <div className="flex items-center justify-between pt-1">
          {/* 字符计数 —— 带进度条动画 */}
          <div className="flex items-center gap-2.5">
            <div className="h-1 w-16 overflow-hidden rounded-full bg-[var(--sp-hairline)]/40">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isAtLimit
                    ? 'bg-[var(--sp-accent-sienna)]'
                    : isNearLimit
                      ? 'bg-[var(--sp-accent-sienna)]/70'
                      : 'bg-[var(--sp-accent-teal)]/60'
                }`}
                style={{ width: `${contentRatio * 100}%` }}
              />
            </div>
            <span
              className={`text-xs tabular-nums transition-colors duration-300 ${
                isAtLimit
                  ? 'font-medium text-[var(--sp-accent-sienna)]'
                  : isNearLimit
                    ? 'text-[var(--sp-accent-sienna)]/70'
                    : 'text-[var(--sp-muted)]'
              }`}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {content.length}
              <span className="text-[var(--sp-muted)]/50"> / 500</span>
            </span>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={submitting}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-6 py-2.5 text-sm font-medium text-[var(--sp-ground)] transition-all duration-300 hover:bg-transparent hover:text-[var(--sp-ink)] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {/* 背景滑动效果 */}
            <span className="absolute inset-0 -translate-x-full bg-[var(--sp-ground)] transition-transform duration-300 group-hover:translate-x-0" />
            <span className="relative z-10 flex items-center gap-2">
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  提交中...
                </>
              ) : replyTo ? (
                <>
                  <Send size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  提交回复
                </>
              ) : (
                <>
                  <Send size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  提交留言
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </section>
  )
}
