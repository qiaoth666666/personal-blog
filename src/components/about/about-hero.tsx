'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { KenBurns } from '@/components/effects/ken-burns'
import { TextileOverlay } from '@/components/effects/textile-overlay'
import { User } from 'lucide-react'

interface AboutHeroData {
  displayName: string | null
  tagline: string | null
  avatarUrl: string | null
}

/**
 * 关于页 Hero —— 大幅头像 + 姓名 + 头衔
 * 数据来源于 AboutConfig
 */
export function AboutHero({ config }: { config: AboutHeroData | null }) {
  const name = config?.displayName || '站长'
  const tagline = config?.tagline || '开发者 · 写作者 · 音乐爱好者'

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 bg-[var(--sp-ground)]">
        <KenBurns>
          <div className="absolute inset-0 bg-[var(--sp-surface)]" />
        </KenBurns>
        <TextileOverlay opacity={0.3} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--sp-ground)]" />
      </div>

      {/* 内容 */}
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-20 text-center">
        {/* 头像 */}
        <motion.div
          className="mx-auto mb-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {config?.avatarUrl ? (
            <div className="mx-auto h-40 w-40 overflow-hidden rounded-full shadow-book md:h-56 md:w-56">
              <Image
                src={config.avatarUrl}
                alt={name}
                width={224}
                height={224}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          ) : (
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-[var(--sp-surface)] shadow-book md:h-56 md:w-56">
              <User size={72} className="text-[var(--sp-hairline)]" strokeWidth={1} />
            </div>
          )}
        </motion.div>

        {/* 姓名 */}
        <motion.h1
          className="font-display text-display font-bold italic leading-[1.1] tracking-[-0.015em] text-[var(--sp-ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          {name}
        </motion.h1>

        {/* 头衔 */}
        <motion.p
          className="mx-auto mt-6 max-w-lg font-serif text-xl italic leading-relaxed text-[var(--sp-muted)] md:text-2xl"
          style={{ fontFamily: 'var(--font-serif)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        >
          {tagline}
        </motion.p>
      </div>
    </section>
  )
}
