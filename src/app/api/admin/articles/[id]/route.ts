import { NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import type { Article } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { invalidateHome } from '@/lib/cache-keys'
import { notifySubscribers } from '@/lib/mailer'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { id } = await params
    const body = await request.json()
    const { title, slug, content, excerpt, category, tags, published } = body

    // 检查此前是否已发布（用于判断是否为首次发布）
    const existing = await queryOne<Article & RowDataPacket>(
      'SELECT published FROM `Article` WHERE id = ?', [parseInt(id, 10)],
    )

    await execute(
      'UPDATE `Article` SET title = ?, slug = ?, content = ?, excerpt = ?, category = ?, tags = ?, published = ? WHERE id = ?',
      [title, slug, content, excerpt || null, category || null, tags || null, published, parseInt(id, 10)],
    )
    const article = await queryOne<Article & RowDataPacket>(
      'SELECT * FROM `Article` WHERE id = ?', [parseInt(id, 10)],
    )
    invalidateHome()

    // 仅在从非发布变为发布时通知订阅者
    if (published && !existing?.published) {
      notifySubscribers('article', { title, slug, excerpt }).catch(console.error)
    }

    return NextResponse.json(article)
  } catch { return NextResponse.json({ error: '更新失败' }, { status: 500 }) }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { id } = await params
    await execute('DELETE FROM `Article` WHERE id = ?', [parseInt(id, 10)])
    invalidateHome()
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: '删除失败' }, { status: 500 }) }
}
