'use client'

import { motion } from 'framer-motion'
import { FriendLinkCard } from '@/components/friends/friend-link-card'
import { Link2 } from 'lucide-react'

interface FriendLinkData {
  id: number
  name: string
  url: string
  description: string | null
  iconUrl: string | null
  sortOrder: number
}

/**
 * 友链网格列表 —— 均等卡片
 *
 * - 响应式网格：1 列(手机) → 2 列(平板) → 3 列(桌面) → 4 列(宽屏)
 * - 所有卡片完全等大，错落入场
 * - 空状态：极简文段排版
 */
export function FriendLinkList({ friends }: { friends: FriendLinkData[] }) {
  if (friends.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {friends.map((friend, i) => (
        <FriendLinkCard key={friend.id} friend={friend} index={i} />
      ))}
    </div>
  )
}

/**
 * 空状态 —— 书卷气
 *
 * 不只是「暂无友链」的文字，而是有叙事感的版式：
 * 一条极细的线、一行衬线体的引语、一个符号化的图标。
 */
function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center py-20 text-center"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* 装饰顶线 */}
      <div className="mx-auto mb-8 h-px w-12 bg-gradient-to-r from-transparent via-[var(--sp-hairline)] to-transparent" />

      {/* 图标 */}
      <div className="mb-6 flex h-12 w-12 items-center justify-center">
        <Link2 size={24} className="text-[var(--sp-hairline)]" strokeWidth={1} />
      </div>

      {/* 引语 */}
      <p
        className="font-display text-lg italic text-[var(--sp-muted)]/60"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        虚位以待
      </p>

      <p
        className="mt-3 max-w-xs text-[13px] leading-relaxed text-[var(--sp-muted)]/35"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        这片数字花园尚在等待它的第一位友邻。
        <br />
        若你也有自己的花园，不妨递来一封邀请。
      </p>

      {/* 装饰底线 */}
      <div className="mx-auto mt-8 h-px w-12 bg-gradient-to-r from-transparent via-[var(--sp-hairline)] to-transparent" />
    </motion.div>
  )
}
