'use client'

import Link from 'next/link'
import { FileText, Package, BookOpen, MessageSquare, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface NavCardData {
  href: string
  label: string
  description: string
  icon: React.ReactNode
  accentBar: string
  accentLabel: string
}

const NAV_CARDS: NavCardData[] = [
  {
    href: '/articles',
    label: '文章',
    description: '技术思考、生活随笔与读书笔记',
    icon: <BookOpen size={24} strokeWidth={1.5} />,
    accentBar: 'var(--sp-accent-teal)',
    accentLabel: '阅读',
  },
  {
    href: '/resume',
    label: '简历',
    description: '教育背景、技能与项目经历',
    icon: <FileText size={24} strokeWidth={1.5} />,
    accentBar: 'var(--sp-accent-sienna)',
    accentLabel: '关于我',
  },
  {
    href: '/software',
    label: '软库',
    description: '精选免费实用软件资源合集',
    icon: <Package size={24} strokeWidth={1.5} />,
    accentBar: 'var(--sp-accent-blue)',
    accentLabel: '工具',
  },
  {
    href: '/guestbook',
    label: '留言板',
    description: '留下足迹，每一句都是温暖的遇见',
    icon: <MessageSquare size={24} strokeWidth={1.5} />,
    accentBar: 'var(--sp-accent-teal)',
    accentLabel: '互动',
  },
]

/**
 * 导航卡片 —— 单行 4 列等宽布局
 *
 * 桌面端 4 列并排，平板 2×2，移动端纵向堆叠。
 * 每张卡片顶部带对应色条，悬浮时展开。
 */
export function NavCards() {
  return (
    <section className="relative z-10 bg-[var(--sp-ground)]">
      <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
      {/* Section 标题 */}
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <span
          className="mb-3 inline-block text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--sp-muted)]/60"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Explore
        </span>
        <h2
          className="font-display text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-[-0.02em] text-[var(--sp-ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          探索
        </h2>
      </motion.div>

      {/* 单行 4 列 */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {NAV_CARDS.map((card, i) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{
              duration: 0.6,
              delay: i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Link href={card.href} className="no-underline group block h-full">
              <div className="relative flex h-full flex-col overflow-hidden border border-[var(--sp-hairline)]/50 bg-[var(--sp-surface)] p-6 transition-all duration-500 hover:border-[var(--sp-hairline)] hover:shadow-lg hover:shadow-black/[0.04] hover:-translate-y-0.5">
                {/* 顶部色条 */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ background: card.accentBar }}
                />

                {/* 图标 */}
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-sm"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${card.accentBar} 10%, transparent)`,
                    color: card.accentBar,
                  }}
                >
                  {card.icon}
                </div>

                {/* 标签 */}
                <span
                  className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--sp-muted)]/50"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {card.accentLabel}
                </span>

                {/* 标题 */}
                <h3
                  className="font-display text-lg font-bold tracking-[-0.01em] text-[var(--sp-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {card.label}
                </h3>

                {/* 描述 */}
                <p
                  className="mt-1.5 text-[13px] leading-relaxed text-[var(--sp-muted)]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {card.description}
                </p>

                {/* 底部箭头 */}
                <div className="mt-auto flex items-center gap-1.5 pt-5">
                  <ArrowRight
                    size={13}
                    className="text-[var(--sp-muted)]/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--sp-ink)]"
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  )
}
