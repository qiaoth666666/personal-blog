'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function DeleteSoftwareButton({
  id,
  name,
}: {
  id: number
  name: string
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    try {
      const res = await fetch(`/api/admin/software/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      alert('删除失败')
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2 text-xs" style={{ fontFamily: 'var(--font-sans)' }}>
        确认删除？
        <button
          onClick={handleDelete}
          className="text-[var(--sp-accent-sienna)] hover:underline"
        >
          是
        </button>
        <span className="text-[var(--sp-muted)]">/</span>
        <button
          onClick={() => setConfirming(false)}
          className="text-[var(--sp-muted)] hover:underline"
        >
          否
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-[var(--sp-muted)] hover:text-[var(--sp-accent-sienna)]"
      aria-label={`删除 ${name}`}
    >
      <Trash2 size={16} />
    </button>
  )
}
