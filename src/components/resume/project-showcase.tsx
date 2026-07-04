'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { ResumeProject } from '@/types/db'
import { renderMarkdown } from '@/lib/markdown'
import { StaggeredReveal, StaggeredItem } from '@/components/effects/staggered-reveal'
import { SectionHeading } from './section-heading'

/**
 * 项目经历 —— 交错卡片布局 + Markdown 描述
 *
 * 偶数卡片左对齐，奇数卡片右对齐
 * description 字段以 Markdown 渲染
 */
export function ProjectShowcase({ projects }: { projects: ResumeProject[] }) {
  if (projects.length === 0) return null

  return (
    <section className="mx-auto max-w-4xl px-6 py-10"
      style={{
        paddingTop: 'var(--resume-section-gap, 2.5rem)',
        paddingBottom: 'var(--resume-section-gap, 2.5rem)',
      }}
    >
      <SectionHeading subtitle="Projects">项目经历</SectionHeading>

      <StaggeredReveal className="space-y-8">
        {projects.map((project, index) => {
          const isEven = index % 2 === 0

          return (
            <StaggeredItem key={project.id}>
              <motion.div
                className={`flex ${isEven ? 'justify-start' : 'justify-end'}`}
                initial={{ opacity: 0, x: isEven ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="w-full border border-[var(--sp-hairline)] bg-[var(--sp-surface)] p-8 shadow-book md:w-[80%]">
                  {/* 项目名 + 角色 + 时间 */}
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3
                      className="font-display text-xl font-bold text-[var(--sp-ink)]"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--resume-heading-font-size, 1.5rem)',
                      }}
                    >
                      {project.name}
                    </h3>
                    <span
                      className="text-xs text-[var(--sp-muted)]"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {project.startDate
                        ? new Date(project.startDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })
                        : ''}
                      {project.endDate
                        ? ` — ${new Date(project.endDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })}`
                        : project.startDate ? ' — 至今' : ''}
                    </span>
                  </div>

                  {project.role && (
                    <p
                      className="mt-1 font-serif text-base italic text-[var(--sp-muted)]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {project.role}
                    </p>
                  )}

                  {/* 描述 —— Markdown 渲染 */}
                  {project.description && (
                    <div
                      className="mt-4 resume-markdown"
                      style={{
                        fontFamily: 'var(--resume-font-family, var(--font-serif))',
                        fontSize: 'var(--resume-body-font-size, 1.125rem)',
                        lineHeight: 'var(--resume-line-height, 1.75)',
                      }}
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(project.description),
                      }}
                    />
                  )}

                  {/* 技术栈标签 */}
                  {project.techStack && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.techStack.split(',').map((tech) => (
                        <span
                          key={tech.trim()}
                          className="border-b border-[var(--sp-hairline)] pb-0.5 text-xs text-[var(--sp-muted)]"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 链接 */}
                  {project.link && (
                    <div className="mt-5">
                      <Link
                        href={project.link}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-sm text-[var(--sp-accent-teal)] no-underline hover:opacity-70"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        <ExternalLink size={14} />
                        查看项目
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </StaggeredItem>
          )
        })}
      </StaggeredReveal>
    </section>
  )
}
