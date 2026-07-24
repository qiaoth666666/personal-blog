'use client'

import { useCallback } from 'react'
import { motion } from 'framer-motion'

interface VinylPlayerProps {
  coverUrl: string
  isPlaying: boolean
  onTogglePlay: () => void
  /** 歌曲播放进度 0~1（用于唱针渐进移动） */
  progress?: number
}

const START_ANGLE = -38    // 歌曲开始时唱针位置
const END_ANGLE = -25      // 歌曲结束时唱针位置（不超出黑胶圆环）
const PAUSE_ANGLE = -48    // 暂停时唱针弹开位置

export function VinylPlayer({ coverUrl, isPlaying, onTogglePlay, progress = 0 }: VinylPlayerProps) {
  // 播放角度 = 根据进度线性插值
  const playAngle = START_ANGLE + (END_ANGLE - START_ANGLE) * Math.min(1, Math.max(0, progress))
  const tonearmAngle = isPlaying ? playAngle : PAUSE_ANGLE
  const handleClick = useCallback(() => {
    onTogglePlay()
  }, [onTogglePlay])

  const vinylSize = 400
  const tonearmSize = 400
  const wrapperSize = 500

  // 黑胶右上角坐标（相对 wrapper）
  const topRightX = wrapperSize / 2 + vinylSize / 2 - 10
  const topRightY = (wrapperSize - vinylSize) / 2 + 20
  const tonearmLeft = topRightX - tonearmSize / 2
  const tonearmTop = topRightY - tonearmSize / 2

  return (
    <div className="relative select-none" style={{ width: wrapperSize, height: wrapperSize, overflow: 'visible' }}>
      {/* 外层：用 translate(-50%, -50%) 把黑胶中心精确固定在 wrapper 正中心 (160,160) */}
      <div
        onClick={handleClick}
        className="absolute cursor-pointer z-20"
        style={{
          left: '50%',
          top: '50%',
          width: vinylSize,
          height: vinylSize,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* 内层：只负责旋转 */}
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformOrigin: 'center center',
            animation: 'vinylSpin 3s linear infinite',
            animationPlayState: isPlaying ? 'running' : 'paused',
          }}
        >
          {/* 封面（圆形，用 flex 居中，不依赖 inset） */}
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="rounded-full object-cover z-10"
              draggable={false}
              style={{ width: '46%', height: '46%' }}
            />
          ) : (
            <div
              className="rounded-full bg-[var(--sp-surface-alt)] z-10"
              style={{ width: '46%', height: '46%' }}
            />
          )}

          {/* 黑胶圆环 PNG */}
          <img
            src="/images/黑胶.png"
            alt=""
            className="absolute inset-0 w-full h-full z-20 pointer-events-none"
            draggable={false}
          />
        </div>
      </div>

      {/* 唱针（initial=false 防止挂载时跳转） */}
      <motion.div
        initial={false}
        className="absolute pointer-events-none z-30"
        style={{
          width: tonearmSize,
          height: tonearmSize,
          left: tonearmLeft,
          top: tonearmTop,
          transformOrigin: 'center center',
        }}
        animate={{ rotate: tonearmAngle }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 40,
          mass: 5,
        }}
      >
        <img src="/images/唱针.png" alt="" className="w-full h-full" draggable={false} />
      </motion.div>

      <style>{`
        @keyframes vinylSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
