import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { invalidateHome } from '@/lib/cache-keys'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { id } = await params
    await execute('DELETE FROM `Photo` WHERE id = ?', [parseInt(id, 10)])
    invalidateHome()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
