import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { FriendLink } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { cache } from '@/lib/cache'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const friends = await cache('friends:list', 120, () =>
      query<FriendLink & RowDataPacket>(
        'SELECT id, name, url, description, iconUrl, sortOrder FROM `FriendLink` WHERE status = ? ORDER BY sortOrder ASC',
        ['APPROVED'],
      )
    )
    return NextResponse.json(friends)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
