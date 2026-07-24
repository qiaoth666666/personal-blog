'use client'

import { motion } from 'framer-motion'

export function MusicHero() {
  return (
    <motion.section
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className="pt-10 pb-8 md:pt-14 md:pb-10"
    >
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h1
          className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl text-[var(--sp-ink)]"
          style={{
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.04em',
          }}
        >
          歌曲墙
        </h1>

        <p
          className="mt-4 text-base italic text-[var(--sp-muted)]/70 md:text-lg"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          拾取散落在时光里的旋律
        </p>

        <div className="mx-auto mt-6 h-px w-16 bg-[var(--sp-hairline)]" />
      </div>
    </motion.section>
  )
}
