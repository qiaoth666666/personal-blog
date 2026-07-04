import { NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import type { Article } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { invalidateHome } from '@/lib/cache-keys'
import { notifySubscribers } from '@/lib/mailer'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const body = await request.json()
    const { title, slug, content, excerpt, category, tags, published } = body
    if (!title || !slug || !content) return NextResponse.json({ error: '必填字段缺失' }, { status: 400 })

    const result = await execute(
      'INSERT INTO `Article` (title, slug, content, excerpt, category, tags, published) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, slug, content, excerpt || null, category || null, tags || null, published ?? true],
    )
    const article = await queryOne<Article & RowDataPacket>(
      'SELECT * FROM `Article` WHERE id = ?', [result.insertId],
    )
    invalidateHome()

    // 发布文章时通知订阅者
    if (published) {
      notifySubscribers('article', { title, slug, excerpt }).catch(console.error)
    }

    return NextResponse.json(article, { status: 201 })
  } catch (e: any) {
    console.error('[articles] POST error:', e?.message || e, e?.code)
    if (e?.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'slug 已存在' }, { status: 409 })
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
