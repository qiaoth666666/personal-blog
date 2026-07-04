'use client'

import { useState, useCallback } from 'react'
import { PageTransition } from '@/components/effects/page-transition'
import { TextileSection } from '@/components/effects/textile-overlay'
import { MessageForm } from '@/components/guestbook/message-form'
import { MessageList } from '@/components/guestbook/message-list'

interface ReplyTarget {
  id: number
  nickname: string
}

export default function GuestbookPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null)

  const handleSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const handleReply = useCallback((msg: { id: number; nickname: string }) => {
    setReplyTo({ id: msg.id, nickname: msg.nickname })
    const el = document.getElementById('guestbook-form')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const handleCancelReply = useCallback(() => {
    setReplyTo(null)
  }, [])

  return (
    <PageTransition>
      <TextileSection className="py-12 sm:py-16 lg:py-20" opacity={0.25}>
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {/* ═══ 页首 —— 精致的标题区 ═══ */}
          <header className="mb-12 text-center sm:mb-16">
            {/* 装饰性顶线 */}
            <div className="mx-auto mb-6 h-px w-16 bg-gradient-to-r from-transparent via-[var(--sp-accent-teal)]/40 to-transparent" />

            <h1
              className="font-display text-h1 font-bold tracking-tight text-[var(--sp-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              留言板
            </h1>

            <p
              className="mt-4 font-serif text-base italic leading-relaxed text-[var(--sp-muted)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              温润书卷 · 以字会友
            </p>

            {/* 装饰性底线 */}
            <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-[var(--sp-accent-sienna)]/30 to-transparent" />
          </header>

          {/* ═══ 留言表单 ═══ */}
          <div id="guestbook-form" className="mb-16 scroll-mt-24 sm:mb-20">
            <MessageForm
              onSuccess={handleSuccess}
              replyTo={replyTo}
              onCancelReply={handleCancelReply}
            />
          </div>

          {/* ═══ 装饰分隔 ═══ */}
          <div className="mb-12 flex items-center gap-4 sm:mb-16">
            <div className="flex-1 border-t border-[var(--sp-hairline)]/60" />
            <span
              className="flex-shrink-0 text-xs tracking-widest text-[var(--sp-muted)]/40"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              MESSAGES
            </span>
            <div className="flex-1 border-t border-[var(--sp-hairline)]/60" />
          </div>

          {/* ═══ 留言列表 ═══ */}
          <MessageList refreshKey={refreshKey} onReply={handleReply} />
        </div>
      </TextileSection>
    </PageTransition>
  )
}
