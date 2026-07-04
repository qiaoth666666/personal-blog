'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

interface AngledStackProps {
  photos: string[]
  /** 自动轮播间隔（秒），0 = 禁用 */
  interval?: number
  /** 外部暂停信号 */
  paused?: boolean
  className?: string
  /** 当前顶层照片变化时回调 */
  onPhotoChange?: (url: string) => void
}

/**
 * 斜叠图 —— 宝丽来风格，左下角锚点扇出
 *
 * 设计要点：
 * - 所有卡片以左下角为固定点，依次旋转偏移形成扇面
 * - 整体容器带有 -2.5° 微倾斜，营造随性摆放感
 * - 宝丽来白边 + 加厚底部，实物隐喻
 * - 点击或自动轮播时，弹簧动画驱动卡片位置重排
 * - 无圆点指示器、无左右箭头
 */
export function AngledStack({
  photos,
  interval = 4,
  paused = false,
  className = '',
  onPhotoChange,
}: AngledStackProps) {
  const [order, setOrder] = useState<string[]>(photos)
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const effectivePaused = paused || isHovered

  // ---- 通知外部当前顶层照片 ----
  useEffect(() => {
    if (order.length > 0) {
      onPhotoChange?.(order[0])
    }
  }, [order[0], onPhotoChange])

  // ---- 外部 photos 变化同步 ----
  useEffect(() => {
    setOrder((current) => {
      if (paused) return photos
      const top = current[0]
      if (top && photos.includes(top)) {
        const rest = photos.filter((p) => p !== top)
        return [top, ...rest]
      }
      return photos
    })
  }, [photos, paused])

  // ---- 轮播：首位移到末位 ----
  const rotate = useCallback(() => {
    setOrder((prev) => {
      if (prev.length <= 1) return prev
      return [...prev.slice(1), prev[0]]
    })
  }, [])

  // ---- 自动轮播定时器 ----
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (effectivePaused || interval === 0 || order.length <= 1) return
    timerRef.current = setInterval(rotate, interval * 1000)
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [effectivePaused, interval, order.length, rotate])

  // ---- 卸载清理 ----
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // ---- 卡片布局：扇面从左下角展开 ----
  // index 0 = 最前（主卡片）→ index 3 = 最远
  const cardLayout = (index: number) => {
    const configs = [
      { rotate: 0.6,  x: 0,   y: 0,   scale: 1,     zIndex: 40, brightness: 1 },
      { rotate: -2.4, x: 36,  y: 10,  scale: 0.965, zIndex: 30, brightness: 0.93 },
      { rotate: 3.0,  x: 72,  y: 22,  scale: 0.93,  zIndex: 20, brightness: 0.86 },
      { rotate: -1.8, x: 108, y: 36,  scale: 0.895, zIndex: 10, brightness: 0.78 },
    ]
    const idx = Math.min(index, configs.length - 1)
    return { ...configs[idx], opacity: index >= 4 ? 0 : 1 }
  }

  // ---- 空状态 ----
  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full max-w-[380px] items-center justify-center rounded-lg border border-dashed border-[var(--sp-hairline)] bg-[var(--sp-surface)]">
        <span
          className="text-sm text-[var(--sp-muted)]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          暂无图片
        </span>
      </div>
    )
  }

  const displayCount = Math.min(order.length, 4)
  const lastLayout = cardLayout(displayCount - 1)

  // 相框尺寸
  const CARD_W = 360
  const CARD_IMG_H = CARD_W * 0.75 // 4:3
  const FRAME_PAD = 7

  const containerW = CARD_W + FRAME_PAD * 2 + lastLayout.x + 32
  const containerH =
    CARD_IMG_H + FRAME_PAD * 2 + lastLayout.y + 32

  return (
    <div
      className={`group select-none ${className}`}
      style={{
        transform: 'rotate(-2.5deg)',
        transformOrigin: 'bottom left',
        width: `${containerW}px`,
        maxWidth: '100%',
      }}
      onClick={rotate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative"
        style={{
          width: `${containerW}px`,
          height: `${containerH}px`,
          maxWidth: '100%',
        }}
      >
        {order.map((url, i) => {
          const cfg = cardLayout(i)

          return (
            <motion.div
              key={url}
              layout
              className="absolute bottom-0 left-0 origin-bottom-left"
              style={{ width: `${CARD_W}px` }}
              initial={{ opacity: 0, scale: 0.82, rotate: -10 }}
              animate={{
                x: cfg.x,
                y: cfg.y,
                rotate: cfg.rotate,
                scale: cfg.scale,
                opacity: cfg.opacity,
                zIndex: cfg.zIndex,
                filter: `brightness(${cfg.brightness})`,
              }}
              transition={{
                type: 'spring',
                stiffness: 160,
                damping: 26,
                mass: 1.1,
              }}
            >
              {/* 相框卡片 — 四边等宽白边 */}
              <div
                className="overflow-hidden bg-white shadow-lg shadow-black/12 dark:bg-[#2a2822] dark:shadow-black/50"
                style={{
                  padding: `${FRAME_PAD}px`,
                  borderRadius: '2px',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div className="overflow-hidden" style={{ borderRadius: '1px' }}>
                  <img
                    src={url}
                    alt=""
                    className="block w-full"
                    style={{
                      aspectRatio: '4/3',
                      objectFit: 'cover',
                    }}
                    draggable={false}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
