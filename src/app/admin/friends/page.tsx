'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Link2, Globe, Eye, EyeOff, ExternalLink, Mail, MessageSquare, Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface FriendLink {
  id: number
  name: string
  url: string
  description: string | null
  iconUrl: string | null
  email: string | null
  message: string | null
  sortOrder: number
  status: string
  createdAt: string
  updatedAt: string
}

export default function AdminFriendsPage() {
  const [friends, setFriends] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 表单
  const [form, setForm] = useState({
    name: '',
    url: '',
    description: '',
    iconUrl: '',
    email: '',
    message: '',
    status: 'APPROVED',
  })

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/friends')
      if (res.ok) {
        setFriends(await res.json())
      } else {
        toast.error('加载友链列表失败')
      }
    } catch {
      toast.error('网络错误，请刷新页面')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFriends() }, [fetchFriends])

  async function addFriend() {
    if (!form.name.trim()) { toast.error('请输入友站名称'); return }
    if (!form.url.trim()) { toast.error('请输入友站链接'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          url: form.url.trim(),
          description: form.description.trim() || null,
          iconUrl: form.iconUrl.trim() || null,
          email: form.email.trim() || null,
          message: form.message.trim() || null,
          sortOrder: friends.length,
          status: form.status,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('已添加友链')
      setForm({ name: '', url: '', description: '', iconUrl: '', email: '', message: '', status: 'APPROVED' })
      fetchFriends()
    } catch { toast.error('添加失败') } finally { setSaving(false) }
  }

  async function updateStatus(id: number, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/friends/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      const labels: Record<string, string> = { APPROVED: '已审批', PENDING: '已设为待审核', REJECTED: '已拒绝' }
      toast.success(labels[newStatus] || '状态已更新')
      fetchFriends()
    } catch { toast.error('操作失败') }
  }

  async function deleteFriend(id: number, name: string) {
    if (!confirm(`确定删除友链「${name}」？`)) return
    try {
      await fetch(`/api/admin/friends/${id}`, { method: 'DELETE' })
      toast.success('已删除')
      fetchFriends()
    } catch { toast.error('删除失败') }
  }

  const pendingCount = friends.filter((f) => f.status === 'PENDING').length

  if (loading) {
    return (
      <p className="text-sm text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>
        加载中...
      </p>
    )
  }

  return (
    <div>
      <h1
        className="mb-2 font-display text-2xl font-bold text-[var(--sp-ink)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        友链管理
      </h1>
      <p
        className="mb-8 text-sm text-[var(--sp-muted)]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        管理博客的友情链接。
        {pendingCount > 0 && (
          <span className="ml-2 inline-flex items-center gap-1 text-[var(--sp-accent-sienna)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--sp-accent-sienna)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--sp-accent-sienna)]" />
            </span>
            {pendingCount} 条待审核
          </span>
        )}
      </p>

      {/* 添加新友链 */}
      <div className="mb-8 border border-[var(--sp-hairline)] p-5 bg-[var(--sp-surface)]/50">
        <h2
          className="mb-4 font-display text-sm font-bold text-[var(--sp-ink)] uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          添加友链
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="友站名称 *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]"
            style={{ fontFamily: 'var(--font-sans)' }}
            onKeyDown={(e) => e.key === 'Enter' && addFriend()}
          />
          <input
            type="url"
            placeholder="链接 (https://...) *"
            value={form.url}
            onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
            className="border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]"
            style={{ fontFamily: 'var(--font-sans)' }}
            onKeyDown={(e) => e.key === 'Enter' && addFriend()}
          />
          <input
            type="text"
            placeholder="简介（可选）"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]"
            style={{ fontFamily: 'var(--font-sans)' }}
            onKeyDown={(e) => e.key === 'Enter' && addFriend()}
          />
          <input
            type="text"
            placeholder="头像/图标 URL（可选）"
            value={form.iconUrl}
            onChange={(e) => setForm((p) => ({ ...p, iconUrl: e.target.value }))}
            className="border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]"
            style={{ fontFamily: 'var(--font-sans)' }}
            onKeyDown={(e) => e.key === 'Enter' && addFriend()}
          />
          <input
            type="email"
            placeholder="邮箱（可选）"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]"
            style={{ fontFamily: 'var(--font-sans)' }}
            onKeyDown={(e) => e.key === 'Enter' && addFriend()}
          />
          <input
            type="text"
            placeholder="申请留言（可选）"
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            className="border-b border-[var(--sp-hairline)] bg-transparent py-2 text-sm text-[var(--sp-ink)] outline-none focus:border-[var(--sp-accent-teal)]"
            style={{ fontFamily: 'var(--font-sans)' }}
            onKeyDown={(e) => e.key === 'Enter' && addFriend()}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <select
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            className="border border-[var(--sp-hairline)] bg-transparent px-3 py-2 text-sm text-[var(--sp-ink)] outline-none"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <option value="APPROVED">已审批 (展示)</option>
            <option value="PENDING">待审核 (隐藏)</option>
            <option value="REJECTED">已拒绝 (隐藏)</option>
          </select>
          <button
            onClick={addFriend}
            disabled={saving}
            className="inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-4 py-2 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <Plus size={14} /> 添加
          </button>
        </div>
      </div>

      {/* 友链列表 */}
      {friends.length > 0 ? (
        <div className="space-y-3">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="border border-[var(--sp-hairline)] p-4 transition-colors hover:bg-[var(--sp-surface)]/30"
            >
              <div className="flex items-start gap-4">
                {/* 图标 —— 通过代理加载，与前台一致 */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--sp-surface-alt)] overflow-hidden border border-[var(--sp-hairline)]/40">
                  <img
                    src={`/api/favicon-proxy?site=${encodeURIComponent(friend.url)}&name=${encodeURIComponent(friend.name)}`}
                    alt={friend.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // 加载失败时隐藏 img，显示 Globe 占位
                      (e.target as HTMLImageElement).style.display = 'none'
                      const fallback = (e.target as HTMLImageElement).nextElementSibling
                      if (fallback) (fallback as HTMLElement).style.display = 'flex'
                    }}
                  />
                  <Globe size={18} className="text-[var(--sp-hairline)]" style={{ display: 'none' }} />
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className="font-display text-base font-semibold text-[var(--sp-ink)]"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {friend.name}
                    </p>
                    {/* 状态标签 */}
                    {friend.status === 'PENDING' && (
                      <span
                        className="shrink-0 border border-[var(--sp-accent-sienna)]/40 px-1.5 py-0.5 text-[10px] uppercase text-[var(--sp-accent-sienna)]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        待审核
                      </span>
                    )}
                    {friend.status === 'REJECTED' && (
                      <span
                        className="shrink-0 border border-[var(--sp-muted)]/30 px-1.5 py-0.5 text-[10px] uppercase text-[var(--sp-muted)]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        已拒绝
                      </span>
                    )}
                  </div>

                  {/* URL + 邮箱 */}
                  <div className="mt-1 flex items-center gap-3 flex-wrap text-xs text-[var(--sp-muted)]">
                    <span
                      className="truncate max-w-[300px]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {friend.url}
                    </span>
                    {friend.email && (
                      <span
                        className="inline-flex items-center gap-1"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        <Mail size={10} />
                        {friend.email}
                      </span>
                    )}
                  </div>

                  {/* 简介 + 留言 */}
                  {(friend.description || friend.message) && (
                    <div className="mt-1.5 space-y-0.5">
                      {friend.description && (
                        <p
                          className="text-xs text-[var(--sp-muted)]/70"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {friend.description}
                        </p>
                      )}
                      {friend.message && (
                        <p
                          className="inline-flex items-start gap-1 text-xs text-[var(--sp-accent-teal)]/70 italic"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          <MessageSquare size={10} className="mt-0.5 shrink-0" />
                          {friend.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 排序 */}
                <span
                  className="shrink-0 text-xs text-[var(--sp-muted)]/50 mt-1"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  #{friend.sortOrder}
                </span>

                {/* 操作按钮 */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* 待审核 → 审批/拒绝 */}
                  {friend.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateStatus(friend.id, 'APPROVED')}
                        className="rounded-none p-2 text-[var(--sp-muted)] hover:text-green-600 hover:bg-[var(--sp-surface)] transition-colors cursor-pointer"
                        title="审批通过"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => updateStatus(friend.id, 'REJECTED')}
                        className="rounded-none p-2 text-[var(--sp-muted)] hover:text-[var(--sp-accent-sienna)] hover:bg-[var(--sp-surface)] transition-colors cursor-pointer"
                        title="拒绝"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  {/* 已审批 → 可隐藏 */}
                  {friend.status === 'APPROVED' && (
                    <button
                      onClick={() => updateStatus(friend.id, 'PENDING')}
                      className="rounded-none p-2 text-[var(--sp-muted)] hover:text-[var(--sp-accent-sienna)] hover:bg-[var(--sp-surface)] transition-colors cursor-pointer"
                      title="隐藏"
                    >
                      <EyeOff size={16} />
                    </button>
                  )}
                  {/* 已拒绝 → 可重新审批 */}
                  {friend.status === 'REJECTED' && (
                    <button
                      onClick={() => updateStatus(friend.id, 'APPROVED')}
                      className="rounded-none p-2 text-[var(--sp-muted)] hover:text-green-600 hover:bg-[var(--sp-surface)] transition-colors cursor-pointer"
                      title="重新审批"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  <a
                    href={friend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-none p-2 text-[var(--sp-muted)] hover:text-[var(--sp-accent-blue)] hover:bg-[var(--sp-surface)] transition-colors"
                    title="打开链接"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => deleteFriend(friend.id, friend.name)}
                    className="rounded-none p-2 text-[var(--sp-muted)] hover:text-[var(--sp-accent-sienna)] hover:bg-[var(--sp-surface)] transition-colors cursor-pointer"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p
          className="py-12 text-center text-sm text-[var(--sp-muted)]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          暂无友链。添加第一个友链吧。
        </p>
      )}

      {/* 状态说明 */}
      <div
        className="mt-8 border-t border-[var(--sp-hairline)]/40 pt-6 text-xs text-[var(--sp-muted)]/60 space-y-1"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <p><strong className="text-[var(--sp-ink)]/60">APPROVED</strong> — 在前台友链页面展示</p>
        <p><strong className="text-[var(--sp-ink)]/60">PENDING</strong> — 用户提交的申请，等待审核</p>
        <p><strong className="text-[var(--sp-ink)]/60">REJECTED</strong> — 已拒绝，不在前台展示</p>
      </div>
    </div>
  )
}
