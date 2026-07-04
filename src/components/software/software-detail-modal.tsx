'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X, Download, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Software } from '@/types/db'

/** 按分类映射 accent 色 */
function getAccentColor(category: string | null): string {
  const cat = category?.toLowerCase() ?? ''
  if (cat.includes('设计') || cat.includes('创意')) return 'var(--sp-accent-sienna)'
  if (cat.includes('开发') || cat.includes('编程')) return 'var(--sp-accent-blue)'
  return 'var(--sp-accent-teal)'
}

interface SoftwareDetailModalProps {
  software: Software | null
  onClose: () => void
}

export function SoftwareDetailModal({ software, onClose }: SoftwareDetailModalProps) {
  useEffect(() => {
    if (!software) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [software, onClose])

  const platforms = software?.platform
    ? software.platform.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const accent = getAccentColor(software?.category ?? null)

  return (
    <AnimatePresence>
      {software && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-[var(--sp-ink)]/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative z-10 flex w-full max-w-lg flex-col border border-[var(--sp-hairline)] bg-[var(--sp-ground)]"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center border border-[var(--sp-hairline)] bg-[var(--sp-ground)] transition-colors hover:border-[var(--sp-accent-sienna)] hover:text-[var(--sp-accent-sienna)]"
              aria-label="关闭"
            >
              <X size={16} strokeWidth={1.5} />
            </button>

            {/* 图标 — accent 浅色背景 */}
            <div
              className="relative flex h-48 items-center justify-center"
              style={{ backgroundColor: `color-mix(in srgb, ${accent} 8%, var(--sp-surface))` }}
            >
              {software.iconUrl ? (
                <Image
                  src={software.iconUrl}
                  alt={software.name}
                  width={120}
                  height={120}
                  className="object-contain"
                />
              ) : (
                <Package
                  size={72}
                  strokeWidth={1}
                  style={{ color: `color-mix(in srgb, ${accent} 30%, transparent)` }}
                />
              )}
            </div>

            {/* 信息 */}
            <div className="flex flex-col gap-3 p-6">
              {software.category && (
                <span
                  className="self-start border border-[var(--sp-hairline)] px-3 py-1 text-xs uppercase tracking-wider text-[var(--sp-muted)]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {software.category}
                </span>
              )}

              <h2
                className="font-display text-2xl font-bold text-[var(--sp-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {software.name}
              </h2>

              <div className="flex flex-wrap gap-3 text-sm text-[var(--sp-muted)]">
                {software.version && (
                  <span style={{ fontFamily: 'var(--font-mono)' }}>v{software.version}</span>
                )}
                {software.fileSize && (
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{software.fileSize}</span>
                )}
              </div>

              {/* 平台标签 */}
              {platforms.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {platforms.map((p) => (
                    <span
                      key={p}
                      className="border border-[var(--sp-hairline)] px-2 py-0.5 text-xs text-[var(--sp-muted)]"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {software.description && (
                <p
                  className="mt-2 leading-relaxed text-[var(--sp-ink)]/80"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {software.description}
                </p>
              )}

              {software.notes && (
                <div
                  className="mt-2 border-l-2 border-[var(--sp-accent-teal)] bg-[var(--sp-surface)] p-4 text-sm leading-relaxed text-[var(--sp-ink)]/70"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {software.notes}
                </div>
              )}

              {software.downloadUrl && (
                <a
                  href={software.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 border-2 border-[var(--sp-accent-teal)] bg-[var(--sp-accent-teal)] px-5 py-3 text-sm font-medium text-[var(--sp-ground)] no-underline transition-colors hover:bg-transparent hover:text-[var(--sp-accent-teal)]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  <Download size={16} strokeWidth={1.5} />
                  下载 {software.name}
                  {software.version ? ` v${software.version}` : ''}
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
