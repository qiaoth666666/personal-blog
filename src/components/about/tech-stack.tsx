'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { TECH_STACK } from '@/lib/constants'

/**
 * 技术栈展示 —— 极简版权页风格
 *
 * 列出博客使用的技术，标签式排列
 * 像书籍版权页的印刷信息
 */
export function TechStack() {
  return (
    <motion.div
      className="py-16 text-center"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* 小标题 */}
      <p
        className="mb-8 font-sans text-xs uppercase tracking-[0.2em] text-[var(--sp-muted)]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        技术栈
      </p>

      {/* 标签行 */}
      <p
        className="mx-auto max-w-lg font-serif text-base leading-loose text-[var(--sp-muted)]"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {TECH_STACK.map((tech, i) => (
          <span key={tech.name}>
            <Link
              href={tech.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--sp-muted)] no-underline transition-colors hover:text-[var(--sp-accent-teal)]"
            >
              {tech.name}
            </Link>
            {i < TECH_STACK.length - 1 && (
              <span className="mx-2 text-[var(--sp-hairline)] select-none">·</span>
            )}
          </span>
        ))}
      </p>

      {/* 底部署名 */}
      <p
        className="mt-10 font-sans text-xs text-[var(--sp-hairline)]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        Built with love &amp; curiosity
      </p>
    </motion.div>
  )
}
