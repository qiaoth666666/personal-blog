'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

interface DownloadLogItem {
  id: number
  fileName: string
  fileSize: number
  ip: string | null
  userAgent: string | null
  downloadedAt: string
}

interface StatsData {
  totalCount: number
  totalBytes: number
  perFile: Array<{ fileName: string; count: number; totalBytes: number; lastDownloaded: string }>
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export default function AdminDownloadsPage() {
  const [logs, setLogs] = useState<DownloadLogItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchLogs(p: number) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/download-logs?page=${p}&pageSize=15`)
      const data = await res.json()
      setLogs(data.logs)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/download-stats')
      setStats(await res.json())
    } catch { /* ignore */ }
  }

  useEffect(() => {
    fetchStats()
    fetchLogs(1)
  }, [])

  useEffect(() => { fetchLogs(page) }, [page]) // eslint-disable-line

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-3xl font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
          下载日志
        </h1>
        <button
          onClick={() => { fetchStats(); fetchLogs(page) }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--sp-muted)] border border-[var(--sp-hairline)] hover:text-[var(--sp-ink)] transition-colors cursor-pointer"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <RefreshCw size={12} />
          刷新
        </button>
      </div>

      {/* 统计概览 */}
      {stats && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="border border-[var(--sp-hairline)] bg-[var(--sp-surface)] p-4">
            <p className="font-display text-2xl font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>{stats.totalCount}</p>
            <p className="text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>总下载次数</p>
          </div>
          <div className="border border-[var(--sp-hairline)] bg-[var(--sp-surface)] p-4">
            <p className="font-display text-2xl font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>{formatFileSize(stats.totalBytes)}</p>
            <p className="text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>总流量</p>
          </div>
          <div className="border border-[var(--sp-hairline)] bg-[var(--sp-surface)] p-4">
            <p className="font-display text-2xl font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>{stats.perFile.length}</p>
            <p className="text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>文件种类</p>
          </div>
        </div>
      )}

      {/* 按文件聚合 */}
      {stats && stats.perFile.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-[var(--sp-ink)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>文件下载排行</h2>
          <div className="border border-[var(--sp-hairline)] overflow-x-auto">
            <table className="w-full text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
              <thead>
                <tr className="border-b border-[var(--sp-hairline)] bg-[var(--sp-surface)]">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--sp-muted)] tracking-wider">文件名</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-[var(--sp-muted)] tracking-wider">下载次数</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-[var(--sp-muted)] tracking-wider">流量</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-[var(--sp-muted)] tracking-wider">最后下载</th>
                </tr>
              </thead>
              <tbody>
                {stats.perFile.map((f, i) => (
                  <tr key={i} className="border-b border-[var(--sp-hairline)]/50 hover:bg-[var(--sp-surface)]/50 transition-colors">
                    <td className="px-4 py-2.5 text-[var(--sp-ink)] truncate max-w-[300px]">{f.fileName}</td>
                    <td className="px-4 py-2.5 text-right text-[var(--sp-muted)]">{f.count}</td>
                    <td className="px-4 py-2.5 text-right text-[var(--sp-muted)]">{formatFileSize(f.totalBytes)}</td>
                    <td className="px-4 py-2.5 text-right text-[var(--sp-muted)]/50 text-xs">{new Date(f.lastDownloaded).toLocaleString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 下载日志明细 */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-bold text-[var(--sp-ink)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>下载明细</h2>
        <div className="border border-[var(--sp-hairline)] overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
            <thead>
              <tr className="border-b border-[var(--sp-hairline)] bg-[var(--sp-surface)]">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--sp-muted)] tracking-wider">文件名</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-[var(--sp-muted)] tracking-wider">大小</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--sp-muted)] tracking-wider">IP</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-[var(--sp-muted)] tracking-wider">时间</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[var(--sp-muted)]">加载中...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[var(--sp-muted)]">暂无下载记录</td>
                </tr>
              ) : (
                logs.map((d) => (
                  <tr key={d.id} className="border-b border-[var(--sp-hairline)]/50 hover:bg-[var(--sp-surface)]/50 transition-colors">
                    <td className="px-4 py-2.5 text-[var(--sp-ink)] truncate max-w-[250px]">{d.fileName}</td>
                    <td className="px-4 py-2.5 text-right text-[var(--sp-muted)]">{formatFileSize(d.fileSize)}</td>
                    <td className="px-4 py-2.5 text-[var(--sp-muted)]/60 font-mono text-xs">{d.ip || '—'}</td>
                    <td className="px-4 py-2.5 text-right text-[var(--sp-muted)]/60 text-xs">{new Date(d.downloadedAt).toLocaleString('zh-CN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
            <span className="text-[var(--sp-muted)]">共 {total} 条</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 border border-[var(--sp-hairline)] disabled:opacity-30 cursor-pointer hover:border-[var(--sp-ink)] transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[var(--sp-muted)] px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 border border-[var(--sp-hairline)] disabled:opacity-30 cursor-pointer hover:border-[var(--sp-ink)] transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
