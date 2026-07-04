'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ExternalLink, ArrowRight } from 'lucide-react'

interface FriendLinkData {
  id: number
  name: string
  url: string
  description: string | null
}

/**
 * 关于页友链速览 —— 紧凑列表
 *
 * 在关于页底部展示 6 条精选友链，
 * 引导用户去完整友链页面浏览
 */
export function AboutFriends({ friends }: { friends: FriendLinkData[] }) {
  if (friends.length === 0) return null

  return (
    <section className="mx-auto max-w-2xl px-6 pb-20">
      {/* 分隔线 */}
      <div className="mx-auto mt-14 max-w-xs border-t border-[var(--sp-hairline)]" />

      <motion.div
        className="mt-14"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* 小标题 */}
        <div className="mb-8 flex items-center justify-between">
          <p
            className="font-sans text-xs uppercase tracking-[0.2em] text-[var(--sp-muted)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            友链速览
          </p>
          <Link
            href="/friends"
            className="inline-flex items-center gap-1 font-sans text-xs text-[var(--sp-accent-teal)] no-underline hover:opacity-70 transition-opacity"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            查看全部
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* 友链网格 —— 小卡片 */}
        <div className="grid gap-3 sm:grid-cols-3">
          {friends.slice(0, 6).map((friend, i) => (
            <motion.a
              key={friend.id}
              href={friend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-1.5 border border-[var(--sp-hairline)] p-4 no-underline transition-colors hover:border-[var(--sp-accent-teal)] hover:bg-[var(--sp-surface)]/60"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <span
                className="flex items-center gap-1.5 font-display text-sm font-semibold text-[var(--sp-ink)] group-hover:text-[var(--sp-accent-teal)] transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {friend.name}
                <ExternalLink size={11} className="text-[var(--sp-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </span>
              {friend.description && (
                <span
                  className="text-[11px] leading-relaxed text-[var(--sp-muted)] line-clamp-1"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {friend.description}
                </span>
              )}
            </motion.a>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
