'use client'

import { Award } from 'lucide-react'
import type { ResumeCertificate } from '@/types/db'
import { renderMarkdown } from '@/lib/markdown'
import { StaggeredReveal, StaggeredItem } from '@/components/effects/staggered-reveal'
import { BookCard3D } from '@/components/effects/book-card-3d'
import { SectionHeading } from './section-heading'

/**
 * 技能证书 —— 书签式卡片网格 + Markdown 描述
 *
 * 每张卡片像一枚书签，描述直接展示在卡片底部
 */
export function CertificatesGrid({ certificates }: { certificates: ResumeCertificate[] }) {
  if (certificates.length === 0) return null

  return (
    <section className="mx-auto max-w-4xl px-6 py-10"
      style={{
        paddingTop: 'var(--resume-section-gap, 2.5rem)',
        paddingBottom: 'var(--resume-section-gap, 2.5rem)',
      }}
    >
      <SectionHeading subtitle="Certificates">技能证书</SectionHeading>

      <StaggeredReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert) => (
          <StaggeredItem key={cert.id}>
            <BookCard3D className="h-full">
              <div className="flex h-full flex-col items-start gap-3 border border-[var(--sp-hairline)] bg-[var(--sp-surface)] p-6"
                style={{
                  fontFamily: 'var(--resume-font-family, var(--font-serif))',
                  fontSize: 'var(--resume-body-font-size, 1.125rem)',
                  lineHeight: 'var(--resume-line-height, 1.75)',
                }}
              >
                {/* 图标 */}
                <Award size={28} className="text-[var(--sp-accent-teal)]" strokeWidth={1.5} />

                {/* 证书名 */}
                <h3
                  className="font-display text-lg font-bold leading-tight text-[var(--sp-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {cert.name}
                </h3>

                {/* 颁发机构 */}
                {cert.issuer && (
                  <p className="text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>
                    {cert.issuer}
                  </p>
                )}

                {/* 日期 */}
                {cert.issueDate && (
                  <p className="text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>
                    {new Date(cert.issueDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                  </p>
                )}

                {/* 描述 —— Markdown 渲染 */}
                {cert.description && (
                  <div
                    className="mt-2 resume-markdown text-sm"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(cert.description),
                    }}
                  />
                )}
              </div>
            </BookCard3D>
          </StaggeredItem>
        ))}
      </StaggeredReveal>
    </section>
  )
}
