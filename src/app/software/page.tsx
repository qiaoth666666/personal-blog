import { query } from '@/lib/db'
import type { Software } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { PageTransition } from '@/components/effects/page-transition'
import { TextileSection } from '@/components/effects/textile-overlay'
import { SoftwareList } from './software-list'
import { ResumeFallback } from '@/components/resume/resume-fallback'
import { Package } from 'lucide-react'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: '软库 — 实用软件资源',
  description: '精选免费实用软件资源合集，提供官方下载与详细介绍',
}

export default async function SoftwarePage() {
  let softwareList: Array<{
    id: number
    name: string
    version: string | null
    description: string | null
    downloadUrl: string | null
    downloadFile: string | null
    fileSize: string | null
    platform: string | null
    category: string | null
    tags: string | null
    iconUrl: string | null
    officialUrl: string | null
    notes: string | null
  }> = []
  let categories: string[] = []
  let dbError = false

  try {
    softwareList = await query<Software & RowDataPacket>(
      'SELECT * FROM `Software` ORDER BY sortOrder ASC',
    )
    const catSet = new Set(
      (softwareList as Software[]).map((s) => s.category).filter(Boolean) as string[]
    )
    categories = Array.from(catSet).sort()
  } catch {
    dbError = true
  }

  if (dbError) {
    return (
      <PageTransition>
        <ResumeFallback />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <TextileSection className="py-16 sm:py-24" opacity={0.25}>
        <div className="mx-auto max-w-6xl px-6">
          {/* 页头 — Editorial style with subtle decoration */}
          <header className="mb-16 text-center">
            <div className="mb-5 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[var(--sp-hairline)]" />
              <Package
                size={16}
                strokeWidth={1.5}
                className="text-[var(--sp-muted)]/50"
              />
              <span className="h-px w-8 bg-[var(--sp-hairline)]" />
            </div>
            <h1
              className="font-display text-[clamp(2.25rem,5vw,3rem)] font-bold tracking-[-0.02em] text-[var(--sp-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              软库
            </h1>
            <p
              className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[var(--sp-muted)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              精选免费实用软件资源合集
              <span className="mx-2 text-[var(--sp-hairline)]">·</span>
              {softwareList.length} 款工具
            </p>
            {/* 装饰线 */}
            <div className="mx-auto mt-8 h-px w-16 bg-[var(--sp-hairline)]" />
          </header>

          {softwareList.length > 0 ? (
            <SoftwareList softwareList={softwareList as any} categories={categories} />
          ) : (
            <ResumeFallback />
          )}
        </div>
      </TextileSection>
    </PageTransition>
  )
}
