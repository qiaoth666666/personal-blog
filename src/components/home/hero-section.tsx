'use client'

import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AngledStack } from '@/components/effects/angled-stack'
import { TypewriterColumn } from '@/components/home/typewriter-column'
import { SITE_CONFIG } from '@/lib/constants'

interface HeroTagImage {
  tag: string
  imageUrl: string | null
}

interface HeroSectionProps {
  avatarUrl?: string | null
  name?: string
  tagline?: string
  status?: string | null
  location?: string | null
  heroIntro?: string | null
  stackPhotos?: string[]
  heroTagImages?: HeroTagImage[]
}

/**
 * Hero —— 左文 + 右叠图/标签
 *
 * v2: 极光渐变背景 + 增强排版层次 + 微交互
 * 左: name / title · location · [status badge] / intro / social links / ↓
 * 右: 叠图（主）+ 标签垂直排列
 *
 * 不悬停时叠图自动轮播；悬停标签时暂停轮播并切换到对应图片
 */
export function HeroSection({
  avatarUrl,
  name = SITE_CONFIG.author,
  tagline = SITE_CONFIG.description,
  status,
  location,
  heroIntro,
  stackPhotos = [],
  heroTagImages = [],
}: HeroSectionProps) {
  const tags = useMemo(() => heroTagImages.map((h) => h.tag), [heroTagImages])

  const defaultStackPhotos = useMemo(() => {
    const tagPhotos = heroTagImages.filter((h) => h.imageUrl).map((h) => h.imageUrl!)
    return tagPhotos.length > 0 ? tagPhotos : stackPhotos
  }, [heroTagImages, stackPhotos])

  const tagImageMap = useMemo(() => {
    const map = new Map<string, string>()
    heroTagImages.forEach((h) => {
      if (h.imageUrl) map.set(h.tag, h.imageUrl)
    })
    return map
  }, [heroTagImages])

  const [hoveredTag, setHoveredTag] = useState<string | null>(null)
  const [bgPhoto, setBgPhoto] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const displayPhotos = useMemo(() => {
    if (hoveredTag) {
      const img = tagImageMap.get(hoveredTag)
      if (img) {
        const rest = defaultStackPhotos.filter((u) => u !== img)
        return [img, ...rest]
      }
    }
    return defaultStackPhotos
  }, [hoveredTag, defaultStackPhotos, tagImageMap])

  return (
    <section className="relative flex min-h-screen items-center">
      {/* 全屏模糊图 — Portal 到 body 下，绕过 PageTransition stacking context */}
      {mounted &&
        createPortal(
          <div
            className="pointer-events-none fixed overflow-hidden"
            style={{ zIndex: -1, left: 0, top: 0, width: '100vw', height: '100vh' }}
          >
            {bgPhoto ? (
              <AnimatePresence>
                <motion.img
                  key={bgPhoto}
                  src={bgPhoto}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ filter: 'blur(12px) saturate(1.3)', transform: 'scale(1.08)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                />
              </AnimatePresence>
            ) : (
              <div className="absolute inset-0 bg-[var(--sp-ground)]" />
            )}
            {/* 底部渐变 —— 平滑过渡到摄影集 */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--sp-ground)]/0 via-[var(--sp-ground)]/0 to-[var(--sp-ground)]" />
          </div>,
          document.body,
        )}

      {/* 内容 */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-[1fr_560px]">
        {/* ============ 左栏：打印机式逐字输出 ============ */}
        <TypewriterColumn
          bgPhoto={bgPhoto}
          heroTagImages={heroTagImages}
          name={name}
          heroIntro={heroIntro}
        />

        {/* ============ 右栏：叠图（上）+ 竖向标签（下） ============ */}
        <motion.div
          className="hidden flex-col lg:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* 叠图——宝丽来斜叠，左下角锚点扇出 */}
          <div className="-mt-6 ml-4">
            <AngledStack
              photos={displayPhotos}
              interval={3}
              paused={hoveredTag !== null}
              onPhotoChange={setBgPhoto}
            />
          </div>

          {/* 竖向标签 */}
          {tags.length > 0 && (
            <div className="mt-10 flex justify-center gap-6">
              {tags.map((tag, i) => {
                const sizes = ['text-3xl', 'text-4xl', 'text-2xl', 'text-5xl', 'text-3xl']
                const mt = [0, 12, -4, 22, 6][i % 5]
                const weights = ['font-bold', 'font-semibold', 'font-normal', 'font-bold', 'font-medium']
                const hasImage = tagImageMap.has(tag)
                const isHovered = hoveredTag === tag

                return (
                  <span
                    key={tag}
                    className={`cursor-pointer select-none tracking-wider transition-all duration-400 ${sizes[i % sizes.length]} ${weights[i % weights.length]}`}
                    style={{
                      fontFamily: 'var(--font-display)',
                      writingMode: 'vertical-rl',
                      marginTop: `${mt}px`,
                      lineHeight: 1.25,
                      color: isHovered
                        ? 'var(--sp-accent-teal)'
                        : 'var(--sp-ink)',
                      textShadow: isHovered ? '0 0 24px rgba(30, 94, 107, 0.18)' : 'none',
                    }}
                    onMouseEnter={() => {
                      if (hasImage) setHoveredTag(tag)
                    }}
                    onMouseLeave={() => setHoveredTag(null)}
                  >
                    {tag}
                  </span>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
