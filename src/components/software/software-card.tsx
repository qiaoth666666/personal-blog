'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Download,
  Package,
  ExternalLink,
  Monitor,
  Apple,
  Smartphone,
  Globe,
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { Software } from '@/types/db'

export type CardVariant = 'grid' | 'list'

interface SoftwareCardProps {
  software: Software
  variant: CardVariant
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  windows: <Monitor size={11} strokeWidth={1.5} />,
  mac: <Apple size={11} strokeWidth={1.5} />,
  linux: <Monitor size={11} strokeWidth={1.5} />,
  android: <Smartphone size={11} strokeWidth={1.5} />,
  ios: <Smartphone size={11} strokeWidth={1.5} />,
  web: <Globe size={11} strokeWidth={1.5} />,
}

/* ═══════════════════════════════════════════════════════
   网格卡片 — 4 列统一高度
   ═══════════════════════════════════════════════════════ */
function GridCard({ software }: { software: Software }) {
  const router = useRouter()
  const tags = software.tags
    ? software.tags.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const platforms = software.platform
    ? software.platform.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const hasLocal = !!software.downloadFile
  const downloadHref = hasLocal
    ? `/api/download?file=${encodeURIComponent(software.downloadFile!)}`
    : software.downloadUrl || '#'
  const hasDownload = hasLocal || !!software.downloadUrl

  return (
    <motion.article
      className="group flex h-full cursor-pointer flex-col border border-[var(--sp-hairline)]/60 bg-[var(--sp-surface)] transition-all duration-300"
      whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(0,0,0,0.06)' }}
      transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
      onClick={() => router.push(`/software/${software.id}`)}
    >
      {/* 图标 */}
      <div className="flex h-[120px] items-center justify-center bg-[var(--sp-accent-teal)]/[0.06] px-4 py-5 transition-colors duration-300 group-hover:bg-[var(--sp-accent-teal)]/[0.1]">
        {software.iconUrl ? (
          <Image
            src={software.iconUrl}
            alt={software.name}
            width={64}
            height={64}
            className="h-16 w-16 object-contain transition-transform duration-400 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center border border-[var(--sp-accent-teal)]/20 text-[var(--sp-accent-teal)]/30">
            <Package size={28} strokeWidth={1} />
          </div>
        )}
      </div>

      {/* 信息区 */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {software.category && (
          <span className="self-start text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--sp-accent-teal)]/80">
            {software.category}
          </span>
        )}

        <h3
          className="font-display text-[15px] font-bold leading-snug text-[var(--sp-ink)] group-hover:text-[var(--sp-accent-teal)] transition-colors duration-300"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {software.name}
        </h3>

        {software.description && (
          <p className="line-clamp-2 text-[12px] leading-relaxed text-[var(--sp-muted)]">
            {software.description}
          </p>
        )}

        {/* 底部 meta */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1.5">
          {software.version && (
            <span className="text-[11px] text-[var(--sp-muted)]/70" style={{ fontFamily: 'var(--font-mono)' }}>
              v{software.version}
            </span>
          )}
          {software.fileSize && (
            <span className="text-[11px] text-[var(--sp-muted)]/60" style={{ fontFamily: 'var(--font-mono)' }}>
              {software.fileSize}
            </span>
          )}
        </div>

        {/* 平台标签 */}
        <div className="flex flex-wrap items-center gap-1">
          {platforms.slice(0, 3).map((p) => {
            const key = p.toLowerCase()
            return (
              <span
                key={p}
                className="inline-flex items-center gap-1 border border-[var(--sp-hairline)]/50 px-1.5 py-0.5 text-[10px] uppercase text-[var(--sp-muted)]/60"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {PLATFORM_ICONS[key]}
                {p}
              </span>
            )
          })}
        </div>

        {/* 下载按钮 */}
        {hasDownload && (
          <a
            href={downloadHref}
            target={hasLocal ? '_self' : '_blank'}
            rel="noopener noreferrer"
            download={hasLocal ? software.downloadFile! : undefined}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 flex items-center justify-center gap-1.5 border border-[var(--sp-accent-teal)] py-2 text-[11px] font-medium tracking-wide text-[var(--sp-accent-teal)] no-underline transition-all duration-300 hover:bg-[var(--sp-accent-teal)] hover:text-[var(--sp-ground)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <Download size={12} strokeWidth={1.5} />
            下载
          </a>
        )}
      </div>
    </motion.article>
  )
}

/* ═══════════════════════════════════════════════════════
   列表卡片 — 单行水平布局
   ═══════════════════════════════════════════════════════ */
function ListCard({ software }: { software: Software }) {
  const router = useRouter()
  const tags = software.tags
    ? software.tags.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const platforms = software.platform
    ? software.platform.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const hasLocal = !!software.downloadFile
  const downloadHref = hasLocal
    ? `/api/download?file=${encodeURIComponent(software.downloadFile!)}`
    : software.downloadUrl || '#'
  const hasDownload = hasLocal || !!software.downloadUrl

  return (
    <motion.article
      className="group flex cursor-pointer items-center gap-5 border-b border-[var(--sp-hairline)]/60 bg-[var(--sp-surface)] px-4 py-4 transition-colors hover:bg-[var(--sp-ground)]/80 sm:px-6"
      whileHover={{ x: 2 }}
      onClick={() => router.push(`/software/${software.id}`)}
    >
      {/* 图标 */}
      <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center border border-[var(--sp-hairline)]/50 bg-[var(--sp-accent-teal)]/[0.06]">
        {software.iconUrl ? (
          <Image
            src={software.iconUrl}
            alt={software.name}
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
        ) : (
          <Package
            size={24}
            strokeWidth={1}
            className="text-[var(--sp-accent-teal)]/30"
          />
        )}
      </div>

      {/* 主信息 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {software.category && (
            <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--sp-accent-teal)]/80">
              {software.category}
            </span>
          )}
          <h3
            className="font-display text-base font-bold text-[var(--sp-ink)] group-hover:text-[var(--sp-accent-teal)] transition-colors duration-300"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {software.name}
          </h3>
          {software.version && (
            <span className="text-[11px] text-[var(--sp-muted)]/60" style={{ fontFamily: 'var(--font-mono)' }}>
              v{software.version}
            </span>
          )}
        </div>

        {software.description && (
          <p className="mt-1 line-clamp-1 text-[13px] leading-relaxed text-[var(--sp-muted)] sm:line-clamp-2">
            {software.description}
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {platforms.map((p) => {
            const key = p.toLowerCase()
            return (
              <span
                key={p}
                className="inline-flex items-center gap-1 border border-[var(--sp-hairline)]/50 px-1.5 py-0.5 text-[10px] uppercase text-[var(--sp-muted)]/60"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {PLATFORM_ICONS[key]}
                {p}
              </span>
            )
          })}
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-[var(--sp-accent-teal)]/60"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* 右侧 */}
      <div className="flex shrink-0 flex-col items-end gap-2">
        {software.fileSize && (
          <span className="text-[11px] text-[var(--sp-muted)]/60" style={{ fontFamily: 'var(--font-mono)' }}>
            {software.fileSize}
          </span>
        )}
        {hasDownload && (
          <a
            href={downloadHref}
            target={hasLocal ? '_self' : '_blank'}
            rel="noopener noreferrer"
            download={hasLocal ? software.downloadFile! : undefined}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 border border-[var(--sp-accent-teal)] px-3 py-1.5 text-[11px] font-medium tracking-wide text-[var(--sp-accent-teal)] no-underline transition-all duration-300 hover:bg-[var(--sp-accent-teal)] hover:text-[var(--sp-ground)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <Download size={11} strokeWidth={1.5} />
            下载
          </a>
        )}
        {!hasDownload && software.officialUrl && (
          <a
            href={software.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 border border-[var(--sp-hairline)] px-3 py-1.5 text-[11px] text-[var(--sp-muted)] no-underline transition-colors hover:text-[var(--sp-ink)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <ExternalLink size={11} strokeWidth={1.5} />
            官网
          </a>
        )}
      </div>
    </motion.article>
  )
}

/* ═══════════════════════════════════════════════════════
   导出 — 按 variant 分发
   ═══════════════════════════════════════════════════════ */
export function SoftwareCard({ software, variant }: SoftwareCardProps) {
  if (variant === 'list') return <ListCard software={software} />
  return <GridCard software={software} />
}
