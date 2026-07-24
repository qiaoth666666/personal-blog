'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Heart, Send, Loader2, MessageCircle, RefreshCw } from 'lucide-react'
import { useSiteConfig } from '@/components/layout/site-config-provider'
import { toast } from 'sonner'

export function Footer() {
  const year = new Date().getFullYear()
  const siteConfig = useSiteConfig()
  const [email, setEmail] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  const refreshCaptcha = useCallback(() => {
    setCaptchaKey((k) => k + 1)
    setCaptcha('')
  }, [])

  // 每次 captchaKey 变化时预加载验证码
  useEffect(() => {
    fetch('/api/captcha', { cache: 'no-store' }).catch(() => {})
  }, [captchaKey])

  const captchaSrc = `/api/captcha?t=${captchaKey}`

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

    setSubscribing(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), captcha: captcha.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || '订阅成功，请等待管理员审核')
        setEmail('')
        setCaptcha('')
        setShowCaptcha(false)
        refreshCaptcha()
      } else {
        toast.error(data.error || data.message || '订阅失败')
        if (data.error?.includes('验证码')) refreshCaptcha()
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
              className="font-display text-lg font-bold italic tracking-tight text-[var(--sp-ink)] no-underline hover:opacity-70 transition-opacity"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {siteConfig.siteName}
            </Link>
            <p className="text-[13px] text-[var(--sp-muted)]">
              &copy; {year} {siteConfig.siteAuthor}
            </p>
            <p className="text-[13px] text-[var(--sp-muted)]/70 flex items-center gap-1">
              Built with <Heart size={12} className="text-[var(--sp-accent-sienna)]" /> & Next.js
            </p>
          </div>

          {/* 导航 */}
          <div className="flex flex-col gap-2.5">
            <span className="text-sm font-semibold uppercase tracking-wider text-[var(--sp-ink)]">
              导航
            </span>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-[13px] text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors">
                首页
              </Link>
              <Link href="/resume" className="text-[13px] text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors">
                简历
              </Link>
              <Link href="/music" className="text-[13px] text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors">
                拾曲
              </Link>
              <Link href="/software" className="text-[13px] text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors">
                软库
              </Link>
              <Link href="/articles" className="text-[13px] text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors">
                文章
              </Link>
              <Link href="/guestbook" className="text-[13px] text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors">
                留言
              </Link>
              <Link href="/friends" className="text-[13px] text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors">
                友链
              </Link>
              <Link href="/about" className="text-[13px] text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors">
                关于
              </Link>
            </div>
          </div>

          {/* 联系方式 + 订阅更新 — 同属右栏 */}
          <div className="flex flex-col gap-5">
            {/* 联系方式 — 图标横向排列 */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-[var(--sp-ink)]">
                联系方式
              </span>
              {hasContact ? (
                <div className="flex flex-wrap items-center gap-4">
                  {siteConfig.github && (
                    <a
                      href={siteConfig.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="GitHub"
                      className="text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                      </svg>
                    </a>
                  )}
                  {siteConfig.email && (
                    <a
                      href={`mailto:${siteConfig.email}`}
                      title={siteConfig.email}
                      className="text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors"
                    >
                      <Mail size={18} strokeWidth={1.5} />
                    </a>
                  )}
                  {siteConfig.qq && (
                    <a
                      href={`tencent://message/?uin=${siteConfig.qq}`}
                      title={`QQ: ${siteConfig.qq}`}
                      className="text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22c4.5 0 8-3.5 8-8 0-3.5-2-6-4.5-7.2.2-.6.5-1.8.5-2.8 0-2-1.5-3-2-3s-2 1-2 3c0 1 .3 2.2.5 2.8C10 8 8 10.5 8 14c0 4.5 3.5 8 8 8z" />
                        <path d="M7.5 14c-1.5.5-3 2-3 3.5 0 1 .5 2 1 2.5" />
                        <path d="M16.5 14c1.5.5 3 2 3 3.5 0 1-.5 2-1 2.5" />
                      </svg>
                    </a>
                  )}
                  {siteConfig.twitter && (
                    <a
                      href={siteConfig.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Twitter"
                      className="text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                      </svg>
                    </a>
                  )}
                  {siteConfig.bilibili && (
                    <a
                      href={siteConfig.bilibili}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Bilibili"
                      className="text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18.5 3.5l-3 3-3-3-3 3-3-3" />
                        <path d="M4 8h16v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                        <path d="M9 12v4" />
                        <path d="M12 12v4" />
                        <path d="M15 12v4" />
                      </svg>
                    </a>
                  )}
                  <Link
                    href="/guestbook"
                    title="留言板"
                    className="text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors"
                  >
                    <MessageCircle size={18} strokeWidth={1.5} />
                  </Link>
                </div>
              ) : (
                <p className="text-[13px] text-[var(--sp-muted)]/60">
                  暂无联系方式
                </p>
              )}
            </div>

            {/* 订阅更新 — 位于联系方式下方 */}
            <div className="border-t border-[var(--sp-hairline)]/20 pt-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--sp-ink)]">
                订阅更新
              </p>
              <p className="mt-1 text-xs text-[var(--sp-muted)]/70">
                新文章第一时间通知你
              </p>

              <form onSubmit={handleSubscribe} className="mt-2.5">
                {/* 邮箱 */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="邮箱地址"
                  required
                  className="w-full border-b border-[var(--sp-hairline)] bg-transparent px-2.5 py-1.5 text-[13px] text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-ink)] placeholder:text-[var(--sp-muted)]/40"
                  style={{ fontFamily: 'var(--font-sans)' }}
                />

                {/* 验证码 — 从右滑入，丝滑过渡 */}
                <AnimatePresence mode="sync">
                  {showCaptcha && (
                    <motion.div
                      initial={{ x: 80, opacity: 0, maxHeight: 0, marginTop: 0 }}
                      animate={{ x: 0, opacity: 1, maxHeight: 60, marginTop: 8 }}
                      exit={{ x: 80, opacity: 0, maxHeight: 0, marginTop: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={captchaSrc}
                          alt="验证码"
                          width={90}
                          height={30}
                          className="h-[30px] w-[90px] shrink-0 rounded border border-[var(--sp-hairline)] cursor-pointer"
                          onClick={refreshCaptcha}
                          title="点击换一张"
                        />
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          className="shrink-0 text-[var(--sp-muted)]/50 hover:text-[var(--sp-ink)] transition-colors cursor-pointer"
                          title="换一张"
                        >
                          <RefreshCw size={12} strokeWidth={1.5} />
                        </button>
                        <input
                          type="text"
                          value={captcha}
                          onChange={(e) => setCaptcha(e.target.value)}
                          placeholder="验证码"
                          required
                          maxLength={4}
                          autoComplete="off"
                          className="min-w-0 flex-1 border-b border-[var(--sp-hairline)] bg-transparent px-2 py-1.5 text-[13px] text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-ink)] placeholder:text-[var(--sp-muted)]/40"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 提交按钮 */}
                <motion.button
                  type="submit"
                  disabled={subscribing}
                  layout
                  transition={{ layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
                  className="group relative mt-2 inline-flex w-full items-center justify-center overflow-hidden border border-[var(--sp-ink)] bg-[var(--sp-ink)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--sp-ground)] transition-all duration-300 hover:bg-transparent hover:text-[var(--sp-ink)] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  <span className="absolute inset-0 -translate-x-full bg-[var(--sp-ground)] transition-transform duration-300 group-hover:translate-x-0" />
                  <span className="relative z-10 flex items-center gap-1">
                    {subscribing ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        提交中
                      </>
                    ) : showCaptcha ? (
                      <>
                        <Send size={12} />
                        确认订阅
                      </>
                    ) : (
                      <>
                        <Send size={12} />
                        订阅
                      </>
                    )}
                  </span>
                </motion.button>
              </form>

              <p className="mt-2 text-[10px] text-[var(--sp-muted)]/40">
                提交后等待审核，邮件底部含退订链接
              </p>
            </div>
          </div>
        </div>

        {/* ═══ 底部：备案号 ═══ */}
        <div className="mt-10 pt-6 border-t border-[var(--sp-hairline)]/30 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {/* 公安备案 */}
            <a
              href="https://beian.mps.gov.cn/#/query/webSearch?keyword=豫公网安备41132702000148号"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 no-underline text-[var(--sp-muted)]/60 hover:text-[var(--sp-accent-sienna)] transition-colors"
            >
              <img src="/images/gongan-icon.png" alt="公安备案" width="17" height="17" className="inline-block" />
              <span
                className="text-sm tracking-wide"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                豫公网安备41132702000148号
              </span>
            </a>
            {/* ICP 备案 */}
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 no-underline text-[var(--sp-muted)]/60 hover:text-[var(--sp-accent-sienna)] transition-colors"
            >
              <img src="/images/icp-icon.png" alt="ICP备案" width="17" height="17" className="inline-block" />
              <span
                className="text-sm tracking-wide"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                豫ICP备2026032094号
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
