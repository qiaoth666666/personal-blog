'use client'

import { motion } from 'framer-motion'
import { SITE_INTRO } from '@/lib/constants'
import { renderMarkdown } from '@/lib/markdown'

/**
 * 站点简介 —— 编辑式引言排版
 *
 * 展示博客的定位和初衷，支持 Markdown 渲染
 * 优先使用数据库内容，无数据时回退到默认文案
 */
export function SiteIntro({ content }: { content: string | null }) {
  const html = renderMarkdown(content || SITE_INTRO.content)

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Markdown 渲染正文 */}
        <div
          className="font-serif text-lg leading-relaxed text-[var(--sp-ink)] md:text-xl site-intro-content"
          style={{ fontFamily: 'var(--font-serif)' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </motion.div>

      {/* 底部分隔线 */}
      <div className="mx-auto mt-14 max-w-xs border-t border-[var(--sp-hairline)]" />
    </section>
  )
}
