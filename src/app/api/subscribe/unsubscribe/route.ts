import { NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import type { Subscriber } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    const subscriber = await queryOne<Subscriber & RowDataPacket>(
      'SELECT * FROM `Subscriber` WHERE token = ?',
      [token],
    )

    if (subscriber) {
      await execute('DELETE FROM `Subscriber` WHERE id = ?', [subscriber.id])
    }

    // 重定向到首页，带上退订成功的提示
    const url = new URL('/', request.url)
    url.searchParams.set('unsubscribed', '1')
    return NextResponse.redirect(url)
  } catch {
    return NextResponse.redirect(new URL('/', request.url))
  }
}
