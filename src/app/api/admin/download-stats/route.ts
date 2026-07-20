import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import type { RowDataPacket } from 'mysql2/promise'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr

  try {
    // 总下载量
    const totalRow = await queryOne<RowDataPacket & { totalCount: number; totalBytes: string }>(
      'SELECT COUNT(*) AS totalCount, COALESCE(SUM(fileSize), 0) AS totalBytes FROM `DownloadLog`',
    )

    // 按文件聚合
    const perFile = await query<RowDataPacket>(
      `SELECT
         fileName,
         COUNT(*) AS count,
         SUM(fileSize) AS totalBytes,
         MAX(downloadedAt) AS lastDownloaded
       FROM \`DownloadLog\`
       GROUP BY fileName
       ORDER BY count DESC`,
    )

    return NextResponse.json({
      totalCount: totalRow?.totalCount ?? 0,
      totalBytes: Number(totalRow?.totalBytes ?? 0),
      perFile: perFile ?? [],
    })
  } catch {
    return NextResponse.json({ totalCount: 0, totalBytes: 0, perFile: [] }, { status: 200 })
  }
}
