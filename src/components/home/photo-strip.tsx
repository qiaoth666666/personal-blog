'use client'

import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'

interface PhotoStripProps {
  images: string[]
}

/**
 * 摄影横带 —— 横向自动滚动 v2
 *
 * 增强: 装饰标签 + 悬浮微缩放 + 渐变边缘遮罩
 */
export function PhotoStrip({ images }: PhotoStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  const displayImages = images.length > 0
    ? images
    : Array.from({ length: 6 }, (_, i) => `placeholder-${i}`)

  return (
    <section
      className="relative overflow-hidden border-b border-[var(--sp-hairline)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 左侧渐变遮罩 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--sp-ground)]/80 to-transparent" />
      {/* 右侧渐变遮罩 */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--sp-ground)]/80 to-transparent" />

      {/* 标签 */}
      <div className="absolute top-0 left-0 z-20">
        <div className="flex items-center gap-2 bg-[var(--sp-ground)]/85 backdrop-blur-sm px-4 py-2.5 border-b border-r border-[var(--sp-hairline)]/40">
          <Camera size={14} className="text-[var(--sp-accent-sienna)]" />
          <span
            className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--sp-muted)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            影集
          </span>
        </div>
      </div>

      {/* 滚动容器 */}
      <div
        ref={scrollRef}
        className="flex"
        style={{
          animation: `photo-scroll 40s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {[...displayImages, ...displayImages].map((src, i) => (
          <div
            key={i}
            className="h-48 w-64 shrink-0 overflow-hidden border-r border-[var(--sp-hairline)] md:h-64 md:w-80"
          >
            {src.startsWith('placeholder') ? (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  background: `hsl(${(i * 50 + 30) % 360}, 10%, ${88 + (i % 3) * 3}%)`,
                }}
              >
                <span
                  className="text-xs text-[var(--sp-muted)]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  图片 {i + 1}
                </span>
              </div>
            ) : (
              <img
                src={src}
                alt={`照片 ${i + 1}`}
                className="h-full w-full object-cover transition-all duration-[2s] hover:scale-105 hover:brightness-105"
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes photo-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
