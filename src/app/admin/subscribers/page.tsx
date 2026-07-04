'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, X, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type SubscriberStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

interface Subscriber {
  id: number
  email: string
  status: SubscriberStatus
  token: string
  createdAt: string
  approvedAt: string | null
}

const STATUS_LABELS: Record<SubscriberStatus, string> = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已拒绝',
}

const STATUS_CLASSES: Record<SubscriberStatus, string> = {
  PENDING: 'text-amber-600 bg-amber-50 border-amber-200',
  APPROVED: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  REJECTED: 'text-red-500 bg-red-50 border-red-200',
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [filter, setFilter] = useState<SubscriberStatus | 'ALL'>('ALL')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)

  const fetchSubscribers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.set('status', filter)
      const res = await fetch(`/api/admin/subscribers?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSubscribers(data.subscribers)
    } catch {
      toast.error('加载订阅者列表失败')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  async function handleAction(id: number, action: 'APPROVED' | 'REJECTED' | 'DELETE') {
    setActionId(id)
    try {
      if (action === 'DELETE') {
        const res = await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error()
        toast.success('已删除')
      } else {
        const res = await fetch(`/api/admin/subscribers/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: action }),
        })
        if (!res.ok) throw new Error()
        toast.success(action === 'APPROVED' ? '已审核通过' : '已拒绝')
      }
      await fetchSubscribers()
    } catch {
      toast.error('操作失败')
    } finally {
      setActionId(null)
    }
  }

  const tabs: { key: SubscriberStatus | 'ALL'; label: string }[] = [
    { key: 'ALL', label: '全部' },
    { key: 'PENDING', label: '待审核' },
    { key: 'APPROVED', label: '已通过' },
    { key: 'REJECTED', label: '已拒绝' },
  ]

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      <h1
        className="mb-8 text-2xl font-bold text-[var(--sp-ink)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        订阅管理
      </h1>

      {/* 筛选标签 */}
      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="px-3 py-1.5 text-sm border transition-colors cursor-pointer"
            style={{
              fontFamily: 'var(--font-sans)',
              borderColor: filter === tab.key ? 'var(--sp-ink)' : 'var(--sp-hairline)',
              color: filter === tab.key ? 'var(--sp-ink)' : 'var(--sp-muted)',
              fontWeight: filter === tab.key ? 600 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="flex items-center gap-2 text-[var(--sp-muted)] py-12 justify-center">
          <Loader2 size={16} className="animate-spin" />
          加载中...
        </div>
      ) : subscribers.length === 0 ? (
        <p className="py-12 text-center text-[var(--sp-muted)]">暂无数据</p>
      ) : (
        <div className="overflow-x-auto border border-[var(--sp-hairline)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--sp-hairline)] bg-[var(--sp-surface)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--sp-muted)]">邮箱</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--sp-muted)]">状态</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--sp-muted)] hidden sm:table-cell">
                  申请时间
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--sp-muted)] hidden sm:table-cell">
                  审核时间
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--sp-muted)]">操作</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-[var(--sp-hairline)] last:border-0 hover:bg-[var(--sp-hairline)]/20"
                >
                  <td className="px-4 py-3 text-[var(--sp-ink)]">{sub.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block border px-2 py-0.5 text-xs ${STATUS_CLASSES[sub.status]}`}
                    >
                      {STATUS_LABELS[sub.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--sp-muted)] hidden sm:table-cell">
                    {new Date(sub.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3 text-[var(--sp-muted)] hidden sm:table-cell">
                    {sub.approvedAt
                      ? new Date(sub.approvedAt).toLocaleDateString('zh-CN')
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {sub.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleAction(sub.id, 'APPROVED')}
                          disabled={actionId === sub.id}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-50"
                          title="通过"
                        >
                          {actionId === sub.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Check size={15} />
                          )}
                        </button>
                      )}
                      {sub.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleAction(sub.id, 'REJECTED')}
                          disabled={actionId === sub.id}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
                          title="拒绝"
                        >
                          <X size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(sub.id, 'DELETE')}
                        disabled={actionId === sub.id}
                        className="p-1.5 text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                        title="删除"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
