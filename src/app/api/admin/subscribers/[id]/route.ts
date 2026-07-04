import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: '无效的状态值' }, { status: 400 })
    }

    if (status === 'APPROVED') {
      await execute(
        'UPDATE `Subscriber` SET status = ?, approvedAt = ? WHERE id = ?',
        [status, new Date(), parseInt(id, 10)],
      )
    } else {
      await execute(
        'UPDATE `Subscriber` SET status = ? WHERE id = ?',
        [status, parseInt(id, 10)],
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { id } = await params
    await execute('DELETE FROM `Subscriber` WHERE id = ?', [parseInt(id, 10)])
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
