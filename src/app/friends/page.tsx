import { query } from '@/lib/db'
import type { FriendLink } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { cache } from '@/lib/cache'
import type { Metadata } from 'next'
import { PageTransition } from '@/components/effects/page-transition'
import { TextileSection } from '@/components/effects/textile-overlay'
import { FriendLinkList } from '@/components/friends/friend-link-list'
import { FriendApplyForm } from '@/components/friends/friend-apply-form'
import { Link2, Handshake } from 'lucide-react'

export const metadata: Metadata = {
  title: '友链',
  description: '友情链接 —— 惺惺相惜、互相温暖的数字邻居',
}

export default async function FriendsPage() {
  let friends: Array<{
    id: number
    name: string
    url: string
    description: string | null
    iconUrl: string | null
    sortOrder: number
  }> = []

  let friendCount = 0

  try {
    const allApproved = await cache('friends:list', 120, () =>
      query<Pick<FriendLink, 'id' | 'name' | 'url' | 'description' | 'iconUrl' | 'sortOrder'> & RowDataPacket>(
        'SELECT id, name, url, description, iconUrl, sortOrder FROM `FriendLink` WHERE status = ? ORDER BY sortOrder ASC',
        ['APPROVED'],
      )
    )
    friends = allApproved
    friendCount = allApproved.length
  } catch {
    // db unavailable → show empty state
  }

  return (
    <PageTransition>
      {/* ═══ Hero —— 使用 TextileSection 确保与导航栏背景融为一体 ═══ */}
      <TextileSection className="py-16 sm:py-24" opacity={0.25}>
        <div className="mx-auto max-w-2xl px-6">
          <header className="text-center">
            {/* 装饰性顶线 */}
            <div className="mx-auto mb-6 h-px w-16 bg-gradient-to-r from-transparent via-[var(--sp-accent-teal)]/40 to-transparent" />

            {/* 图标 */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <Handshake size={32} className="text-[var(--sp-accent-teal)]" strokeWidth={1} />
            </div>

            {/* 标题 */}
            <h1
              className="font-display text-[clamp(2.25rem,5vw,3rem)] font-bold italic tracking-[-0.02em] text-[var(--sp-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              友链
            </h1>

            {/* 副标题 */}
            <p
              className="mx-auto mt-5 max-w-lg font-serif text-lg italic leading-relaxed text-[var(--sp-muted)] md:text-xl"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              数字花园里的邻居们，
              <br />
              互相照亮、彼此珍藏。
            </p>

            {/* 友链数量 */}
            {friendCount > 0 && (
              <p
                className="mt-3 text-xs tracking-widest text-[var(--sp-muted)]/50 uppercase"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {friendCount} 位友邻
              </p>
            )}

            {/* 装饰性底线 */}
            <div className="mx-auto mt-7 h-px w-16 bg-gradient-to-r from-transparent via-[var(--sp-accent-sienna)]/30 to-transparent" />
          </header>
        </div>
      </TextileSection>

      {/* ═══ 友链列表 ═══ */}
      <section className="mx-auto max-w-5xl px-6 pb-12">
        {friends.length > 0 ? (
          <>
            {/* 装饰分隔 */}
            <div className="mb-10 flex items-center gap-4">
              <div className="flex-1 border-t border-[var(--sp-hairline)]/60" />
              <Link2
                size={14}
                strokeWidth={1.5}
                className="shrink-0 text-[var(--sp-muted)]/40"
              />
              <div className="flex-1 border-t border-[var(--sp-hairline)]/60" />
            </div>

            <FriendLinkList friends={friends} />
          </>
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
              <Link2 size={28} className="text-[var(--sp-hairline)]" strokeWidth={1} />
            </div>
            <p
              className="text-sm text-[var(--sp-muted)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              暂无友链，欢迎成为第一位友邻。
            </p>
          </div>
        )}
      </section>

      {/* ═══ 友链申请 ═══ */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        {/* 装饰分隔 */}
        <div className="mb-12 flex items-center gap-4">
          <div className="flex-1 border-t border-[var(--sp-hairline)]/60" />
          <span
            className="shrink-0 text-xs tracking-widest text-[var(--sp-muted)]/40"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            JOIN
          </span>
          <div className="flex-1 border-t border-[var(--sp-hairline)]/60" />
        </div>

        {/* 申请说明 */}
        <div className="mb-8 text-center">
          <h2
            className="font-display text-xl font-bold text-[var(--sp-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            交换友链
          </h2>
          <p
            className="mt-2 text-sm leading-relaxed text-[var(--sp-muted)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            想要互相添加友链？填写下方表单提交申请，
            <br className="hidden sm:block" />
            我会在审核通过后将你的站点加入友链列表。
          </p>
        </div>

        {/* 申请表单 */}
        <FriendApplyForm />
      </section>
    </PageTransition>
  )
}
