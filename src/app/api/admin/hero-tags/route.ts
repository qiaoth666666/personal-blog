import { NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db'
import type { HeroTag } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { invalidateHome } from '@/lib/cache-keys'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function GET() {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const tags = await query<HeroTag & RowDataPacket>(
      'SELECT * FROM `HeroTag` ORDER BY sortOrder ASC',
    )
    return NextResponse.json(tags)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { tag, imageUrl, sortOrder } = await request.json()
    if (!tag || !tag.trim()) return NextResponse.json({ error: '标签名 required' }, { status: 400 })
    const result = await execute(
      'INSERT INTO `HeroTag` (tag, imageUrl, sortOrder) VALUES (?, ?, ?)',
      [tag.trim(), imageUrl?.trim() || null, sortOrder ?? 0],
    )
    const heroTag = await queryOne<HeroTag & RowDataPacket>(
      'SELECT * FROM `HeroTag` WHERE id = ?', [result.insertId],
    )
    invalidateHome()
    return NextResponse.json(heroTag, { status: 201 })
  } catch {
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
