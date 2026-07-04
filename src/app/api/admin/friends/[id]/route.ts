import { NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import type { FriendLink } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { invalidateFriends } from '@/lib/cache-keys'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { id } = await params
    const { name, url, description, iconUrl, email, message, sortOrder, status } = await request.json()

    const setClauses: string[] = []
    const values: (string | number | boolean | null | Date)[] = []
    if (name !== undefined) { setClauses.push('name = ?'); values.push(name.trim()) }
    if (url !== undefined) { setClauses.push('url = ?'); values.push(url.trim()) }
    if (description !== undefined) { setClauses.push('description = ?'); values.push(description?.trim() || null) }
    if (iconUrl !== undefined) { setClauses.push('iconUrl = ?'); values.push(iconUrl?.trim() || null) }
    if (email !== undefined) { setClauses.push('email = ?'); values.push(email?.trim() || null) }
    if (message !== undefined) { setClauses.push('message = ?'); values.push(message?.trim() || null) }
    if (sortOrder !== undefined) { setClauses.push('sortOrder = ?'); values.push(sortOrder) }
    if (status !== undefined) { setClauses.push('status = ?'); values.push(status) }

    if (setClauses.length > 0) {
      await execute(
        `UPDATE \`FriendLink\` SET ${setClauses.join(', ')} WHERE id = ?`,
        [...values, parseInt(id, 10)],
      )
    }

    const friend = await queryOne<FriendLink & RowDataPacket>(
      'SELECT * FROM `FriendLink` WHERE id = ?', [parseInt(id, 10)],
    )
    invalidateFriends()
    return NextResponse.json(friend)
  } catch {
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { id } = await params
    await execute('DELETE FROM `FriendLink` WHERE id = ?', [parseInt(id, 10)])
    invalidateFriends()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
