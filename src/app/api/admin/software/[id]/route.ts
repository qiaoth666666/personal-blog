import { NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import type { Software } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { id } = await params
    const body = await request.json()

    // 动态构建 UPDATE SET 子句
    const fields = Object.keys(body)
    const setClauses = fields.map((f) => `\`${f}\` = ?`).join(', ')
    const values = fields.map((f) => body[f])

    await execute(
      `UPDATE \`Software\` SET ${setClauses} WHERE id = ?`,
      [...values, parseInt(id, 10)],
    )
    const software = await queryOne<Software & RowDataPacket>(
      'SELECT * FROM `Software` WHERE id = ?', [parseInt(id, 10)],
    )
    return NextResponse.json(software)
  } catch { return NextResponse.json({ error: '更新失败' }, { status: 500 }) }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { id } = await params
    await execute('DELETE FROM `Software` WHERE id = ?', [parseInt(id, 10)])
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: '删除失败' }, { status: 500 }) }
}
