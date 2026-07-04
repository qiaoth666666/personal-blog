'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function DeleteArticleButton({ id, title }: { id: number; title: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
      router.refresh()
    } catch {}
    setDeleting(false)
    setConfirming(false)
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2 text-xs" style={{ fontFamily: 'var(--font-sans)' }}>
        <span className="text-[var(--sp-accent-sienna)]">确认删除「{title.slice(0, 10)}...」？</span>
        <button onClick={handleDelete} disabled={deleting} className="text-[var(--sp-accent-sienna)] underline cursor-pointer">是</button>
        <button onClick={() => setConfirming(false)} className="text-[var(--sp-muted)] underline cursor-pointer">否</button>
      </span>
    )
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-[var(--sp-muted)] hover:text-[var(--sp-accent-sienna)] transition-colors cursor-pointer">
      <Trash2 size={16} />
    </button>
  )
}
