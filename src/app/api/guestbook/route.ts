import { NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db'
import type { GuestbookMessage } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import sanitizeHtml from 'sanitize-html'
import { getClientIP, getGeoInfo } from '@/lib/geoip'
import { getDeviceType } from '@/lib/device-detect'

export const runtime = 'nodejs'

/** 递归为每条留言附加完整子孙回复树 */
function attachDescendants(
  parentId: number,
  childrenMap: Map<number, GuestbookMsg[]>,
): GuestbookMsg[] {
  const direct = childrenMap.get(parentId) || []
  return direct.map((d) => ({
    ...d,
    replies: attachDescendants(d.id, childrenMap),
  }))
}

type GuestbookMsg = {
  id: number
  nickname: string
  content: string
  createdAt: Date
  ipProvince: string | null
  ipCity: string | null
  deviceType: string | null
  parentId: number | null
  isAdmin: boolean
  parent?: { nickname: string } | null
  replies?: GuestbookMsg[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    // 一次查出全部已通过留言，内存中构建完整回复树
    const allApproved = await query<GuestbookMessage & RowDataPacket>(
      'SELECT id, nickname, content, createdAt, ipProvince, ipCity, deviceType, parentId, isAdmin FROM `GuestbookMessage` WHERE status = ? ORDER BY createdAt DESC',
      ['APPROVED'],
    )

    // 按 parentId 分组
    const childrenMap = new Map<number, typeof allApproved>()
    for (const m of allApproved) {
      if (m.parentId !== null) {
        const arr = childrenMap.get(m.parentId) || []
        arr.push(m)
        childrenMap.set(m.parentId, arr)
      }
    }

    // 构建顶层留言列表（含完整子孙树）
    const topLevel = allApproved
      .filter((m) => m.parentId === null)
      .map((m) => ({
        ...m,
        replies: attachDescendants(m.id, childrenMap),
      }))

    const total = topLevel.length
    const messages = topLevel.slice(skip, skip + limit)

    // 为每条回复注入 parent.nickname
    function injectParentNickname(list: any[], parentNickname?: string) {
      for (const item of list) {
        if (parentNickname) {
          item.parent = { nickname: parentNickname }
        }
        if (item.replies?.length) {
          injectParentNickname(item.replies, item.nickname)
        }
      }
    }
    injectParentNickname(messages)

    return NextResponse.json({
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (e) {
    console.error('[GET /api/guestbook]', e)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nickname, email, content, parentId } = body

    if (!nickname || !content || typeof nickname !== 'string' || typeof content !== 'string') {
      return NextResponse.json({ error: '请填写昵称和留言内容' }, { status: 400 })
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: '请填写邮箱地址' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: '请填写有效的邮箱地址' }, { status: 400 })
    }

    if (nickname.length > 50 || content.length > 500) {
      return NextResponse.json({ error: '字数超过限制' }, { status: 400 })
    }

    let parentIdNum: number | null = null
    if (parentId !== undefined && parentId !== null) {
      parentIdNum = parseInt(String(parentId), 10)
      if (isNaN(parentIdNum) || parentIdNum <= 0) {
        return NextResponse.json({ error: '无效的回复目标' }, { status: 400 })
      }
      const parent = await queryOne<GuestbookMessage & RowDataPacket>(
        'SELECT id, status FROM `GuestbookMessage` WHERE id = ?',
        [parentIdNum],
      )
      if (!parent || parent.status !== 'APPROVED') {
        return NextResponse.json({ error: '回复的留言不存在' }, { status: 400 })
      }
    }

    const cleanContent = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} })
    const cleanNickname = sanitizeHtml(nickname, { allowedTags: [], allowedAttributes: {} })
    const cleanEmail = sanitizeHtml(email.trim(), { allowedTags: [], allowedAttributes: {} })

    const recent = await queryOne<GuestbookMessage & RowDataPacket>(
      'SELECT id FROM `GuestbookMessage` WHERE content = ? AND createdAt >= ? LIMIT 1',
      [cleanContent, new Date(Date.now() - 5000)],
    )
    if (recent) {
      return NextResponse.json({ error: '请勿重复提交' }, { status: 429 })
    }

    const clientIP = getClientIP(request)
    const geoInfo = await getGeoInfo(clientIP)

    const userAgent = request.headers.get('user-agent')
    const deviceType = getDeviceType(userAgent)

    await execute(
      'INSERT INTO `GuestbookMessage` (nickname, email, content, status, ipProvince, ipCity, deviceType, parentId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [cleanNickname, cleanEmail, cleanContent, 'PENDING', geoInfo.province, geoInfo.city, deviceType, parentIdNum],
    )

    return NextResponse.json(
      { message: '留言提交成功，审核后将显示' },
      { status: 201 },
    )
  } catch (e) {
    console.error('[POST /api/guestbook]', e)
    return NextResponse.json({ error: '提交失败' }, { status: 500 })
  }
}
