'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Package,
  MessageSquare,
  User,
  Settings,
  Image as ImageIcon,
  Tag,
  Bell,
  Send,
  LogOut,
  Home,
  Link2,
  Type,
  Sun,
  Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminTheme } from '@/components/admin/admin-theme-provider'

/** 需要显示待审核徽标的导航项：href → pendingCounts key */
const PENDING_KEY_MAP: Record<string, keyof PendingCounts> = {
  '/admin/guestbook': 'guestbook',
  '/admin/friends': 'friends',
  '/admin/subscribers': 'subscribers',
}

interface PendingCounts {
  guestbook: number
  friends: number
  subscribers: number
}

const NAV_ITEMS = [
  { href: '/admin', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/articles', label: '文章管理', icon: FileText },
  { href: '/admin/software', label: '软件管理', icon: Package },
  { href: '/admin/guestbook', label: '留言审核', icon: MessageSquare },
  { href: '/admin/resume', label: '简历编辑', icon: User },
  { href: '/admin/friends', label: '友链管理', icon: Link2 },
  { href: '/admin/photos', label: '图片管理', icon: ImageIcon },
  { href: '/admin/hero-tags', label: '首页标签', icon: Tag },
  { href: '/admin/about', label: '关于设置', icon: Settings },
  { href: '/admin/subscribers', label: '订阅管理', icon: Bell },
  { href: '/admin/notify', label: '邮件通知', icon: Send },
  { href: '/admin/markdown', label: 'Markdown格式', icon: Type },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolved, toggle } = useAdminTheme()
  const [pendingCounts, setPendingCounts] = useState<PendingCounts>({ guestbook: 0, friends: 0, subscribers: 0 })

  // 每 30 秒轮询一次待审核数量
  useEffect(() => {
    let cancelled = false
    async function fetchCounts() {
      try {
        const res = await fetch('/api/admin/pending-counts')
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (!cancelled) setPendingCounts(data)
      } catch { /* 静默失败 */ }
    }
    fetchCounts()
    const timer = setInterval(fetchCounts, 30_000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-[var(--sp-hairline)] bg-[var(--sp-surface)]">
      {/* Logo */}
      <div className="border-b border-[var(--sp-hairline)] px-6 py-5">
        <Link
          href="/admin"
          className="font-display text-lg font-bold italic text-[var(--sp-ink)] no-underline"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          管理后台
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4" style={{ fontFamily: 'var(--font-sans)' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          const pendingKey = PENDING_KEY_MAP[item.href]
          const pendingCount = pendingKey ? pendingCounts[pendingKey] : 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'mb-1 flex items-center gap-3 rounded-none px-3 py-2.5 text-sm no-underline transition-colors',
                isActive
                  ? 'bg-[var(--sp-ink)] text-[var(--sp-ground)]'
                  : 'text-[var(--sp-muted)] hover:bg-[var(--sp-hairline)]/30 hover:text-[var(--sp-ink)]',
              )}
            >
              <item.icon size={16} />
              <span className="flex-1">{item.label}</span>
              {pendingCount > 0 && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] text-[11px] font-medium leading-none tracking-tight',
                    isActive
                      ? 'bg-[var(--sp-ground)]/20 text-[var(--sp-ground)]'
                      : 'bg-[var(--sp-accent-sienna)]/12 text-[var(--sp-accent-sienna)]',
                  )}
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-[var(--sp-hairline)] px-3 py-4 space-y-1" style={{ fontFamily: 'var(--font-sans)' }}>
        {/* 主题切换 */}
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-sm text-[var(--sp-muted)] transition-colors hover:text-[var(--sp-ink)] cursor-pointer"
          title={resolved === 'dark' ? '切换为亮色模式' : '切换为暗色模式'}
        >
          {resolved === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {resolved === 'dark' ? '亮色模式' : '暗色模式'}
        </button>

        <Link
          href="/"
          className="flex items-center gap-3 rounded-none px-3 py-2.5 text-sm text-[var(--sp-muted)] no-underline transition-colors hover:text-[var(--sp-ink)]"
        >
          <Home size={16} />
          返回前台
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-sm text-[var(--sp-muted)] transition-colors hover:text-[var(--sp-accent-sienna)] cursor-pointer"
        >
          <LogOut size={16} />
          退出登录
        </button>
      </div>
    </aside>
  )
}
