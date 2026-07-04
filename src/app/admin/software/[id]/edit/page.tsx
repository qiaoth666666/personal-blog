import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { queryOne } from '@/lib/db'
import type { Software } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { SoftwareForm } from '../../software-form'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditSoftwarePage({ params }: Props) {
  const { id } = await params
  let software: (Software & RowDataPacket) | null = null
  try {
    software = await queryOne<Software & RowDataPacket>(
      'SELECT * FROM `Software` WHERE id = ?', [parseInt(id, 10)],
    )
  } catch {}
  if (!software) notFound()

  return (
    <div>
      <Link
        href="/admin/software"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--sp-muted)] no-underline transition-colors hover:text-[var(--sp-ink)]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        返回软件列表
      </Link>
      <h1
        className="mb-8 font-display text-2xl font-bold text-[var(--sp-ink)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        编辑「{software.name}」
      </h1>
      <SoftwareForm software={software} />
    </div>
  )
}
