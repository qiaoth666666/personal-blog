'use client'

import { motion } from 'framer-motion'
import { FileText, Package, MessageSquare, Calendar } from 'lucide-react'
import { StaggeredReveal, StaggeredItem } from '@/components/effects/staggered-reveal'

interface StatItem {
  label: string
  value: string | number
  icon: React.ReactNode
}

/**
 * 站点统计 —— 书卷式数字排版
 *
 * 展示文章数、软库数、留言数、建站天数
 * 像精装书版权页的统计数据
 */
export function SiteStats({
  articleCount,
  softwareCount,
  messageCount,
  siteDays,
}: {
  articleCount: number
  softwareCount: number
  messageCount: number
  siteDays: number
}) {
  const stats: StatItem[] = [
    {
      label: '文章',
      value: articleCount,
      icon: <FileText size={20} strokeWidth={1.5} />,
    },
    {
      label: '软库',
      value: softwareCount,
      icon: <Package size={20} strokeWidth={1.5} />,
    },
    {
      label: '留言',
      value: messageCount,
      icon: <MessageSquare size={20} strokeWidth={1.5} />,
    },
    {
      label: '建站天数',
      value: siteDays,
      icon: <Calendar size={20} strokeWidth={1.5} />,
    },
  ]

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      {/* 小标题 */}
      <motion.p
        className="mb-10 text-center font-sans text-xs uppercase tracking-[0.2em] text-[var(--sp-muted)]"
        style={{ fontFamily: 'var(--font-sans)' }}
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        站点简洁
      </motion.p>

      <StaggeredReveal className="grid grid-cols-2 gap-0 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <StaggeredItem key={stat.label}>
            <div
              className={`flex flex-col items-center gap-3 px-4 py-6
                ${i < stats.length - 1 ? 'border-r-0 sm:border-r border-[var(--sp-hairline)]' : ''}
              `}
            >
              {/* 图标 */}
              <div className="text-[var(--sp-muted)]">{stat.icon}</div>

              {/* 数字 */}
              <span
                className="font-display text-4xl font-bold tabular-nums leading-none text-[var(--sp-ink)] sm:text-5xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {stat.value}
              </span>

              {/* 标签 */}
              <span
                className="font-sans text-xs tracking-wider text-[var(--sp-muted)]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {stat.label}
              </span>
            </div>
          </StaggeredItem>
        ))}
      </StaggeredReveal>

      {/* 底部分隔线 */}
      <div className="mx-auto mt-12 max-w-xs border-t border-[var(--sp-hairline)]" />
    </section>
  )
}
