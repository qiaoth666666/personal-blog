import { NextResponse } from 'next/server'
import { query, count } from '@/lib/db'
import type { DownloadLog } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(50, Math.max(5, parseInt(searchParams.get('pageSize') || '20', 10)))
    const offset = (page - 1) * pageSize

    const [total, rows] = await Promise.all([
      count('DownloadLog'),
      query<DownloadLog & RowDataPacket>(
        'SELECT * FROM `DownloadLog` ORDER BY downloadedAt DESC LIMIT ? OFFSET ?',
        [pageSize, offset],
      ),
    ])

    return NextResponse.json({
      logs: rows.map((r) => ({
        ...r,
        fileSize: Number(r.fileSize),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (e) {
    console.error('[download-logs] GET error:', (e as Error).message)
    return NextResponse.json({ logs: [], total: 0, page: 1, pageSize: 20, totalPages: 0 })
  }
}
