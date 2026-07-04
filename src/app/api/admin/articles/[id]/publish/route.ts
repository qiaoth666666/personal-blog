import { NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import type { Article } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { invalidateHome } from '@/lib/cache-keys'
import { notifySubscribers } from '@/lib/mailer'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { id } = await params
    const body = await request.json()
    const { published } = body

    const existing = await queryOne<Article & RowDataPacket>(
      'SELECT published, title, slug, excerpt FROM `Article` WHERE id = ?',
      [parseInt(id, 10)],
    )
    if (!existing) return NextResponse.json({ error: '文章不存在' }, { status: 404 })

    await execute(
      'UPDATE `Article` SET published = ? WHERE id = ?',
      [published, parseInt(id, 10)],
    )
    invalidateHome()

    // 首次发布时通知订阅者
    if (published && !existing.published) {
      notifySubscribers('article', {
        title: existing.title,
        slug: existing.slug,
        excerpt: existing.excerpt,
      }).catch(console.error)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
