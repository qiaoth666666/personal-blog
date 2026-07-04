'use client'

import { ArrowUpDown } from 'lucide-react'

export type SortKey = 'name' | 'fileSize'

interface SortControlProps {
  value: SortKey
  asc: boolean
  onKeyChange: (key: SortKey) => void
  onOrderToggle: () => void
}

const LABELS: Record<SortKey, string> = {
  name: '按名称',
  fileSize: '按大小',
}

export function SortControl({
  value,
  asc,
  onKeyChange,
  onOrderToggle,
}: SortControlProps) {
  return (
    <div
      className="flex items-center gap-0.5"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <ArrowUpDown
        size={11}
        strokeWidth={1.5}
        className="mr-0.5 text-[var(--sp-muted)]/35"
      />
      <select
        value={value}
        onChange={(e) => onKeyChange(e.target.value as SortKey)}
        className="appearance-none bg-transparent text-[11px] text-[var(--sp-muted)]/55 outline-none cursor-pointer hover:text-[var(--sp-ink)] transition-colors border-b border-transparent hover:border-[var(--sp-hairline)] py-0.5"
      >
        <option value="name">{LABELS.name}</option>
        <option value="fileSize">{LABELS.fileSize}</option>
      </select>
      <button
        onClick={onOrderToggle}
        className="text-[11px] text-[var(--sp-muted)]/50 hover:text-[var(--sp-ink)] transition-colors cursor-pointer select-none ml-0.5"
        title={asc ? '升序 ↑' : '降序 ↓'}
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {asc ? '↑' : '↓'}
      </button>
    </div>
  )
}
