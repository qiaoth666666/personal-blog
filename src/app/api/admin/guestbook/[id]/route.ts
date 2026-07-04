import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { invalidateGuestbook } from '@/lib/cache-keys'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { id } = await params
    const { status } = await request.json()
    await execute(
      'UPDATE `GuestbookMessage` SET status = ? WHERE id = ?',
      [status, parseInt(id, 10)],
    )
    invalidateGuestbook()
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: '更新失败' }, { status: 500 }) }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { id } = await params
    await execute('DELETE FROM `GuestbookMessage` WHERE id = ?', [parseInt(id, 10)])
    invalidateGuestbook()
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: '删除失败' }, { status: 500 }) }
}
