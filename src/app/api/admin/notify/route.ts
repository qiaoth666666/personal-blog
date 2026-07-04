import { NextResponse } from 'next/server'
import { notifySubscribers } from '@/lib/mailer'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

/**
 * POST /api/admin/notify
 *
 * 管理员向所有已审核订阅者发送通知邮件。
 * 支持 article（文章）和 software（软件）两种类型。
 *
 * Body:
 *   type: 'article' | 'software'
 *   title?: string     — 文章标题
 *   slug?: string      — 文章 slug
 *   excerpt?: string   — 文章摘要
 *   name?: string      — 软件名称
 *   description?: string — 软件描述
 */
export async function POST(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const body = await request.json()
    const { type } = body

    if (!type || !['article', 'software'].includes(type)) {
      return NextResponse.json(
        { error: 'type 字段必填，值为 article 或 software' },
        { status: 400 },
      )
    }

    const result = await notifySubscribers(type, {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      name: body.name,
      description: body.description,
    })

    return NextResponse.json({
      success: true,
      sent: result.sent,
      total: result.total,
      message: `已向 ${result.sent}/${result.total} 位订阅者发送通知`,
    })
  } catch (err) {
    console.error('[notify] 发送通知失败:', err)
    return NextResponse.json(
      { error: '发送失败，请检查 SMTP 配置或稍后重试' },
      { status: 500 },
    )
  }
}
