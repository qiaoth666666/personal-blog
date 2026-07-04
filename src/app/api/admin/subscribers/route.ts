import { NextResponse } from 'next/server'
import { query, count } from '@/lib/db'
import type { Subscriber } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'PENDING' | 'APPROVED' | 'REJECTED' | null
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = 20

    const whereClause = status ? 'WHERE status = ?' : ''
    const whereParams = status ? [status] : []

    const [subscribers, total] = await Promise.all([
      query<Subscriber & RowDataPacket>(
        `SELECT * FROM \`Subscriber\` ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
        [...whereParams, limit, (page - 1) * limit],
      ),
      count('Subscriber', status ? 'status = ?' : undefined, whereParams),
    ])

    return NextResponse.json({ subscribers, total, page, totalPages: Math.ceil(total / limit) })
  } catch (e) {
    console.error('[subscribers] GET error:', e)
    return NextResponse.json({ error: '获取订阅者列表失败', detail: String(e) }, { status: 500 })
  }
}
