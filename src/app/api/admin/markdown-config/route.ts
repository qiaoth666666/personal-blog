import { NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import type { MarkdownConfig } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { invalidateMarkdownConfig } from '@/lib/cache-keys'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

/** 获取 Markdown 排版配置 */
export async function GET() {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const row = await queryOne<MarkdownConfig & RowDataPacket>(
      'SELECT * FROM `MarkdownConfig` LIMIT 1',
    )
    if (!row) return NextResponse.json({ config: null })
    return NextResponse.json({ config: JSON.parse(row.config) })
  } catch {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

/** 保存 Markdown 排版配置（upsert 单行） */
export async function PUT(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const body = await request.json()
    const configJson = JSON.stringify(body.config)

    const existing = await queryOne<MarkdownConfig & RowDataPacket>(
      'SELECT * FROM `MarkdownConfig` LIMIT 1',
    )

    if (existing) {
      await execute(
        'UPDATE `MarkdownConfig` SET config = ? WHERE id = ?',
        [configJson, existing.id],
      )
    } else {
      await execute(
        'INSERT INTO `MarkdownConfig` (config) VALUES (?)',
        [configJson],
      )
    }

    invalidateMarkdownConfig()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }
}
