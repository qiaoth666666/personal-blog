'use client'

import { motion } from 'framer-motion'

export function MusicHero() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="pt-10 pb-8 md:pt-14 md:pb-10"
    >
      <div className="mx-auto max-w-2xl px-6 text-center">
        {/* 标题 */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl text-[var(--sp-ink)]"
          style={{
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.04em',
          }}
        >
          拾 曲
        </motion.h1>

        {/* 副标题 */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-4 text-base italic text-[var(--sp-muted)]/70 md:text-lg"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          拾取散落在时光里的旋律
        </motion.p>

        {/* 装饰线 */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 h-px w-16 bg-[var(--sp-hairline)]"
        />
      </div>
    </motion.section>
  )
}
