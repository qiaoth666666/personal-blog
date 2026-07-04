import { NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db'
import type { FriendLink } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { invalidateFriends } from '@/lib/cache-keys'
import { verifyAdminApi } from '@/lib/auth-utils'
import { getFaviconUrlFromUrl, discoverFaviconUrl } from '@/lib/favicon'

export const runtime = 'nodejs'

export async function GET() {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const friends = await query<FriendLink & RowDataPacket>(
      'SELECT * FROM `FriendLink` ORDER BY sortOrder ASC',
    )
    return NextResponse.json(friends)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { name, url, description, iconUrl, email, message, sortOrder, status } = await request.json()
    if (!name || !name.trim()) return NextResponse.json({ error: '友站名称 required' }, { status: 400 })
    if (!url || !url.trim()) return NextResponse.json({ error: '友站链接 required' }, { status: 400 })

    const result = await execute(
      'INSERT INTO `FriendLink` (name, url, description, iconUrl, email, message, sortOrder, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name.trim(), url.trim(),
        description?.trim() || null,
        iconUrl?.trim() || await discoverFaviconUrl(url.trim()).catch(() => getFaviconUrlFromUrl(url.trim())),
        email?.trim() || null, message?.trim() || null,
        sortOrder ?? 0, status?.trim() || 'APPROVED',
      ],
    )
    const friend = await queryOne<FriendLink & RowDataPacket>(
      'SELECT * FROM `FriendLink` WHERE id = ?', [result.insertId],
    )
    invalidateFriends()
    return NextResponse.json(friend, { status: 201 })
  } catch {
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
