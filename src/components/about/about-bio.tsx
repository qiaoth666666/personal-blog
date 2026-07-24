'use client'

import { motion } from 'framer-motion'
import { renderMarkdown } from '@/lib/markdown'

/**
 * 个人介绍 —— 大段文字 + Pull Quote 排版
 *
 * 从 AboutConfig.personalBio 读取 Markdown
 * 自动提取首段作为 Pull Quote
 */
export function AboutBio({ content }: { content: string | null }) {
  if (!content) {
    return (
      <div className="py-12 text-center">
        <p
          className="text-lg italic text-[var(--sp-muted)]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          个人介绍将在后台填写后显示
        </p>
        <p
          className="mt-4 text-sm text-[var(--sp-muted)]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          敬请期待
        </p>
      </div>
    )
  }

  const paragraphs = content.split('\n\n').filter(Boolean)
  const pullQuote = paragraphs[0]
  const body = paragraphs.slice(1).join('\n\n')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Pull Quote */}
      {pullQuote && (
        <blockquote
          className="pull-quote"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {pullQuote}
        </blockquote>
      )}

      {/* 正文 —— Markdown 渲染 */}
      {body && (
        <div
          className="mt-8 site-intro-content"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.125rem',
            lineHeight: 1.75,
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
        />
      )}
    </motion.div>
  )
}
