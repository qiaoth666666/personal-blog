'use client'

import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import type { ResumeEducation } from '@/types/db'
import { StaggeredReveal, StaggeredItem } from '@/components/effects/staggered-reveal'
import { renderMarkdown } from '@/lib/markdown'
import { SectionHeading } from './section-heading'

/**
 * 教育经历 —— 时间线布局
 *
 * 左侧时间节点 + 右侧内容区，宽间距
 * 滚动触发节点逐个亮起
 */
export function EducationTimeline({ items }: { items: ResumeEducation[] }) {
  if (items.length === 0) return null

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <SectionHeading>教育背景</SectionHeading>

      <StaggeredReveal className="relative">
        {/* 时间线竖线 */}
        <div className="absolute left-3 top-2 bottom-2 w-px bg-[var(--sp-hairline)] md:left-4" />

        <div className="space-y-12">
          {items.map((edu) => (
            <StaggeredItem key={edu.id}>
              <div className="relative flex gap-6 pl-10 md:pl-14">
                {/* 时间节点 */}
                <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--sp-accent-teal)] text-white md:h-8 md:w-8">
                  <GraduationCap size={14} className="md:size-4" />
                </div>

                {/* 内容 */}
                <div>
                  <h3
                    className="font-display text-xl font-bold text-[var(--sp-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {edu.school}
                  </h3>
                  <p
                    className="mt-1 font-serif text-lg text-[var(--sp-ink)]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {edu.degree}
                    {edu.major && ` · ${edu.major}`}
                  </p>
                  <p
                    className="mt-1 text-sm text-[var(--sp-muted)]"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {formatDate(edu.startDate)} — {edu.endDate ? formatDate(edu.endDate) : '至今'}
                  </p>
                  {edu.description && (
                    <div
                      className="mt-3 resume-markdown"
                      style={{
                        fontFamily: 'var(--resume-font-family, var(--font-serif))',
                        fontSize: 'var(--resume-body-font-size, 1.125rem)',
                        lineHeight: 'var(--resume-line-height, 1.75)',
                      }}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(edu.description) }}
                    />
                  )}
                </div>
              </div>
            </StaggeredItem>
          ))}
        </div>
      </StaggeredReveal>
    </section>
  )
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
}
