import { query, count } from '@/lib/db'
import type { Article } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { FileText, Package, MessageSquare, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  let stats = { articles: 0, software: 0, pending: 0, totalMessages: 0 }
  let recentArticles: Array<{ id: number; title: string; createdAt: Date; published: boolean }> = []

  try {
    const [articleCount, softwareCount, pendingCount, totalMsgCount, recent] = await Promise.all([
      count('Article'),
      count('Software'),
      count('GuestbookMessage', 'status = ?', ['PENDING']),
      count('GuestbookMessage'),
      query<Pick<Article, 'id' | 'title' | 'createdAt' | 'published'> & RowDataPacket>(
        'SELECT id, title, createdAt, published FROM `Article` ORDER BY createdAt DESC LIMIT 5',
      ),
    ])
    stats = { articles: articleCount, software: softwareCount, pending: pendingCount, totalMessages: totalMsgCount }
    recentArticles = recent
  } catch {}

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>仪表盘</h1>

      {/* 统计卡片 */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<FileText size={20} />} label="文章总数" value={stats.articles} href="/admin/articles" />
        <StatCard icon={<Package size={20} />} label="软件总数" value={stats.software} href="/admin/software" />
        <StatCard icon={<MessageSquare size={20} />} label="留言总数" value={stats.totalMessages} href="/admin/guestbook" />
        <StatCard
          icon={<AlertCircle size={20} />}
          label="待审核"
          value={stats.pending}
          href="/admin/guestbook"
          highlight={stats.pending > 0}
        />
      </div>

      {/* 最近文章 */}
      <div className="mt-12">
        <h2 className="font-display text-xl font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>最近文章</h2>
        <div className="mt-4 border-t border-[var(--sp-hairline)]">
          {recentArticles.length > 0 ? (
            recentArticles.map((a) => (
              <Link
                key={a.id}
                href={`/admin/articles/${a.id}/edit`}
                className="flex items-center justify-between border-b border-[var(--sp-hairline)] px-2 py-3 text-sm text-[var(--sp-ink)] no-underline transition-colors hover:bg-[var(--sp-surface)]"
              >
                <span style={{ fontFamily: 'var(--font-serif)' }}>{a.title}</span>
                <span className="flex items-center gap-3 text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>
                  {a.published ? '已发布' : '草稿'}
                  <span>{new Date(a.createdAt).toLocaleDateString('zh-CN')}</span>
                </span>
              </Link>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>暂无文章</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, href, highlight }: {
  icon: React.ReactNode; label: string; value: number; href: string; highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 border border-[var(--sp-hairline)] bg-[var(--sp-surface)] p-5 no-underline transition-colors hover:border-[var(--sp-accent-teal)]"
    >
      <div className={highlight ? 'text-[var(--sp-accent-sienna)]' : 'text-[var(--sp-accent-teal)]'}>{icon}</div>
      <div>
        <p className="font-display text-2xl font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
        <p className="text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>{label}</p>
      </div>
    </Link>
  )
}
