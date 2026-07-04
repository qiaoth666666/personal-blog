'use client'

import { useState, useCallback, useRef } from 'react'
import { Eye, Pen, Columns2, Bold, Italic, Heading1, Heading2, Heading3, Link, List, Code, Quote } from 'lucide-react'
import { renderMarkdown } from '@/lib/markdown'
import { cn } from '@/lib/utils'

type EditorMode = 'edit' | 'split' | 'preview'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  label?: string
}

const MODES: { mode: EditorMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'edit', icon: <Pen size={13} strokeWidth={1.5} />, label: '编辑' },
  { mode: 'split', icon: <Columns2 size={13} strokeWidth={1.5} />, label: '拆分' },
  { mode: 'preview', icon: <Eye size={13} strokeWidth={1.5} />, label: '预览' },
]

interface ToolbarAction {
  icon: React.ReactNode
  label: string
  syntaxBefore: string
  syntaxAfter?: string
  multiline?: boolean
  blockBefore?: string
  blockAfter?: string
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: <Bold size={14} strokeWidth={1.5} />, label: '加粗', syntaxBefore: '**', syntaxAfter: '**' },
  { icon: <Italic size={14} strokeWidth={1.5} />, label: '斜体', syntaxBefore: '*', syntaxAfter: '*' },
  { icon: <Heading3 size={14} strokeWidth={1.5} />, label: '标题', syntaxBefore: '### ', multiline: true },
  { icon: <Link size={14} strokeWidth={1.5} />, label: '链接', syntaxBefore: '[', syntaxAfter: '](url)' },
  { icon: <List size={14} strokeWidth={1.5} />, label: '列表', syntaxBefore: '- ', multiline: true },
  { icon: <Code size={14} strokeWidth={1.5} />, label: '代码', syntaxBefore: '`', syntaxAfter: '`' },
  { icon: <Quote size={14} strokeWidth={1.5} />, label: '引用', syntaxBefore: '> ', multiline: true },
]

/**
 * Markdown 编辑器 —— 三模式（编辑 / 拆分 / 预览）+ 工具栏
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder = '开始输入 Markdown…',
  minHeight = '420px',
  label,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<EditorMode>('split')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value)
    },
    [onChange],
  )

  const previewHtml = value ? renderMarkdown(value) : ''

  /** 在光标位置插入 Markdown 语法 */
  const insertSyntax = useCallback(
    (action: ToolbarAction) => {
      const ta = textareaRef.current
      if (!ta) return

      const start = ta.selectionStart
      const end = ta.selectionEnd
      const selected = value.substring(start, end)
      const before = value.substring(0, start)
      const after = value.substring(end)

      let insertion: string
      let cursorOffset = 0

      if (action.multiline) {
        // 块级语法：在选中内容每行前加前缀
        if (selected) {
          const prefixed = selected
            .split('\n')
            .map((line) => action.syntaxBefore + line)
            .join('\n')
          insertion = prefixed
          cursorOffset = insertion.length
        } else {
          insertion = action.syntaxBefore
          cursorOffset = insertion.length
        }
      } else if (action.syntaxAfter !== undefined) {
        // 包裹型语法：选中内容被包裹
        if (selected) {
          insertion = action.syntaxBefore + selected + action.syntaxAfter
          cursorOffset = insertion.length
        } else {
          insertion = action.syntaxBefore + action.syntaxAfter
          cursorOffset = action.syntaxBefore.length
        }
      } else {
        insertion = action.syntaxBefore
        cursorOffset = insertion.length
      }

      const newValue = before + insertion + after
      onChange(newValue)

      // 恢复光标位置
      requestAnimationFrame(() => {
        ta.focus()
        const pos = start + cursorOffset
        ta.setSelectionRange(pos, pos)
      })
    },
    [value, onChange],
  )

  return (
    <div className="flex flex-col">
      {/* 标签行 + 工具栏 */}
      <div className="mb-2 flex items-center justify-between gap-2">
        {label && (
          <span
            className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--sp-muted)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {label}
          </span>
        )}

        <div className="flex items-center gap-2">
          {/* 工具栏（仅编辑/拆分模式下显示） */}
          {(mode === 'edit' || mode === 'split') && (
            <div
              className="flex items-center gap-px border border-[var(--sp-hairline)] bg-[var(--sp-surface)] px-1"
              role="toolbar"
              aria-label="Markdown 格式工具栏"
            >
              {TOOLBAR_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => insertSyntax(action)}
                  className="flex items-center justify-center p-1.5 text-[var(--sp-muted)] transition-colors hover:bg-[var(--sp-hairline)]/30 hover:text-[var(--sp-ink)] cursor-pointer"
                  title={action.label}
                  tabIndex={-1}
                >
                  {action.icon}
                </button>
              ))}
            </div>
          )}

          {/* 模式切换 */}
          <div
            className="inline-flex items-center border border-[var(--sp-hairline)] bg-[var(--sp-surface)]"
            role="radiogroup"
            aria-label="编辑器模式"
          >
            {MODES.map((m) => (
              <button
                key={m.mode}
                type="button"
                role="radio"
                aria-checked={mode === m.mode}
                onClick={() => setMode(m.mode)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150 cursor-pointer',
                  'border-r border-[var(--sp-hairline)] last:border-r-0',
                  mode === m.mode
                    ? 'bg-[var(--sp-ink)] text-[var(--sp-ground)]'
                    : 'text-[var(--sp-muted)] hover:text-[var(--sp-ink)] hover:bg-[var(--sp-hairline)]/20',
                )}
                style={{ fontFamily: 'var(--font-sans)' }}
                title={m.label}
              >
                {m.icon}
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 编辑 / 预览区 */}
      <div
        className="flex border border-[var(--sp-hairline)] bg-[var(--sp-surface)]"
        style={{ minHeight }}
      >
        {/* 编辑面板 */}
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn(
              'flex-1 resize-none bg-transparent px-5 py-4 text-sm leading-relaxed outline-none',
              'placeholder:text-[var(--sp-muted)]/30',
              mode === 'split' && 'border-r border-[var(--sp-hairline)]',
            )}
            style={{
              fontFamily: 'var(--font-mono)',
              minHeight,
            }}
            spellCheck={false}
          />
        )}

        {/* 预览面板 */}
        {(mode === 'split' || mode === 'preview') && (
          <div
            className={cn(
              'flex-1 overflow-y-auto px-5 py-4',
              mode === 'preview' && 'w-full',
            )}
          >
            {previewHtml ? (
              <div
                className="prose-custom"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <p
                className="text-sm italic text-[var(--sp-muted)]/30"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                预览将在此显示…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
