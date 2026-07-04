'use client'

import { motion } from 'framer-motion'
import { FileText, Layout, Printer } from 'lucide-react'

export type ResumeView = 'a4' | 'web'

interface ViewToggleProps {
  view: ResumeView
  onChange: (view: ResumeView) => void
  onPrintPdf: () => void
}

/**
 * 简历工具栏 —— 右上角
 *
 * 包含: 视图切换 (A4简历 / 网页展示) + 打印为PDF 按钮
 */
export function ViewToggle({ view, onChange, onPrintPdf }: ViewToggleProps) {
  return (
    <div
      className="no-print flex flex-col items-end gap-1.5 pr-15 pl-6 pt-6 pb-1"
      data-view-toggle
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* 视图切换器 */}
      <div className="relative flex rounded-none border border-[var(--sp-hairline)] bg-[var(--sp-surface)] p-0.5">
        {/* 滑动指示器 */}
        <motion.div
          className="absolute top-0.5 h-[calc(100%-4px)] rounded-none bg-[var(--sp-accent-teal)]"
          initial={false}
          animate={{
            left: view === 'a4' ? '2px' : 'calc(50% + 0px)',
            width: 'calc(50% - 3px)',
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />

        <button
          type="button"
          onClick={() => onChange('a4')}
          className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 text-sm transition-colors ${
            view === 'a4' ? 'text-[var(--sp-ground)]' : 'text-[var(--sp-muted)] hover:text-[var(--sp-ink)]'
          }`}
        >
          <FileText size={13} />
          <span>A4 简历</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('web')}
          className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 text-sm transition-colors ${
            view === 'web' ? 'text-[var(--sp-ground)]' : 'text-[var(--sp-muted)] hover:text-[var(--sp-ink)]'
          }`}
        >
          <Layout size={13} />
          <span>网页展示</span>
        </button>
      </div>

      {/* 打印为 PDF */}
      <button
        type="button"
        onClick={onPrintPdf}
        className="flex items-center gap-1.5 border border-[var(--sp-hairline)] bg-[var(--sp-surface)] px-3.5 py-1.5 text-sm text-[var(--sp-muted)] transition-colors hover:border-[var(--sp-accent-teal)] hover:text-[var(--sp-accent-teal)]"
      >
        <Printer size={13} />
        <span>打印 PDF</span>
      </button>
    </div>
  )
}
