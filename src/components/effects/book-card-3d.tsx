'use client'

import { useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BookCard3DProps {
  children: ReactNode
  className?: string
  /** Max rotation in degrees, default 8° */
  maxRotation?: number
}

/**
 * 3D 书籍卡片 — 悬浮时像精装书一样轻微旋转
 * Stripe Press 实物隐喻的核心组件
 */
export function BookCard3D({ children, className, maxRotation = 8 }: BookCard3DProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setRotateX(-y * maxRotation * 2)
    setRotateY(x * maxRotation * 2)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={ref}
      className={cn('book-card-3d cursor-pointer', className)}
      style={{ perspective: '1200px' }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{
        type: 'tween',
        ease: [0.16, 1, 0.3, 1],
        duration: 0.6,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}
