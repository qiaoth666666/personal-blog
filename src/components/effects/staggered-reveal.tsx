'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface StaggeredRevealProps {
  children: ReactNode
  className?: string
  /** Delay between each child in seconds, default 0.12 */
  staggerDelay?: number
  /** Initial y offset, default 12px */
  yOffset?: number
}

/**
 * 交错淡入容器 — 子元素依次淡入上升
 * 用于列表、卡片网格的滚动入场
 */
export function StaggeredReveal({
  children,
  className,
  staggerDelay = 0.12,
  yOffset = 12,
}: StaggeredRevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * 交错淡入子元素
 */
export function StaggeredItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
