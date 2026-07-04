import { NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db'
import type { Photo } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { invalidateHome } from '@/lib/cache-keys'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function GET() {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const photos = await query<Photo & RowDataPacket>(
      'SELECT * FROM `Photo` ORDER BY sortOrder ASC',
    )
    return NextResponse.json(photos)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { url, caption, section, sortOrder } = await request.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })
    const result = await execute(
      'INSERT INTO `Photo` (url, caption, section, sortOrder) VALUES (?, ?, ?, ?)',
      [url, caption || null, section || 'strip', sortOrder ?? 0],
    )
    const photo = await queryOne<Photo & RowDataPacket>(
      'SELECT * FROM `Photo` WHERE id = ?', [result.insertId],
    )
    invalidateHome()
    return NextResponse.json(photo, { status: 201 })
  } catch {
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
