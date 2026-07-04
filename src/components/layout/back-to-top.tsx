'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowUp } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * 回到顶部按钮
 *
 * 页面滚动超过阈值时在右下角浮现，点击后平滑回到顶部。
 * 遵循 Stripe Press 温润克制的美学。
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false)

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > 300)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-8 right-8 z-40 flex size-11 items-center justify-center rounded-full border border-[var(--sp-hairline)]/50 bg-[var(--sp-ground)]/80 text-[var(--sp-muted)] shadow-subtle backdrop-blur-md transition-colors duration-300 hover:border-[var(--sp-accent-teal)]/40 hover:bg-[var(--sp-surface)] hover:text-[var(--sp-accent-teal)] cursor-pointer"
          aria-label="回到顶部"
        >
          <ArrowUp size={18} strokeWidth={1.5} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
