import { NextResponse } from 'next/server'
import { count } from '@/lib/db'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/pending-counts
 *
 * 返回各模块待审核数量，供侧边栏轮询展示徽标
 */
export async function GET() {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr

  try {
    const [guestbook, friends, subscribers] = await Promise.all([
      count('GuestbookMessage', 'status = ?', ['PENDING']),
      count('FriendLink', 'status = ?', ['PENDING']),
      count('Subscriber', 'status = ?', ['PENDING']),
    ])

    return NextResponse.json({ guestbook, friends, subscribers })
  } catch {
    return NextResponse.json({ guestbook: 0, friends: 0, subscribers: 0 })
  }
}
