import { query } from '@/lib/db'
import type { GuestbookMessage } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { ApproveButton, RejectButton, DeleteMsgButton, ReplySection } from './action-buttons'

/** 递归打平所有子孙回复 */
function flattenReplies(replies: ReplyMsg[]): ReplyMsg[] {
  return replies.flatMap((r) => [r, ...flattenReplies(r.replies || [])])
}

type ReplyMsg = {
  id: number
  nickname: string
  content: string
  status: string
  isAdmin: boolean
  createdAt: Date
  replies: ReplyMsg[]
}

export default async function AdminGuestbookPage() {
  let messages: Array<{
    id: number
    nickname: string
    email: string | null
    content: string
    status: string
    ipProvince: string | null
    ipCity: string | null
    deviceType: string | null
    parentId: number | null
    isAdmin: boolean
    createdAt: Date
    replies: ReplyMsg[]
  }> = []

  try {
    // 一次查出所有留言，内存中构建树
    const all = await query<GuestbookMessage & RowDataPacket>(
      'SELECT * FROM `GuestbookMessage` ORDER BY createdAt DESC LIMIT 500',
    )

    // 按 parentId 分组
    const childrenMap = new Map<number, typeof all>()
    for (const m of all) {
      if (m.parentId !== null) {
        const arr = childrenMap.get(m.parentId) || []
        arr.push(m)
        childrenMap.set(m.parentId, arr)
      }
    }

    // 递归附加子孙
    function attachDescendants(id: number): any[] {
      const direct = childrenMap.get(id) || []
      return direct.map((d) => ({
        ...d,
        replies: attachDescendants(d.id),
      }))
    }

    messages = all
      .filter((m) => m.parentId === null)
      .slice(0, 100)
      .map((m) => ({
        ...m,
        replies: attachDescendants(m.id),
      }))
  } catch {}

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
        留言审核
      </h1>

      <div className="border-t border-[var(--sp-hairline)]">
        {messages.length > 0 ? (
          messages.map((m) => {
            const allReplies = flattenReplies(m.replies)
            return (
              <div key={m.id} className="border-b border-[var(--sp-hairline)]">
                {/* 主留言 */}
                <div className="px-3 py-5">
                  <MessageMeta m={m} />
                  <p className="mt-2 text-sm leading-relaxed text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {m.content}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.status === 'PENDING' && (
                      <>
                        <ApproveButton id={m.id} />
                        <RejectButton id={m.id} />
                      </>
                    )}
                    {m.status !== 'REJECTED' && <ReplySection parentId={m.id} />}
                    <DeleteMsgButton id={m.id} />
                  </div>
                </div>

                {/* 回复列表 —— 扁平，统一缩进 */}
                {allReplies.length > 0 && (
                  <div className="ml-6 border-l-2 border-[var(--sp-hairline)]/40 pl-3 mb-3">
                    {allReplies.map((reply, i) => (
                      <div
                        key={reply.id}
                        className={`py-2.5 ${i > 0 ? 'border-t border-[var(--sp-hairline)]/15' : ''} ${reply.status === 'PENDING' ? 'bg-yellow-50/50 -mx-3 px-3' : ''}`}
                      >
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                          <span className="font-display font-semibold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
                            {reply.nickname}
                          </span>
                          {reply.isAdmin && (
                            <span className="rounded bg-[var(--sp-accent-teal)] px-1 py-px text-[0.6rem] font-medium text-white">UP</span>
                          )}
                          <StatusBadgeMini status={reply.status} />
                          <span className="text-xs text-[var(--sp-muted)]">
                            {new Date(reply.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--sp-ink)]/80" style={{ fontFamily: 'var(--font-serif)' }}>
                          {reply.content}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {reply.status === 'PENDING' && (
                            <>
                              <ApproveButton id={reply.id} />
                              <RejectButton id={reply.id} />
                            </>
                          )}
                          {reply.status !== 'REJECTED' && <ReplySection parentId={reply.id} />}
                          <DeleteMsgButton id={reply.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <p className="py-16 text-center text-sm text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>
            暂无留言
          </p>
        )}
      </div>
    </div>
  )
}

function MessageMeta({ m }: { m: { nickname: string; email: string | null; status: string; ipProvince: string | null; ipCity: string | null; deviceType: string | null; createdAt: Date; isAdmin: boolean } }) {
  const deviceLabels: Record<string, string> = { desktop: '电脑', mobile: '手机', tablet: '平板' }
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ fontFamily: 'var(--font-sans)' }}>
      <span className="font-display text-sm font-semibold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
        {m.nickname}
      </span>
      {m.isAdmin && <span className="rounded bg-[var(--sp-accent-teal)] px-1 py-px text-[0.6rem] font-medium text-white">UP</span>}
      {m.email && <span className="text-[var(--sp-muted)]">{m.email}</span>}
      <StatusBadge status={m.status} />
      <span className="text-[var(--sp-muted)]">
        {new Date(m.createdAt).toLocaleDateString('zh-CN')}{' '}
        {new Date(m.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
      </span>
      {(m.ipProvince || m.ipCity) && (
        <span className="text-[var(--sp-muted)]">
          📍{[m.ipProvince, m.ipCity].filter(Boolean).join(' · ')}
        </span>
      )}
      {m.deviceType && <span className="text-[var(--sp-muted)]">{deviceLabels[m.deviceType] || m.deviceType}</span>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  }
  const labels: Record<string, string> = { PENDING: '待审核', APPROVED: '已通过', REJECTED: '已拒绝' }
  return (
    <span className={`inline-flex items-center px-1.5 py-px text-xs ${colors[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  )
}

function StatusBadgeMini({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  }
  const labels: Record<string, string> = { PENDING: '待审', APPROVED: '通过', REJECTED: '拒绝' }
  return (
    <span className={`inline-flex items-center px-1 py-px text-[0.6rem] ${colors[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  )
}
