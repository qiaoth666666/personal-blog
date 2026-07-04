import { Suspense } from 'react'
import { query, queryOne } from '@/lib/db'
import type { ResumeProfile, ResumeEducation, ResumeSkill, ResumeSkillContent, ResumeProject, ResumeCertificate, ResumeIntro, ResumeStyle } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { PageTransition } from '@/components/effects/page-transition'
import { ResumeViewSwitcher } from '@/components/resume/resume-view-switcher'
import { ResumeFallback } from '@/components/resume/resume-fallback'
import type { ResumeStyleConfig } from '@/lib/resume-styles'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '简历',
  description: '教育背景、专业技能、项目经历与证书',
}

/**
 * 简历页 —— 每次请求直读数据库，无缓存
 */
export default function ResumePage() {
  return (
    <PageTransition>
      <Suspense fallback={<ResumeShell />}>
        <ResumeData />
      </Suspense>
    </PageTransition>
  )
}

async function ResumeData() {
  try {
    const [
      profile,
      education,
      skills,
      projects,
      certificates,
      intro,
      styleRow,
      skillContentRow,
    ] = await Promise.all([
      queryOne<ResumeProfile & RowDataPacket>('SELECT * FROM `ResumeProfile` LIMIT 1'),
      query<ResumeEducation & RowDataPacket>('SELECT * FROM `ResumeEducation` ORDER BY sortOrder ASC'),
      query<ResumeSkill & RowDataPacket>('SELECT * FROM `ResumeSkill` ORDER BY sortOrder ASC'),
      query<ResumeProject & RowDataPacket>('SELECT * FROM `ResumeProject` ORDER BY sortOrder ASC'),
      query<ResumeCertificate & RowDataPacket>('SELECT * FROM `ResumeCertificate` ORDER BY sortOrder ASC'),
      queryOne<ResumeIntro & RowDataPacket>('SELECT * FROM `ResumeIntro` LIMIT 1'),
      queryOne<ResumeStyle & RowDataPacket>('SELECT * FROM `ResumeStyle` LIMIT 1'),
      queryOne<ResumeSkillContent & RowDataPacket>('SELECT * FROM `ResumeSkillContent` LIMIT 1'),
    ])

    if (!profile) {
      return <ResumeFallback />
    }

    // 解析样式配置 JSON
    let styleConfig: ResumeStyleConfig | null = null
    if (styleRow?.config) {
      try {
        styleConfig = JSON.parse(styleRow.config) as ResumeStyleConfig
      } catch { /* ignore parse error */ }
    }

    const skillContent = skillContentRow?.content ?? null

    return (
      <ResumeViewSwitcher
        profile={profile}
        education={education}
        skills={skills}
        projects={projects}
        certificates={certificates}
        introContent={intro?.content ?? null}
        styleConfig={styleConfig}
        skillContent={skillContent}
      />
    )
  } catch (err) {
    console.error('[ResumeData] 数据库查询失败:', err)
    return <ResumeFallback />
  }
}

/** 数据加载期间的骨架 Shell */
function ResumeShell() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <div className="mb-12 text-center">
        <div className="mx-auto h-12 w-32 animate-pulse rounded bg-[var(--sp-surface)]" />
        <div className="mx-auto mt-3 h-5 w-64 animate-pulse rounded bg-[var(--sp-surface)]" />
      </div>
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 w-48 animate-pulse rounded bg-[var(--sp-surface)]" />
            <div className="h-4 w-full animate-pulse rounded bg-[var(--sp-surface)]" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--sp-surface)]" />
          </div>
        ))}
      </div>
    </div>
  )
}
