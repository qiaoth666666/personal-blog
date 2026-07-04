'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface KenBurnsProps {
  children: ReactNode
  className?: string
  /** Duration in seconds, default 20s */
  duration?: number
}

/**
 * Ken Burns 慢镜头效果 — 图片缓慢缩放平移
 * Stripe Press 签名动效之一
 */
export function KenBurns({ children, className, duration = 20 }: KenBurnsProps) {
  return (
    <div
      className={cn('ken-burns overflow-hidden', className)}
      style={{
        ['--kb-duration' as string]: `${duration}s`,
      }}
    >
      <div
        style={{
          animation: `ken-burns-zoom ${duration}s ease-in-out infinite alternate`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
