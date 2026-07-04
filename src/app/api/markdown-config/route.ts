import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import type { MarkdownConfig } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { cache } from '@/lib/cache'
import { CACHE_KEYS } from '@/lib/cache-keys'

export const runtime = 'nodejs'

/** 获取 Markdown 排版配置（公开、带缓存） */
export async function GET() {
  try {
    const data = await cache(CACHE_KEYS.markdownConfig, 120, async () => {
      const row = await queryOne<MarkdownConfig & RowDataPacket>(
        'SELECT * FROM `MarkdownConfig` LIMIT 1',
      )
      return { config: row ? JSON.parse(row.config) : null }
    })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ config: null })
  }
}
