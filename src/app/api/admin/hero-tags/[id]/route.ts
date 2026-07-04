import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { invalidateHome } from '@/lib/cache-keys'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { id } = await params
    const { tag, imageUrl } = await request.json()
    const setClauses: string[] = []
    const values: (string | number | boolean | null | Date)[] = []

    if (tag !== undefined) { setClauses.push('tag = ?'); values.push(tag.trim()) }
    if (imageUrl !== undefined) { setClauses.push('imageUrl = ?'); values.push(imageUrl?.trim() || null) }

    if (setClauses.length > 0) {
      await execute(
        `UPDATE \`HeroTag\` SET ${setClauses.join(', ')} WHERE id = ?`,
        [...values, parseInt(id, 10)],
      )
    }
    invalidateHome()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { id } = await params
    await execute('DELETE FROM `HeroTag` WHERE id = ?', [parseInt(id, 10)])
    invalidateHome()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
