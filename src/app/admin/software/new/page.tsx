import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SoftwareForm } from '../software-form'

export default function NewSoftwarePage() {
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
        添加软件
      </h1>
      <SoftwareForm />
    </div>
  )
}
