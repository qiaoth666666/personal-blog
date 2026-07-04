'use client'

import { motion } from 'framer-motion'
import { renderMarkdown } from '@/lib/markdown'
import { SectionHeading } from './section-heading'

/**
 * 自我介绍 —— Markdown 全文渲染
 *
 * 保留 Pull Quote 装饰风格（取第一段做引文），
 * 其余内容由 Markdown 渲染。
 */
export function PersonalIntro({ content }: { content: string | null }) {
  if (!content) return null

  // 将第一段作为 Pull Quote 提取，其余作为正文
  const paragraphs = content.split('\n\n').filter(Boolean)
  const pullQuote = paragraphs[0]
  const body = paragraphs.slice(1).join('\n\n')

  return (
    <section className="mx-auto max-w-3xl px-6 py-10"
      style={{
        paddingTop: 'var(--resume-section-gap, 2.5rem)',
        paddingBottom: 'var(--resume-section-gap, 2.5rem)',
        maxWidth: 'var(--resume-content-max-width, 48rem)',
      }}
    >
      <SectionHeading subtitle="About Me">自我介绍</SectionHeading>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: 'var(--resume-font-family, var(--font-serif))',
          fontSize: 'var(--resume-body-font-size, 1.125rem)',
          lineHeight: 'var(--resume-line-height, 1.75)',
        }}
      >
        {/* Pull Quote —— 大号意大利体 */}
        <blockquote
          className="pull-quote"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {pullQuote}
        </blockquote>

        {/* 正文 —— Markdown 渲染 */}
        {body && (
          <div
            className="mt-8 resume-markdown"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
          />
        )}
      </motion.div>
    </section>
  )
}
