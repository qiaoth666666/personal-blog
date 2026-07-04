'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Heart, Send, Loader2, MessageCircle } from 'lucide-react'
import { useSiteConfig } from '@/components/layout/site-config-provider'
import { toast } from 'sonner'

export function Footer() {
  const year = new Date().getFullYear()
  const siteConfig = useSiteConfig()
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('请输入邮箱地址')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.error('请填写有效的邮箱地址')
      return
    }

    setSubscribing(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || '订阅成功，请等待管理员审核')
        setEmail('')
      } else {
        toast.error(data.error || data.message || '订阅失败')
      }
    } catch {
      toast.error('网络错误，请稍后重试')
    } finally {
      setSubscribing(false)
    }
  }

  const hasContact =
    siteConfig.github || siteConfig.email || siteConfig.qq || siteConfig.twitter || siteConfig.bilibili

  return (
    <footer
      className="border-t border-[var(--sp-hairline)]/30 bg-[var(--sp-ground)]/60 backdrop-blur-sm"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* ═══ 上区：三栏 ═══ */}
        <div className="grid gap-10 sm:grid-cols-3">
          {/* 品牌 */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="font-display text-base font-bold italic tracking-tight text-[var(--sp-ink)] no-underline hover:opacity-70 transition-opacity"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {siteConfig.siteName}
            </Link>
            <p className="text-xs text-[var(--sp-muted)]">
              &copy; {year} {siteConfig.siteAuthor}
            </p>
            <p className="text-xs text-[var(--sp-muted)]/70 flex items-center gap-1">
              Built with <Heart size={10} className="text-[var(--sp-accent-sienna)]" /> & Next.js
            </p>
          </div>

          {/* 导航 */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--sp-ink)]">
              导航
            </span>
            <div className="flex flex-col gap-1.5">
              <Link href="/articles" className="text-xs text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors">
                文章
              </Link>
              <Link href="/resume" className="text-xs text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors">
                简历
              </Link>
              <Link href="/software" className="text-xs text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors">
                软库
              </Link>
              <Link href="/guestbook" className="text-xs text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors">
                留言板
              </Link>
              <Link href="/friends" className="text-xs text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors">
                友链
              </Link>
              <Link href="/about" className="text-xs text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors">
                关于
              </Link>
            </div>
          </div>

          {/* 联系方式 */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--sp-ink)]">
              联系方式
            </span>
            {hasContact ? (
              <div className="flex flex-col gap-2">
                {siteConfig.github && (
                  <a
                    href={siteConfig.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    GitHub
                  </a>
                )}
                {siteConfig.email && (
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="inline-flex items-center gap-2 text-xs text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors"
                  >
                    <Mail size={14} strokeWidth={1.5} />
                    {siteConfig.email}
                  </a>
                )}
                {siteConfig.qq && (
                  <a
                    href={`tencent://message/?uin=${siteConfig.qq}`}
                    className="inline-flex items-center gap-2 text-xs text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22c4.5 0 8-3.5 8-8 0-3.5-2-6-4.5-7.2.2-.6.5-1.8.5-2.8 0-2-1.5-3-2-3s-2 1-2 3c0 1 .3 2.2.5 2.8C10 8 8 10.5 8 14c0 4.5 3.5 8 8 8z" />
                      <path d="M7.5 14c-1.5.5-3 2-3 3.5 0 1 .5 2 1 2.5" />
                      <path d="M16.5 14c1.5.5 3 2 3 3.5 0 1-.5 2-1 2.5" />
                    </svg>
                    QQ: {siteConfig.qq}
                  </a>
                )}
                {siteConfig.twitter && (
                  <a
                    href={siteConfig.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                    Twitter
                  </a>
                )}
                {siteConfig.bilibili && (
                  <a
                    href={siteConfig.bilibili}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18.5 3.5l-3 3-3-3-3 3-3-3" />
                      <path d="M4 8h16v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                      <path d="M9 12v4" />
                      <path d="M12 12v4" />
                      <path d="M15 12v4" />
                    </svg>
                    Bilibili
                  </a>
                )}
                <Link
                  href="/guestbook"
                  className="inline-flex items-center gap-2 text-xs text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors"
                >
                  <MessageCircle size={14} strokeWidth={1.5} />
                  留言板
                </Link>
              </div>
            ) : (
              <p className="text-xs text-[var(--sp-muted)]/60">
                联系方式待配置 — 前往
                <Link href="/admin/about" className="mx-1 text-[var(--sp-accent-teal)] hover:opacity-70">
                  管理后台
                </Link>
                设置
              </p>
            )}
          </div>
        </div>

        {/* ═══ 中区：订阅 ═══ */}
        <div className="mt-10 border-t border-[var(--sp-hairline)]/30 pt-10">
          <div className="mx-auto max-w-md text-center">
            <h3
              className="font-display text-sm font-bold uppercase tracking-[0.12em] text-[var(--sp-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              订阅更新
            </h3>
            <p className="mt-2 text-xs text-[var(--sp-muted)]">
              新文章发布，第一时间通知你
            </p>

            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="输入你的邮箱地址"
                required
                className="flex-1 border-b-2 border-[var(--sp-hairline)] bg-transparent px-3 py-2.5 text-sm text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-ink)] placeholder:text-[var(--sp-muted)]/50"
                style={{ fontFamily: 'var(--font-sans)' }}
              />
              <button
                type="submit"
                disabled={subscribing}
                className="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-5 py-2.5 text-sm font-medium text-[var(--sp-ground)] transition-all duration-300 hover:bg-transparent hover:text-[var(--sp-ink)] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <span className="absolute inset-0 -translate-x-full bg-[var(--sp-ground)] transition-transform duration-300 group-hover:translate-x-0" />
                <span className="relative z-10 flex items-center gap-1.5">
                  {subscribing ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <Send size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                      订阅
                    </>
                  )}
                </span>
              </button>
            </form>

            <p className="mt-3 text-[10px] text-[var(--sp-muted)]/50">
              提交后需等待管理员审核，每封邮件底部都包含退订链接
            </p>
          </div>
        </div>

        {/* ═══ 底部装饰线 ═══ */}
        <div className="mt-10 pt-6 border-t border-[var(--sp-hairline)]/30 text-center">
          <p className="text-[11px] text-[var(--sp-muted)]/50">
            {siteConfig.siteDescription}
          </p>
        </div>
      </div>
    </footer>
  )
}
