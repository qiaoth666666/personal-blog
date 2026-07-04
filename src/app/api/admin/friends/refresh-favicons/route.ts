import { NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
import type { FriendLink } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { verifyAdminApi } from '@/lib/auth-utils'
import { discoverFaviconUrl, getFaviconUrlFromUrl } from '@/lib/favicon'
import { invalidateFriends } from '@/lib/cache-keys'

export const runtime = 'nodejs'

/**
 * POST /api/admin/friends/refresh-favicons
 *
 * 刷新所有（或指定 id）友链的 favicon URL
 * body: { id?: number }  — 不传 id 则刷新全部
 */
export async function POST(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr

  try {
    const body = await request.json().catch(() => ({}))
    const targetId = body?.id ? parseInt(body.id, 10) : null

    const friends = await query<FriendLink & RowDataPacket>(
      targetId
        ? 'SELECT id, url FROM `FriendLink` WHERE id = ?'
        : 'SELECT id, url FROM `FriendLink`',
      targetId ? [targetId] : [],
    )

    let updated = 0
    const results: { id: number; url: string; favicon: string }[] = []

    // 逐个处理（限流友好，其实个人博客友链数量不大）
    for (const f of friends) {
      try {
        const favicon = await discoverFaviconUrl(f.url).catch(() => getFaviconUrlFromUrl(f.url))
        if (favicon) {
          await execute('UPDATE `FriendLink` SET iconUrl = ? WHERE id = ?', [favicon, f.id])
          updated++
          results.push({ id: f.id, url: f.url, favicon })
        }
      } catch {
        // skip individual failures
      }
    }

    if (updated > 0) invalidateFriends()

    return NextResponse.json({ updated, total: friends.length, results })
  } catch {
    return NextResponse.json({ error: '刷新失败' }, { status: 500 })
  }
}
