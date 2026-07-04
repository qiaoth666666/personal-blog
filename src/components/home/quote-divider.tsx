'use client'

import { motion } from 'framer-motion'

interface QuoteDividerProps {
  quote?: string
  author?: string
}

/**
 * 装饰引文分隔 —— v2
 *
 * 增强: 渐变光晕背景 + 双引号装饰 + 淡入动画
 */
export function QuoteDivider({
  quote = '每一个不曾起舞的日子，都是对生命的辜负',
  author = '尼采',
}: QuoteDividerProps) {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* 背景光斑 —— 多层渐变 */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* 中心暖光 */}
        <div
          className="absolute top-1/2 left-1/2 h-[50vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(ellipse, var(--sp-surface) 0%, transparent 70%)',
            opacity: 0.6,
          }}
        />
        {/* 边缘极光 */}
        <div
          className="absolute top-0 right-0 h-[40vh] w-[40vw] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, var(--sp-accent-teal) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 h-[30vh] w-[30vw] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, var(--sp-accent-sienna) 0%, transparent 70%)',
          }}
        />
      </div>

      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* 上引号装饰 */}
        <div
          className="mb-8 text-8xl font-display leading-none text-[var(--sp-hairline)]/30 select-none"
          style={{ fontFamily: 'var(--font-display)' }}
          aria-hidden="true"
        >
          &ldquo;
        </div>

        {/* 引文 */}
        <p
          className="font-display text-4xl font-bold italic leading-tight tracking-[-0.01em] text-[var(--sp-hairline)] md:text-6xl lg:text-7xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {quote}
        </p>

        {/* 下引号 + 作者 */}
        <div className="mt-6 flex flex-col items-center gap-1">
          <div
            className="text-6xl font-display leading-none text-[var(--sp-hairline)]/30 select-none"
            style={{ fontFamily: 'var(--font-display)' }}
            aria-hidden="true"
          >
            &rdquo;
          </div>
          <p
            className="font-serif text-base italic text-[var(--sp-muted)]/50"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            —— {author}
          </p>
        </div>
      </motion.div>
    </section>
  )
}
