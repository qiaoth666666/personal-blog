'use client'

import type { ResumeSkill } from '@/types/db'
import { renderMarkdown } from '@/lib/markdown'
import { SectionHeading } from './section-heading'

/**
 * 专业技能 —— Markdown 全文渲染
 *
 * 从单个 Markdown 字段直接渲染，保留 Pull Quote 装饰风格。
 */
export function SkillsGrid({ skills, skillContent }: { skills: ResumeSkill[]; skillContent?: string | null }) {
  const content = skillContent || null
  if (!content && skills.length === 0) return null

  return (
    <section className="mx-auto max-w-3xl px-6 py-10"
      style={{
        paddingTop: 'var(--resume-section-gap, 2.5rem)',
        paddingBottom: 'var(--resume-section-gap, 2.5rem)',
        maxWidth: 'var(--resume-content-max-width, 48rem)',
      }}
    >
      <SectionHeading subtitle="Skills">专业技能</SectionHeading>

      {content ? (
        <div
          className="resume-markdown"
          style={{
            fontFamily: 'var(--resume-font-family, var(--font-serif))',
            fontSize: 'var(--resume-body-font-size, 1.125rem)',
            lineHeight: 'var(--resume-line-height, 1.75)',
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      ) : (
        <p className="text-sm italic text-[var(--sp-muted)]">暂无技能描述</p>
      )}
    </section>
  )
}
