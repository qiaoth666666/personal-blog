'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Menu, X, Sun, Moon, Home, FileText, Music, Package, BookOpen, MessageSquare, Link2, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/constants'
import { useSiteConfig } from '@/components/layout/site-config-provider'
import { useMusic } from '@/components/music/music-context'

const mobileNavIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  '/': Home,
  '/resume': FileText,
  '/music': Music,
  '/software': Package,
  '/articles': BookOpen,
  '/guestbook': MessageSquare,
  '/friends': Link2,
  '/about': User,
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const siteConfig = useSiteConfig()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const navRef = useRef<HTMLUListElement>(null)
  const { nowPlaying, showNavLyrics, currentNavLyric } = useMusic()
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const [indicatorReady, setIndicatorReady] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // 导航指示器 —— 手动测量位置，不受滚动状态影响
  const updateIndicator = useCallback(() => {
    if (!navRef.current) return
    const activeLink = navRef.current.querySelector<HTMLElement>('[data-nav-active="true"]')
    if (activeLink) {
      const parentRect = navRef.current.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      setIndicatorStyle({
        left: linkRect.left - parentRect.left,
        width: linkRect.width,
      })
    }
  }, [])

  useEffect(() => {
    // pathname 变化后等一帧让 DOM 更新，再测量
    const raf = requestAnimationFrame(() => {
      updateIndicator()
      setIndicatorReady(true)
    })
    window.addEventListener('resize', updateIndicator)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [pathname, updateIndicator])

  // 导航时立即滚到顶部
  const handleNavClick = useCallback(
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      }
      router.push(href)
    },
    [router],
  )

  return (
    <header
      className={cn(
        'sticky top-0 z-30 w-full transition-all duration-500 no-print',
        scrolled
          ? 'border-b border-[var(--sp-hairline)]/40 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
          : 'border-b border-transparent',
      )}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Left: Logo */}
        <Link
          href="/"
          className={cn(
            'font-display text-xl font-bold italic tracking-tight no-underline transition-all duration-500 shrink-0',
            'text-[var(--sp-ink)] hover:opacity-70',
          )}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {siteConfig.siteName}
        </Link>

        {/* Center: Lyrics line */}
        <div className="flex-1 flex items-center justify-center min-w-0 px-2 md:px-4">
          {showNavLyrics && currentNavLyric && nowPlaying && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="truncate text-sm text-[var(--sp-muted)]/80 font-serif italic max-w-full my-0 py-0 leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              &ldquo;{currentNavLyric}&rdquo;
            </motion.p>
          )}
        </div>

        {/* Right: Desktop Nav + Theme Toggle */}
        <ul ref={navRef} className="relative hidden md:flex items-center gap-1 shrink-0">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={handleNavClick(link.href)}
                  data-nav-active={isActive ? 'true' : 'false'}
                  className={cn(
                    'relative px-3.5 py-2 text-sm font-medium tracking-widest uppercase no-underline transition-colors duration-300',
                    isActive
                      ? 'text-[var(--sp-accent-teal)]'
                      : 'text-[var(--sp-muted)] hover:text-[var(--sp-ink)]',
                  )}
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}

          {/* 单一指示器 —— 首次加载直接定位，导航切换时丝滑动 */}
          {mounted && indicatorReady && (
            <motion.span
              className="absolute bottom-0 h-0.5 pointer-events-none"
              style={{ background: 'var(--sp-accent-teal)' }}
              initial={false}
              animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}

          {/* Theme Toggle */}
          <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="ml-2 rounded-lg p-2 text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-all duration-300 cursor-pointer"
              aria-label="切换主题"
              style={{ opacity: mounted ? 1 : 0, pointerEvents: mounted ? 'auto' : 'none' }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -20, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
        </ul>

        {/* Mobile: theme toggle + 汉堡按钮 */}
        <div className="flex items-center gap-1 md:hidden">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors cursor-pointer"
            aria-label="切换主题"
            style={{ opacity: mounted ? 1 : 0, pointerEvents: mounted ? 'auto' : 'none' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-[var(--sp-ink)] hover:bg-[var(--sp-surface)]/40 cursor-pointer transition-colors"
            aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Panel —— 从顶部滑入 */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              className="fixed inset-0 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* 面板 */}
            <motion.div
              className="mobile-nav-panel md:hidden"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* 关闭按钮 */}
              <button
                className="mobile-nav-close"
                onClick={() => setMobileOpen(false)}
                aria-label="关闭菜单"
              >
                <X size={20} />
              </button>

              {/* 2×4 网格 */}
              <ul className="mobile-nav-grid">
                {NAV_LINKS.map((link, i) => {
                  const Icon = mobileNavIcons[link.href] || null
                  const row = Math.floor(i / 2)
                  return (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{
                        delay: 0.15 + row * 0.08,
                        duration: 0.3,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <Link
                        href={link.href}
                        onClick={(e) => { handleNavClick(link.href)(e); setMobileOpen(false) }}
                        className={cn(
                          'mobile-nav-link',
                          pathname === link.href && 'active',
                        )}
                      >
                        {Icon && <Icon />}
                        {link.label}
                      </Link>
                    </motion.li>
                  )
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
