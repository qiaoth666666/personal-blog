import { NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import type { SiteIntro } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

/** 获取站点简介 */
export async function GET() {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const siteIntro = await queryOne<SiteIntro & RowDataPacket>(
      'SELECT * FROM `SiteIntro` LIMIT 1',
    )
    return NextResponse.json(siteIntro)
  } catch {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

/** 保存站点简介 */
export async function PUT(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const body = await request.json()
    const existing = await queryOne<SiteIntro & RowDataPacket>(
      'SELECT * FROM `SiteIntro` LIMIT 1',
    )

    let result
    if (existing) {
      await execute(
        'UPDATE `SiteIntro` SET content = ? WHERE id = ?',
        [body.content, existing.id],
      )
      result = await queryOne<SiteIntro & RowDataPacket>(
        'SELECT * FROM `SiteIntro` WHERE id = ?', [existing.id],
      )
    } else {
      const insertResult = await execute(
        'INSERT INTO `SiteIntro` (content) VALUES (?)',
        [body.content],
      )
      result = await queryOne<SiteIntro & RowDataPacket>(
        'SELECT * FROM `SiteIntro` WHERE id = ?', [insertResult.insertId],
      )
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }
}
