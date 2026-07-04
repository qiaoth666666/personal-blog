'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Trash2, Reply } from 'lucide-react'

function buttonClass(c: string) {
  return `inline-flex items-center gap-1 border px-2 py-1 text-xs transition-colors cursor-pointer ${c}`
}

export function ApproveButton({ id }: { id: number }) {
  const router = useRouter()
  async function act() {
    await fetch(`/api/admin/guestbook/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED' }),
    })
    router.refresh()
  }
  return (
    <button onClick={act} className={buttonClass('border-green-300 text-green-700 hover:bg-green-50')}>
      <Check size={12} /> 通过
    </button>
  )
}

export function RejectButton({ id }: { id: number }) {
  const router = useRouter()
  async function act() {
    await fetch(`/api/admin/guestbook/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED' }),
    })
    router.refresh()
  }
  return (
    <button onClick={act} className={buttonClass('border-red-300 text-red-700 hover:bg-red-50')}>
      <X size={12} /> 拒绝
    </button>
  )
}

export function DeleteMsgButton({ id }: { id: number }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  async function del() {
    await fetch(`/api/admin/guestbook/${id}`, { method: 'DELETE' })
    router.refresh()
  }
  if (confirming) {
    return (
      <span className="flex items-center gap-1 text-xs">
        <span className="text-[var(--sp-accent-sienna)]">确认？</span>
        <button onClick={del} className="text-[var(--sp-accent-sienna)] underline cursor-pointer">
          是
        </button>
        <button onClick={() => setConfirming(false)} className="text-[var(--sp-muted)] underline cursor-pointer">
          否
        </button>
      </span>
    )
  }
  return (
    <button onClick={() => setConfirming(true)} className={buttonClass('border-gray-300 text-gray-600 hover:bg-gray-50')}>
      <Trash2 size={12} />
    </button>
  )
}

/**
 * 管理员回复 —— 内联展开 + 自动通过 + 标记博主
 */
export function ReplySection({ parentId }: { parentId: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/guestbook/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId, content: content.trim() }),
      })
      if (!res.ok) throw new Error()
      setContent('')
      setOpen(false)
      router.refresh()
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={buttonClass('border-[var(--sp-accent-teal)]/40 text-[var(--sp-accent-teal)] hover:bg-[var(--sp-accent-teal)]/5')}
      >
        <Reply size={12} /> 回复
      </button>
    )
  }

  return (
    <div className="w-full space-y-2 mt-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="输入博主回复..."
        maxLength={500}
        rows={2}
        className="w-full border border-[var(--sp-hairline)] bg-[var(--sp-ground)] px-3 py-2 text-sm text-[var(--sp-ink)] outline-none resize-none focus:border-[var(--sp-accent-teal)]"
        style={{ fontFamily: 'var(--font-serif)' }}
        autoFocus
      />
      <div className="flex items-center gap-2">
        <button
          onClick={submit}
          disabled={submitting || !content.trim()}
          className="inline-flex items-center gap-1 border border-[var(--sp-accent-teal)] bg-[var(--sp-accent-teal)] px-2.5 py-1 text-xs text-white transition-colors hover:bg-transparent hover:text-[var(--sp-accent-teal)] disabled:opacity-50 cursor-pointer"
        >
          {submitting ? '提交中...' : '提交回复'}
        </button>
        <button
          onClick={() => { setOpen(false); setContent('') }}
          className="text-xs text-[var(--sp-muted)] hover:text-[var(--sp-ink)] cursor-pointer"
        >
          取消
        </button>
      </div>
    </div>
  )
}
