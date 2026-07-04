'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function PublishButton({ id, published }: { id: number; published: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/articles/${id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !published }),
      })
      if (!res.ok) throw new Error()
      toast.success(published ? '已设为草稿' : '已发布')
      router.refresh()
    } catch {
      toast.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={published ? '取消发布' : '发布文章'}
      className={`inline-flex items-center gap-1 text-xs transition-colors cursor-pointer disabled:opacity-40 ${
        published ? 'text-green-700 hover:text-red-600' : 'text-[var(--sp-muted)] hover:text-green-700'
      }`}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {published ? <Eye size={14} /> : <EyeOff size={14} />}
      {loading ? '...' : published ? '已发布' : '草稿'}
    </button>
  )
}
