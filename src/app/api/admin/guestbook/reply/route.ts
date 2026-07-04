import { NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import type { GuestbookMessage } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { invalidateGuestbook } from '@/lib/cache-keys'
import sanitizeHtml from 'sanitize-html'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

/**
 * 管理员回复留言 —— 自动通过审核，标记为博主
 */
export async function POST(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const body = await request.json()
    const { parentId, content } = body

    if (!parentId || !content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: '请填写回复内容和目标留言' }, { status: 400 })
    }

    const parentIdNum = parseInt(String(parentId), 10)
    if (isNaN(parentIdNum)) {
      return NextResponse.json({ error: '无效的回复目标' }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: '字数超过限制' }, { status: 400 })
    }

    // 确认父留言存在
    const parent = await queryOne<GuestbookMessage & RowDataPacket>(
      'SELECT id FROM `GuestbookMessage` WHERE id = ?',
      [parentIdNum],
    )
    if (!parent) {
      return NextResponse.json({ error: '回复的留言不存在' }, { status: 400 })
    }

    const cleanContent = sanitizeHtml(content.trim(), { allowedTags: [], allowedAttributes: {} })

    const result = await execute(
      'INSERT INTO `GuestbookMessage` (nickname, email, content, status, isAdmin, parentId) VALUES (?, ?, ?, ?, ?, ?)',
      ['UP', null, cleanContent, 'APPROVED', true, parentIdNum],
    )
    const reply = await queryOne<GuestbookMessage & RowDataPacket>(
      'SELECT * FROM `GuestbookMessage` WHERE id = ?', [result.insertId],
    )

    invalidateGuestbook()
    return NextResponse.json(reply, { status: 201 })
  } catch (e) {
    console.error('[POST /api/admin/guestbook/reply]', e)
    return NextResponse.json({ error: '回复失败' }, { status: 500 })
  }
}
