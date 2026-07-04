import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Package,
  HardDrive,
  Tag,
  Info,
  Monitor,
  Apple,
  Smartphone,
  Globe,
} from 'lucide-react'
import { queryOne } from '@/lib/db'
import type { Software } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { renderMarkdown } from '@/lib/markdown'
import { PageTransition } from '@/components/effects/page-transition'
import { TextileSection } from '@/components/effects/textile-overlay'
import { ResumeFallback } from '@/components/resume/resume-fallback'
import type { Metadata } from 'next'

export const revalidate = 60

interface SoftwareDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: SoftwareDetailPageProps): Promise<Metadata> {
  const { id } = await params
  let software: { name: string; description: string | null } | null = null
  try {
    software = await queryOne<Pick<Software, 'name' | 'description'> & RowDataPacket>(
      'SELECT name, description FROM `Software` WHERE id = ? LIMIT 1',
      [parseInt(id, 10)],
    )
  } catch {}
  return {
    title: software ? `${software.name} - 软库` : '软件详情',
    description: software?.description ?? '软件详情',
  }
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  windows: <Monitor size={14} strokeWidth={1.5} />,
  mac: <Apple size={14} strokeWidth={1.5} />,
  linux: <Monitor size={14} strokeWidth={1.5} />,
  android: <Smartphone size={14} strokeWidth={1.5} />,
  ios: <Smartphone size={14} strokeWidth={1.5} />,
  web: <Globe size={14} strokeWidth={1.5} />,
}

