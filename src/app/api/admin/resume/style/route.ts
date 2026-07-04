import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { queryOne, execute } from '@/lib/db'
import type { ResumeStyle } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { invalidateResume } from '@/lib/cache-keys'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

/** 获取简历样式配置 */
export async function GET() {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const style = await queryOne<ResumeStyle & RowDataPacket>(
      'SELECT * FROM `ResumeStyle` LIMIT 1',
    )
    return NextResponse.json(style)
  } catch {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

/** 保存简历样式配置 */
export async function PUT(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const body = await request.json()
    const existing = await queryOne<ResumeStyle & RowDataPacket>(
      'SELECT * FROM `ResumeStyle` LIMIT 1',
    )

    const configStr = typeof body === 'string' ? body : JSON.stringify(body)

    let result
    if (existing) {
      await execute(
        'UPDATE `ResumeStyle` SET config = ? WHERE id = ?',
        [configStr, existing.id],
      )
      result = await queryOne<ResumeStyle & RowDataPacket>(
        'SELECT * FROM `ResumeStyle` WHERE id = ?', [existing.id],
      )
    } else {
      const insertResult = await execute(
        'INSERT INTO `ResumeStyle` (config) VALUES (?)',
        [configStr],
      )
      result = await queryOne<ResumeStyle & RowDataPacket>(
        'SELECT * FROM `ResumeStyle` WHERE id = ?', [insertResult.insertId],
      )
    }

    invalidateResume()
    revalidatePath('/resume')
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }
}
