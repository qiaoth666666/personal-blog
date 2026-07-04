'use client'

import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CardVariant } from '@/components/software/software-card'

interface ViewSwitcherProps {
  value: CardVariant
  onChange: (v: CardVariant) => void
}

const OPTIONS: { value: CardVariant; label: string; icon: React.ReactNode }[] = [
  { value: 'grid', label: '网格', icon: <LayoutGrid size={14} strokeWidth={1.5} /> },
  { value: 'list', label: '列表', icon: <List size={14} strokeWidth={1.5} /> },
]

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <div
      className="inline-flex items-center border border-[var(--sp-hairline)]"
      role="radiogroup"
      aria-label="视图切换"
    >
      {OPTIONS.map((opt) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all duration-200 cursor-pointer',
              isActive
                ? 'bg-[var(--sp-accent-teal)] text-[var(--sp-ground)]'
                : 'text-[var(--sp-muted)] hover:text-[var(--sp-ink)]',
            )}
            style={{ fontFamily: 'var(--font-sans)' }}
            title={opt.label}
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
