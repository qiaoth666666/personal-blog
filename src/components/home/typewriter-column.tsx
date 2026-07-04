'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

interface HeroTagImage {
  tag: string
  imageUrl: string | null
}

interface TypewriterColumnProps {
  bgPhoto: string | null
  heroTagImages: HeroTagImage[]
  name: string
  heroIntro?: string | null
}

/**
 * 打印机式逐字输出列
 *
 * 当背景图切换时，找到对应的标签文字，逐字打印。
 * 无匹配标签时回退到 name + heroIntro。
 */
export function TypewriterColumn({
  bgPhoto,
  heroTagImages,
  name,
  heroIntro,
}: TypewriterColumnProps) {
  // 找到当前照片对应的标签文字
  const currentTag = useMemo(() => {
    if (!bgPhoto) return null
    const entry = heroTagImages.find((h) => h.imageUrl === bgPhoto)
    return entry?.tag ?? null
  }, [bgPhoto, heroTagImages])

  // 是否启用打字机效果（有标签时启用，否则直接显示 name）
  const hasTag = currentTag !== null

  // ---- 打字机状态 ----
  const [typedText, setTypedText] = useState('')
  const abortRef = useRef(0)

  useEffect(() => {
    if (!currentTag) {
      setTypedText('')
      return
    }

    // 递增 key 以中断上一次打字
    abortRef.current += 1
    const key = abortRef.current
    setTypedText('')

    let i = 0
    const total = currentTag.length
    const interval = setInterval(() => {
      if (abortRef.current !== key) {
        clearInterval(interval)
        return
      }
      i++
      setTypedText(currentTag.slice(0, i))
      if (i >= total) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [currentTag])

  // ---- 动画 key（文本变化时重新触发入场） ----
  const textKey = currentTag ?? 'default'

  return (
    <div className="flex flex-col justify-center">
      {hasTag ? (
        <>
          {/* 标签文字 —— 打印机逐字输出 */}
          <motion.div
            key={textKey}
            className="min-h-[1.15em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h1
              className="font-display font-bold italic leading-[1.15] tracking-[-0.01em] text-[var(--sp-ink)]"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              }}
            >
              {typedText}
            </h1>
          </motion.div>

          {/* 副标题 —— 固定 */}
          <motion.p
            className="mt-6 max-w-md font-serif text-lg leading-relaxed text-[var(--sp-muted)] md:text-xl"
            style={{ fontFamily: 'var(--font-serif)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {heroIntro || '每一张照片，都是一段故事'}
          </motion.p>
        </>
      ) : (
        <>
          {/* 无标签时 —— 直接显示 name */}
          <motion.h1
            className="font-display font-bold italic leading-[1.02] tracking-[-0.02em] text-[var(--sp-ink)]"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3.5rem, 8vw, 7rem)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {name}
          </motion.h1>

          {heroIntro && (
            <motion.p
              className="mt-7 max-w-lg font-serif text-lg leading-relaxed text-[var(--sp-muted)] md:text-xl"
              style={{ fontFamily: 'var(--font-serif)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              {heroIntro}
            </motion.p>
          )}
        </>
      )}

      {/* 向下指示 */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--sp-hairline)]/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--sp-muted)]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <span>向下探索</span>
          <ArrowDown size={12} />
        </motion.div>
      </motion.div>
    </div>
  )
}
