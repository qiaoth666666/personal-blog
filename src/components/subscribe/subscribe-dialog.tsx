'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, BellRing, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface SubscribeDialogProps {
  open: boolean
  onClose: () => void
}

export function SubscribeDialog({ open, onClose }: SubscribeDialogProps) {
  const [email, setEmail] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [loading, setLoading] = useState(false)

  const refreshCaptcha = useCallback(() => {
    setCaptchaKey((k) => k + 1)
    setCaptcha('')
  }, [])

  useEffect(() => {
    if (open) {
      refreshCaptcha()
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch('/api/captcha', { cache: 'no-store' }).catch(() => {})
  }, [captchaKey])

  const captchaSrc = `/api/captcha?t=${captchaKey}`

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('请输入邮箱地址')
      return
    }

    // 第一步：展示验证码
    if (!showCaptcha) {
      setShowCaptcha(true)
      return
    }

    // 第二步：验证验证码并提交
    if (!captcha.trim()) {
      toast.error('请输入验证码')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), captcha: captcha.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || '订阅成功')
        setEmail('')
        setCaptcha('')
        setShowCaptcha(false)
        onClose()
      } else {
        toast.error(data.error || data.message || '订阅失败')
        if (data.error?.includes('验证码')) refreshCaptcha()
      }
    } catch {
      toast.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setEmail('')
    setCaptcha('')
    setShowCaptcha(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 弹窗 */}
      <div className="relative mx-4 w-full max-w-md border border-[var(--sp-hairline)] bg-[var(--sp-ground)] p-8 shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
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

        <form onSubmit={handleSubmit} className="space-y-4 overflow-hidden">
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

          {/* 验证码 — 高度展开/收起，内容显现 */}
          <motion.div
            animate={{
              height: showCaptcha ? 36 : 0,
              marginTop: showCaptcha ? 0 : -16,
              opacity: showCaptcha ? 1 : 0,
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 26, mass: 0.8 }}
            className="overflow-hidden"
            style={{ pointerEvents: showCaptcha ? 'auto' : 'none' }}
          >
            <div className="flex items-center gap-3">
              <img
                src={captchaSrc}
                alt="验证码"
                width={110}
                height={36}
                className="h-[36px] w-[110px] shrink-0 rounded border border-[var(--sp-hairline)] cursor-pointer"
                onClick={refreshCaptcha}
                title="点击换一张"
              />
              <button
                type="button"
                onClick={refreshCaptcha}
                className="shrink-0 text-[var(--sp-muted)]/50 hover:text-[var(--sp-ink)] transition-colors cursor-pointer"
                title="换一张"
              >
                <RefreshCw size={14} strokeWidth={1.5} />
              </button>
              <input
                type="text"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                placeholder="输入验证码"
                required={showCaptcha}
                maxLength={4}
                autoComplete="off"
                tabIndex={showCaptcha ? 0 : -1}
                className="flex-1 border-b-2 border-[var(--sp-hairline)] bg-transparent py-2.5 text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-ink)] placeholder:text-[var(--sp-muted)]"
              />
            </div>
          </motion.div>

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
            ) : showCaptcha ? (
              '确认订阅'
            ) : (
              '订阅'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
