import { NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import type { AboutConfig } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { invalidateAboutConfig } from '@/lib/cache-keys'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

/** 获取关于页配置 */
export async function GET() {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const config = await queryOne<AboutConfig & RowDataPacket>(
      'SELECT * FROM `AboutConfig` LIMIT 1',
    )
    return NextResponse.json(config ?? {})
  } catch {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 允许客户端写入的字段（不含 id / updatedAt 等服务端字段）
const EDITABLE_FIELDS = [
  'siteName', 'siteDescription', 'siteAuthor',
  'avatarUrl', 'displayName', 'tagline',
  'siteIntro', 'personalBio',
  'email', 'github', 'qq', 'twitter', 'bilibili',
] as const

/** 保存关于页配置（upsert 单行） */
export async function PUT(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const body = await request.json()

    // 只保留可编辑字段，过滤掉 id / updatedAt 等服务端管理的字段
    const fields = EDITABLE_FIELDS.filter((f) => f in body)
    if (fields.length === 0) {
      return NextResponse.json({ error: '没有可保存的字段' }, { status: 400 })
    }

    const existing = await queryOne<AboutConfig & RowDataPacket>(
      'SELECT * FROM `AboutConfig` LIMIT 1',
    )

    let result
    if (existing) {
      const setClauses = fields.map((f) => `\`${f}\` = ?`).join(', ')
      const values = fields.map((f) => body[f])
      await execute(
        `UPDATE \`AboutConfig\` SET ${setClauses}, \`updatedAt\` = NOW() WHERE id = ?`,
        [...values, existing.id],
      )
      result = await queryOne<AboutConfig & RowDataPacket>(
        'SELECT * FROM `AboutConfig` WHERE id = ?', [existing.id],
      )
    } else {
      const columns = fields.map((f) => `\`${f}\``).join(', ')
      const placeholders = fields.map(() => '?').join(', ')
      const values = fields.map((f) => body[f])
      const insertResult = await execute(
        `INSERT INTO \`AboutConfig\` (${columns}, \`updatedAt\`) VALUES (${placeholders}, NOW())`,
        values,
      )
      result = await queryOne<AboutConfig & RowDataPacket>(
        'SELECT * FROM `AboutConfig` WHERE id = ?', [insertResult.insertId],
      )
    }

    invalidateAboutConfig()
    return NextResponse.json(result)
  } catch (err) {
    console.error('保存 about-config 失败:', err)
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }
}