export default async function SoftwareDetailPage({
  params,
}: SoftwareDetailPageProps) {
  const { id } = await params
  let software: {
    id: number
    name: string
    version: string | null
    description: string | null
    detailContent: string | null
    officialUrl: string | null
    downloadUrl: string | null
    downloadFile: string | null
    fileSize: string | null
    platform: string | null
    category: string | null
    tags: string | null
    iconUrl: string | null
    notes: string | null
  } | null = null
  let dbError = false

  try {
    software = await queryOne<Software & RowDataPacket>(
      'SELECT * FROM `Software` WHERE id = ? LIMIT 1',
      [parseInt(id, 10)],
    )
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

  if (!software) {
    notFound()
  }

  const platforms = software.platform
    ? software.platform.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const tags = software.tags
    ? software.tags.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const detailHtml = software.detailContent
    ? renderMarkdown(software.detailContent)
    : null

  const hasLocalDownload = !!software.downloadFile
  const hasDownload = hasLocalDownload || !!software.downloadUrl

  return (
    <PageTransition>
      <TextileSection className="py-16 sm:py-24" opacity={0.25}>
        <div className="mx-auto max-w-5xl px-6">

          {/* 返回 */}
          <Link
            href="/software"
            className="mb-12 inline-flex items-center gap-2 text-sm text-[var(--sp-muted)] no-underline transition-colors hover:text-[var(--sp-ink)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            返回软库
          </Link>

          {/* ═══════════ 双栏 · 上下全对齐 ═══════════ */}
          <div className="gap-8 sm:grid sm:grid-cols-[1fr_320px]">

            {/* ──── 左栏：图片在上 → 标签 → 名称 → 简介在下 ──── */}
            <div className="flex flex-col">
              {/* 正方形图片 — 大小适中 */}
              <div className="mx-auto w-full max-w-[260px] sm:mx-0">
                <div className="aspect-square w-full overflow-hidden border border-[var(--sp-hairline)] bg-[var(--sp-surface)]">
                  {software.iconUrl ? (
                    <Image
                      src={software.iconUrl}
                      alt={software.name}
                      width={260}
                      height={260}
                      className="h-full w-full object-contain p-6"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--sp-muted)]/20">
                      <Package size={56} strokeWidth={1} />
                    </div>
                  )}
                </div>
              </div>

              {/* 标签 */}
              {tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-[var(--sp-accent-teal)]/25 bg-[var(--sp-accent-teal)]/[0.04] px-2.5 py-1 text-[11px] text-[var(--sp-accent-teal)]"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 名称 */}
              <div className="mt-4 flex items-baseline flex-wrap gap-2">
                <h1
                  className="font-display text-[clamp(1.5rem,3.5vw,1.875rem)] font-bold leading-tight tracking-[-0.01em] text-[var(--sp-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {software.name}
                </h1>
                {software.version && (
                  <span
                    className="text-sm text-[var(--sp-muted)]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    v{software.version}
                  </span>
                )}
              </div>

              {/* 简介 */}
              {software.description && (
                <p
                  className="mt-4 text-[15px] leading-relaxed text-[var(--sp-ink)]/75"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {software.description}
                </p>
              )}
            </div>

            {/* ──── 右栏：软件信息 + 下载链接 ──── */}
            <aside className="mt-10 flex flex-col sm:mt-0">
              <div className="flex flex-col gap-4 sm:justify-between sm:h-full">
                {/* 软件信息 */}
                <div className="border border-[var(--sp-hairline)] bg-[var(--sp-surface)] p-5">
                  <h3
                    className="mb-4 font-display text-xs font-bold uppercase tracking-[0.14em] text-[var(--sp-muted)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    软件信息
                  </h3>
                  <div className="space-y-3">
                    {software.category && (
                      <InfoRow label="分类" icon={<Tag size={13} />}>
                        {software.category}
                      </InfoRow>
                    )}
                    {software.version && (
                      <InfoRow label="版本" icon={<Info size={13} />}>
                        v{software.version}
                      </InfoRow>
                    )}
                    {software.fileSize && (
                      <InfoRow label="大小" icon={<HardDrive size={13} />}>
                        {software.fileSize}
                      </InfoRow>
                    )}
                    {platforms.length > 0 && (
                      <div>
                        <span
                          className="mb-1.5 block text-xs text-[var(--sp-muted)]"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          支持平台
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {platforms.map((p) => {
                            const key = p.toLowerCase()
                            return (
                              <span
                                key={p}
                                className="inline-flex items-center gap-1 border border-[var(--sp-hairline)] px-2 py-0.5 text-[11px] text-[var(--sp-ink)]"
                                style={{ fontFamily: 'var(--font-sans)' }}
                              >
                                {PLATFORM_ICONS[key] ?? null}
                                {p}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 下载链接 — 靠下 */}
                <div className="border border-[var(--sp-hairline)] bg-[var(--sp-surface)] p-5">
                  <h3
                    className="mb-4 font-display text-xs font-bold uppercase tracking-[0.14em] text-[var(--sp-muted)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    下载链接
                  </h3>
                  <div className="space-y-2">
                    {hasDownload ? (
                      <a
                        href={
                          hasLocalDownload
                            ? `/api/download?file=${encodeURIComponent(software.downloadFile!)}`
                            : software.downloadUrl!
                        }
                        target={hasLocalDownload ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 border-2 border-[var(--sp-accent-teal)] bg-[var(--sp-accent-teal)] py-2.5 text-xs font-medium tracking-wide text-[var(--sp-ground)] no-underline transition-all duration-300 hover:bg-transparent hover:text-[var(--sp-accent-teal)]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        <Download size={14} strokeWidth={1.5} />
                        下载软件
                      </a>
                    ) : (
                      <p
                        className="py-2.5 text-center text-[11px] text-[var(--sp-muted)]/40"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        暂无下载链接
                      </p>
                    )}
                    {software.officialUrl && (
                      <a
                        href={software.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 border border-[var(--sp-hairline)] py-2.5 text-xs text-[var(--sp-ink)] no-underline transition-all hover:border-[var(--sp-ink)] hover:bg-[var(--sp-surface)]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        <ExternalLink size={14} strokeWidth={1.5} />
                        访问官网
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* ═══════════ 下方：详细介绍 + 备注 ═══════════ */}
          {(detailHtml || software.notes) && (
            <div className="mt-16 border-t border-[var(--sp-hairline)] pt-12">
              {detailHtml && (
                <div className="max-w-prose">
                  <h2
                    className="font-display text-xl font-bold text-[var(--sp-ink)] mb-6"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    详细介绍
                  </h2>
                  <div
                    className="software-content prose prose-lg max-w-none overflow-hidden [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_code]:break-all [&_img]:max-w-full"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                    }}
                    dangerouslySetInnerHTML={{ __html: detailHtml }}
                  />
                </div>
              )}
              {software.notes && (
                <div className={`mt-10 flex gap-3 border-l-2 border-[var(--sp-accent-teal)] bg-[var(--sp-surface)] p-5 ${detailHtml ? '' : 'max-w-prose'}`}>
                  <Info
                    size={16}
                    strokeWidth={1.5}
                    className="mt-0.5 shrink-0 text-[var(--sp-accent-teal)]"
                  />
                  <p
                    className="text-sm leading-relaxed text-[var(--sp-ink)]/70"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {software.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </TextileSection>
    </PageTransition>
  )
}

/* ──── 信息行 ──── */
function InfoRow({
  label,
  icon,
  children,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span
        className="flex items-center gap-1.5 text-[var(--sp-muted)]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {icon}
        {label}
      </span>
      <span
        className="text-[var(--sp-ink)]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {children}
      </span>
    </div>
  )
}
