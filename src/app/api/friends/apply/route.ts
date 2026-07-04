import { NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import type { FriendLink } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { invalidateFriends } from '@/lib/cache-keys'
import { getFaviconUrlFromUrl, discoverFaviconUrl } from '@/lib/favicon'

export const runtime = 'nodejs'

/**
 * POST /api/friends/apply
 *
 * 公开接口：用户提交友链申请
 * 申请后状态为 PENDING，等待管理员审核
 */
export async function POST(request: Request) {
  try {
    const { name, url, description, iconUrl, email, message } = await request.json()

    // 校验必填字段
    if (!name || !name.trim()) {
      return NextResponse.json({ error: '请填写站点名称' }, { status: 400 })
    }
    if (!url || !url.trim()) {
      return NextResponse.json({ error: '请填写站点链接' }, { status: 400 })
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: '请填写联系邮箱' }, { status: 400 })
    }

    // 校验 URL 格式
    let normalizedUrl = url.trim()
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`
    }
    try {
      new URL(normalizedUrl)
    } catch {
      return NextResponse.json({ error: '站点链接格式不正确' }, { status: 400 })
    }

    // 校验邮箱格式
    const emailTrimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
    }

    // 默认图标：服务端抓取真实 favicon → 降级 /favicon.ico
    let resolvedIconUrl = iconUrl?.trim() || ''
    if (!resolvedIconUrl) {
      resolvedIconUrl = await discoverFaviconUrl(normalizedUrl)
        .catch(() => getFaviconUrlFromUrl(normalizedUrl))
    }

    // 检查是否已存在相同 URL 的申请
    const existing = await queryOne<FriendLink & RowDataPacket>(
      'SELECT id FROM `FriendLink` WHERE url = ?',
      [normalizedUrl],
    )
    if (existing) {
      return NextResponse.json(
        { error: '该站点已提交过友链申请，请耐心等待审核' },
        { status: 409 }
      )
    }

    const result = await execute(
      'INSERT INTO `FriendLink` (name, url, description, iconUrl, email, message, status, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name.trim(),
        normalizedUrl,
        description?.trim() || null,
        resolvedIconUrl,
        emailTrimmed,
        message?.trim() || null,
        'PENDING',
        9999, // 新申请排在最后
      ],
    )

    invalidateFriends()

    return NextResponse.json(
      { message: '友链申请已提交，请等待管理员审核', id: result.insertId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Friend link application error:', error)
    return NextResponse.json({ error: '提交失败，请稍后重试' }, { status: 500 })
  }
}
