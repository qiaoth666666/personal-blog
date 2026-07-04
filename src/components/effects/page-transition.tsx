'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * 页面过渡 — 路由切换时的淡入淡出
 * 轻快、柔和，进出动画并行以消除等待感
 * 每次路由变化强制滚动到顶部，避免页面残留在上次的滚动位置
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // 立即滚到顶部（instant 避免可见的滑动过程）
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{
          duration: 0.25,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
