import Link from 'next/link'
import { Plus, Edit, Download, ExternalLink, Package } from 'lucide-react'
import { query, count } from '@/lib/db'
import type { Software } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { DeleteSoftwareButton } from './delete-software-button'

export default async function AdminSoftwarePage() {
  let softwareList: Array<{
    id: number
    name: string
    version: string | null
    description: string | null
    category: string | null
    tags: string | null
    downloadFile: string | null
    downloadUrl: string | null
    officialUrl: string | null
    fileSize: string | null
    platform: string | null
    sortOrder: number
    createdAt: Date
  }> = []
  let totalCount = 0
  try {
    ;[softwareList, totalCount] = await Promise.all([
      query<Software & RowDataPacket>(
        'SELECT * FROM `Software` ORDER BY sortOrder ASC',
      ),
      count('Software'),
    ])
  } catch {}

  // 按分类分组统计
  const categoryStats: Record<string, number> = {}
  softwareList.forEach((s) => {
    if (s.category) {
      categoryStats[s.category] = (categoryStats[s.category] || 0) + 1
    }
  })

  return (
    <div>
      {/* 页头 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className="font-display text-2xl font-bold text-[var(--sp-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            软件管理
          </h1>
          <p
            className="mt-1 text-sm text-[var(--sp-muted)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            共 {totalCount} 款软件
            {Object.keys(categoryStats).length > 0 &&
              ` · ${Object.keys(categoryStats).length} 个分类`}
          </p>
        </div>
        <Link
          href="/admin/software/new"
          className="inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-5 py-2.5 text-sm font-medium text-[var(--sp-ground)] no-underline transition-colors hover:bg-transparent hover:text-[var(--sp-ink)]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <Plus size={15} /> 添加软件
        </Link>
      </div>

      {/* 分类统计条 */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(categoryStats)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, count]) => (
              <span
                key={cat}
                className="border border-[var(--sp-hairline)] px-2.5 py-1 text-[11px] uppercase tracking-wider text-[var(--sp-muted)]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {cat}
                <span className="ml-1.5 text-[10px] opacity-50">{count}</span>
              </span>
            ))}
        </div>
      )}

      {/* 软件列表 */}
      <div className="border-t border-[var(--sp-hairline)]">
        {softwareList.length > 0 ? (
          softwareList.map((s) => {
            const hasLocal = !!s.downloadFile
            const hasExternal = !!s.downloadUrl
            return (
              <div
                key={s.id}
                className="flex items-center gap-4 border-b border-[var(--sp-hairline)] px-3 py-3 transition-colors hover:bg-[var(--sp-surface)]/50"
              >
                {/* 排序号 */}
                <span
                  className="w-8 shrink-0 text-center text-xs tabular-nums text-[var(--sp-muted)]/50"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  #{s.sortOrder}
                </span>

                {/* 主信息 */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-serif text-base font-semibold text-[var(--sp-ink)]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {s.name}
                    </span>
                    {s.version && (
                      <span
                        className="text-xs text-[var(--sp-muted)]"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        v{s.version}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    {s.category && (
                      <span
                        className="text-[11px] text-[var(--sp-accent-teal)]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        {s.category}
                      </span>
                    )}
                    {s.platform && (
                      <span
                        className="text-[11px] text-[var(--sp-muted)]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        {s.platform}
                      </span>
                    )}
                    {s.fileSize && (
                      <span
                        className="text-[11px] text-[var(--sp-muted)]"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {s.fileSize}
                      </span>
                    )}
                    {/* 下载状态 */}
                    {hasLocal ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-700">
                        <Download size={10} />
                        本地文件
                      </span>
                    ) : hasExternal ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[var(--sp-accent-teal)]">
                        <ExternalLink size={10} />
                        外链下载
                      </span>
                    ) : (
                      <span className="text-[10px] text-[var(--sp-muted)]/50">
                        无下载
                      </span>
                    )}
                  </div>
                </div>

                {/* 操作 */}
                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/admin/software/${s.id}/edit`}
                    className="text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors"
                    title="编辑"
                  >
                    <Edit size={16} />
                  </Link>
                  <DeleteSoftwareButton id={s.id} name={s.name} />
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-16 text-center">
            <Package
              size={32}
              strokeWidth={1}
              className="mx-auto mb-3 text-[var(--sp-muted)]/30"
            />
            <p
              className="text-sm text-[var(--sp-muted)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              暂无软件，点击上方按钮添加第一个
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
