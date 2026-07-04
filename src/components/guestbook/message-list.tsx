'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MapPin,
  Monitor,
  Smartphone,
  MessageCircle,
  CornerDownRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { StaggeredReveal, StaggeredItem } from '@/components/effects/staggered-reveal'
import { PAGINATION } from '@/lib/constants'

// ── 类型 ──────────────────────────────────────────
interface Message {
  id: number
  nickname: string
  content: string
  createdAt: string
  ipProvince?: string | null
  ipCity?: string | null
  deviceType?: string | null
  parentId?: number | null
  isAdmin: boolean
  parent?: { nickname: string } | null
  replies?: Message[]
}

// ── 渐变头像色板 ──────────────────────────────────
const AVATAR_GRADIENTS = [
  'from-amber-600/80 to-rose-500/80',
  'from-emerald-600/80 to-teal-500/80',
  'from-sky-600/80 to-indigo-500/80',
  'from-violet-600/80 to-purple-500/80',
  'from-rose-600/80 to-pink-500/80',
  'from-teal-600/80 to-cyan-500/80',
  'from-orange-600/80 to-yellow-500/80',
  'from-blue-600/80 to-violet-500/80',
]

function avatarGradient(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

// ── 相对时间 ──────────────────────────────────────
function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 周前`
  if (days < 365) return `${Math.floor(days / 30)} 个月前`
  return `${Math.floor(days / 365)} 年前`
}

function fullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ── 递归打平回复 ──────────────────────────────────
function flattenReplies(replies: Message[]): Message[] {
  return replies.flatMap((r) => [r, ...flattenReplies(r.replies || [])])
}

// ── 头像组件 ──────────────────────────────────────
function Avatar({
  name,
  size = 'md',
  isAdmin = false,
}: {
  name: string
  size?: 'sm' | 'md'
  isAdmin?: boolean
}) {
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-[0.65rem]' : 'h-10 w-10 text-sm'
  return (
    <div
      className={`${sizeClass} flex flex-shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-sm transition-transform duration-200 ${
        isAdmin
          ? 'from-[var(--sp-accent-teal)] to-[var(--sp-accent-teal)]/75 ring-2 ring-[var(--sp-accent-teal)]/15'
          : `${avatarGradient(name)} ring-1 ring-white/15`
      }`}
      style={{ fontFamily: 'var(--font-display)' }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

// ── 主留言 Meta 行 ────────────────────────────────
function MessageMeta({ msg }: { msg: Message }) {
  return (
    <div className="flex items-start gap-3.5">
      <Avatar name={msg.nickname} isAdmin={msg.isAdmin} />
      <div className="min-w-0 flex-1 pt-0.5">
        {/* 昵称 + UP 标 */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className="font-display text-[0.95rem] font-semibold leading-tight text-[var(--sp-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {msg.nickname}
          </span>
          {msg.isAdmin && (
            <span className="inline-flex items-center rounded-full bg-[var(--sp-accent-teal)]/10 px-1.5 py-px text-[0.6rem] font-medium text-[var(--sp-accent-teal)] ring-1 ring-inset ring-[var(--sp-accent-teal)]/20">
              博主
            </span>
          )}
        </div>

        {/* 相对时间 + 位置 + 设备 */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <time
            className="text-xs text-[var(--sp-muted)]"
            style={{ fontFamily: 'var(--font-sans)' }}
            dateTime={msg.createdAt}
            title={fullDate(msg.createdAt)}
          >
            {relativeTime(msg.createdAt)}
          </time>

          {(msg.ipProvince || msg.ipCity) && (
            <span className="inline-flex items-center gap-1 text-[0.7rem] text-[var(--sp-muted)]/65">
              <MapPin size={10} className="text-[var(--sp-muted)]/45" />
              {[msg.ipProvince, msg.ipCity].filter(Boolean).join(' · ')}
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-[0.7rem] text-[var(--sp-muted)]/65">
            {msg.deviceType === 'mobile' ? (
              <Smartphone size={10} className="text-[var(--sp-muted)]/45" />
            ) : (
              <Monitor size={10} className="text-[var(--sp-muted)]/45" />
            )}
            {msg.deviceType === 'mobile' ? '手机' : '电脑'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── 回复行 ────────────────────────────────────────
function ReplyRow({
  reply,
  showReplyTo,
  onReply,
  isLast,
}: {
  reply: Message
  showReplyTo: boolean
  onReply?: (msg: Message) => void
  isLast?: boolean
}) {
  const parentName = reply.parent?.nickname

  return (
    <div className="relative flex items-start gap-2.5 py-2">
      {/* 树形连接线 */}
      <div className="relative flex flex-shrink-0 items-center justify-center" style={{ width: 20 }}>
        {/* 水平线 */}
        <div className="absolute left-0 right-0 h-px bg-[var(--sp-hairline)]/35" style={{ top: '50%' }} />
        {!isLast && (
          <div className="absolute bottom-0 left-0 top-0 w-px bg-[var(--sp-hairline)]/35" style={{ left: 0 }} />
        )}
      </div>

      <Avatar name={reply.nickname} size="sm" isAdmin={reply.isAdmin} />

      <div className="min-w-0 flex-1">
        {/* 昵称 + 标签 + 相对时间 */}
        <div
          className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[0.8rem]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <span className="font-medium text-[var(--sp-ink)]">{reply.nickname}</span>
          {reply.isAdmin && (
            <span className="rounded-full bg-[var(--sp-accent-teal)]/10 px-1.5 py-px text-[0.6rem] font-medium text-[var(--sp-accent-teal)] ring-1 ring-inset ring-[var(--sp-accent-teal)]/20">
              博主
            </span>
          )}
          {showReplyTo && parentName && (
            <span className="text-[var(--sp-muted)]/65">
              回复{' '}
              <span className="font-medium text-[var(--sp-ink)]/45">@{parentName}</span>
            </span>
          )}
          <span className="text-[var(--sp-muted)]/55">
            {relativeTime(reply.createdAt)}
          </span>
        </div>

        {/* 正文行：正文 (左) + 日期·回复 (右) */}
        <div className="mt-1 flex items-end justify-between gap-3">
          <p
            className="min-w-0 flex-1 text-sm leading-relaxed text-[var(--sp-ink)]/75"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {reply.content}
          </p>
          {/* 右侧：日期 → 回复 */}
          <div className="flex-shrink-0 flex items-center gap-1">
            <span
              className="text-[0.65rem] text-[var(--sp-muted)]/40 whitespace-nowrap"
              style={{ fontFamily: 'var(--font-sans)' }}
              title={fullDate(reply.createdAt)}
            >
              {fullDate(reply.createdAt)}
            </span>
            {onReply && (
              <button
                onClick={() => onReply(reply)}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.65rem] text-[var(--sp-muted)]/40 transition-all duration-200 hover:bg-[var(--sp-accent-teal)]/6 hover:text-[var(--sp-accent-teal)] active:scale-95"
                style={{ fontFamily: 'var(--font-sans)' }}
                aria-label={`回复 ${reply.nickname}`}
              >
                <CornerDownRight size={11} />
                回复
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 留言卡片 ──────────────────────────────────────
function MessageCard({
  msg,
  onReply,
}: {
  msg: Message
  onReply?: (msg: Message) => void
}) {
  const allReplies = flattenReplies(msg.replies || [])

  return (
    <article className="group/card glass-card transition-all duration-300 hover:-translate-y-0.5">
      {/* 主留言区域 */}
      <div className="p-5 sm:p-6">
        {/* 头像 + 元信息 */}
        <MessageMeta msg={msg} />

        {/* 留言正文行：正文 (左) + 日期·回复 (右) */}
        <div className="mt-4 flex items-end justify-between gap-4">
          <p
            className="min-w-0 flex-1 text-[0.95rem] leading-relaxed text-[var(--sp-ink)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {msg.content}
          </p>
          {/* 右侧：日期 → 回复 */}
          <div className="flex-shrink-0 flex items-center gap-1.5">
            <span
              className="text-[0.7rem] text-[var(--sp-muted)]/45 whitespace-nowrap"
              style={{ fontFamily: 'var(--font-sans)' }}
              title={fullDate(msg.createdAt)}
            >
              {fullDate(msg.createdAt)}
            </span>
            {onReply && (
              <button
                onClick={() => onReply(msg)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--sp-muted)]/45 transition-all duration-200 hover:bg-[var(--sp-accent-teal)]/8 hover:text-[var(--sp-accent-teal)] active:scale-95"
                style={{ fontFamily: 'var(--font-sans)' }}
                aria-label={`回复 ${msg.nickname}`}
              >
                <CornerDownRight size={12} />
                回复
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 回复列表 —— 树形嵌套 */}
      {allReplies.length > 0 && (
        <div className="border-t border-[var(--sp-hairline)]/25 bg-[var(--sp-surface)]/20 px-5 pb-4 pt-3 sm:px-6">
          <div className="ml-5 border-l border-[var(--sp-hairline)]/25 pl-4">
            {allReplies.map((reply, i) => (
              <ReplyRow
                key={reply.id}
                reply={reply}
                showReplyTo={reply.parentId !== msg.id}
                onReply={onReply}
                isLast={i === allReplies.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

// ── 骨架屏 ────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass-card animate-pulse p-5 sm:p-6">
      <div className="flex items-start gap-3.5">
        <div className="h-10 w-10 rounded-full bg-[var(--sp-hairline)]/35" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-24 rounded bg-[var(--sp-hairline)]/35" />
          <div className="h-3 w-40 rounded bg-[var(--sp-hairline)]/20" />
        </div>
      </div>
      {/* 正文 + 右侧占位 —— 匹配新布局 */}
      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-full rounded bg-[var(--sp-hairline)]/22" />
          <div className="h-4 w-3/4 rounded bg-[var(--sp-hairline)]/22" />
          <div className="h-4 w-1/2 rounded bg-[var(--sp-hairline)]/18" />
        </div>
        <div className="flex-shrink-0 flex items-center gap-1.5">
          <div className="h-3 w-16 rounded bg-[var(--sp-hairline)]/18" />
          <div className="h-5 w-10 rounded bg-[var(--sp-hairline)]/18" />
        </div>
      </div>
    </div>
  )
}

// ── 空状态 ────────────────────────────────────────
function EmptyState() {
  return (
    <div className="py-20 text-center">
      <div className="mx-auto flex max-w-xs flex-col items-center gap-5">
        {/* 装饰性图标 */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[var(--sp-accent-teal)]/5 blur-2xl" />
          <MessageCircle
            size={40}
            className="relative text-[var(--sp-hairline)]"
            strokeWidth={1}
          />
        </div>
        <div className="space-y-1.5">
          <p
            className="text-lg italic text-[var(--sp-muted)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            暂无留言
          </p>
          <p
            className="text-sm text-[var(--sp-muted)]/55"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            成为第一个留下足迹的人
          </p>
        </div>
        <button
          onClick={() =>
            document.getElementById('message-content')?.scrollIntoView({ behavior: 'smooth' })
          }
          className="mt-1 inline-flex items-center gap-2 rounded-full border border-[var(--sp-hairline)] px-5 py-2.5 text-sm text-[var(--sp-muted)] transition-all duration-200 hover:border-[var(--sp-accent-teal)]/50 hover:text-[var(--sp-accent-teal)] hover:shadow-[0_0_20px_-4px_var(--sp-accent-teal)]/8 active:scale-95"
          style={{ fontFamily: 'var(--font-sans)' }}
          aria-label="写下第一条留言"
        >
          <Sparkles size={14} />
          写下第一条留言
        </button>
      </div>
    </div>
  )
}

// ── 分页器 ────────────────────────────────────────
function Paginator({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  // 生成页码按钮（含省略号）
  const pages: (number | '...')[] = []
  const visible = 5 // 最多展示5个页码
  let start = Math.max(1, page - Math.floor(visible / 2))
  let end = Math.min(totalPages, start + visible - 1)
  if (end - start < visible - 1) start = Math.max(1, end - visible + 1)

  if (start > 1) pages.push(1)
  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPages - 1) pages.push('...')
  if (end < totalPages) pages.push(totalPages)

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-1"
      aria-label="分页导航"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* 上一页 */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2.5 text-sm text-[var(--sp-muted)] transition-all duration-200 hover:bg-[var(--sp-surface)] hover:text-[var(--sp-ink)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-20"
        aria-label="上一页"
      >
        <ChevronLeft size={15} />
        <span className="hidden sm:inline">上一页</span>
      </button>

      {/* 页码 */}
      <div className="flex items-center gap-0.5">
        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-[var(--sp-muted)]/45"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`h-9 min-w-[2.25rem] rounded-lg px-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
                p === page
                  ? 'bg-[var(--sp-ink)] text-[var(--sp-ground)] shadow-sm'
                  : 'text-[var(--sp-muted)] hover:bg-[var(--sp-surface)] hover:text-[var(--sp-ink)]'
              }`}
              aria-label={`第 ${p} 页`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}
      </div>

      {/* 下一页 */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2.5 text-sm text-[var(--sp-muted)] transition-all duration-200 hover:bg-[var(--sp-surface)] hover:text-[var(--sp-ink)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-20"
        aria-label="下一页"
      >
        <span className="hidden sm:inline">下一页</span>
        <ChevronRight size={15} />
      </button>
    </nav>
  )
}

// ══════════════════════════════════════════════════
// 主组件
// ══════════════════════════════════════════════════
export function MessageList({
  refreshKey,
  onReply,
}: {
  refreshKey?: number
  onReply?: (msg: Message) => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const limit = PAGINATION.guestbookPerPage
  const totalPages = Math.ceil(total / limit)

  const fetchMessages = useCallback(
    async (p: number) => {
      setLoading(true)
      try {
        const res = await fetch(`/api/guestbook?page=${p}&limit=${limit}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setMessages(data.messages)
        setTotal(data.total)
      } catch {
        // 静默处理
      } finally {
        setLoading(false)
      }
    },
    [limit],
  )

  useEffect(() => {
    fetchMessages(page)
  }, [page, fetchMessages, refreshKey])

  // ── 加载态：骨架屏 ──
  if (loading) {
    return (
      <section>
        <div className="mb-8 text-center">
          <h2
            className="font-display text-xl font-bold text-[var(--sp-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            访客留言
          </h2>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    )
  }

  // ── 空状态 ──
  if (messages.length === 0) {
    return (
      <section>
        <EmptyState />
      </section>
    )
  }

  // ── 正常列表 ──
  return (
    <section>
      {/* 区块标题 */}
      <div className="mb-8 text-center">
        <h2
          className="font-display text-xl font-bold tracking-tight text-[var(--sp-ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          访客留言
        </h2>
        <p
          className="mt-1.5 font-serif text-sm italic text-[var(--sp-muted)]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {total} 条留言
        </p>
      </div>

      {/* 卡片列表 —— 交错入场 */}
      <StaggeredReveal className="space-y-3">
        {messages.map((msg) => (
          <StaggeredItem key={msg.id}>
            <MessageCard msg={msg} onReply={onReply} />
          </StaggeredItem>
        ))}
      </StaggeredReveal>

      {/* 分页 */}
      <Paginator page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  )
}
