import { NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import type { Software } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { notifySubscribers } from '@/lib/mailer'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const body = await request.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: '软件名称为必填项' }, { status: 400 })
    }

    // 动态构建 INSERT 语句
    const fields = Object.keys(body)
    const values = Object.values(body) as (string | number | boolean | null | Date)[]
    const placeholders = fields.map(() => '?').join(', ')
    const columns = fields.map((f) => `\`${f}\``).join(', ')

    const result = await execute(
      `INSERT INTO \`Software\` (${columns}) VALUES (${placeholders})`,
      values,
    )
    const software = await queryOne<Software & RowDataPacket>(
      'SELECT * FROM `Software` WHERE id = ?', [result.insertId],
    )

    // 上传新软件时通知订阅者
    notifySubscribers('software', {
      name: software!.name,
      description: software!.description,
    }).catch(console.error)

    return NextResponse.json(software, { status: 201 })
  } catch (e) {
    console.error('[software] POST error:', (e as Error)?.message || e)
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
