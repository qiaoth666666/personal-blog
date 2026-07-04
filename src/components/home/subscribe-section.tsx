'use client'

import { useState } from 'react'
import { BellRing } from 'lucide-react'
import { motion } from 'framer-motion'
import { SubscribeDialog } from '@/components/subscribe/subscribe-dialog'

/**
 * 首页订阅 CTA 区块
 *
 * 渲染一条温润的订阅邀请，点击后打开订阅弹窗。
 * Stripe Press 风格 — 克制、优雅，不抢眼但清晰可辨。
 */
export function SubscribeSection() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <section className="relative z-10 bg-[var(--sp-ground)]">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <motion.div
            className="mx-auto max-w-lg border border-[var(--sp-hairline)]/60 bg-[var(--sp-surface)] p-8 sm:p-10 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* 图标 */}
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-[var(--sp-hairline)]">
              <BellRing size={20} strokeWidth={1.5} className="text-[var(--sp-ink)]" />
            </div>

            {/* 标题 */}
            <h2
              className="font-display text-xl font-bold tracking-[-0.01em] text-[var(--sp-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              订阅更新
            </h2>

            {/* 描述 */}
            <p
              className="mt-3 text-[14px] leading-relaxed text-[var(--sp-muted)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              新的文章和软件资源会第一时间发送到你的邮箱。
              安静、克制，不会频繁打扰。
            </p>

            {/* CTA 按钮 */}
            <button
              onClick={() => setDialogOpen(true)}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-6 py-2.5 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <BellRing size={14} />
              订阅更新
            </button>
          </motion.div>
        </div>
      </section>

      {/* 订阅弹窗 */}
      <SubscribeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  )
}
