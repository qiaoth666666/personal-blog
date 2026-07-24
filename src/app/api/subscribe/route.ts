import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { queryOne, execute } from '@/lib/db'
import type { Subscriber } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'

export const runtime = 'nodejs'

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET 环境变量未设置')
  return new TextEncoder().encode(secret)
}

/** 验证验证码 */
async function verifyCaptcha(captcha: string | undefined): Promise<boolean> {
  if (!captcha || captcha.trim() === '') return false

  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('captcha_token')?.value
    if (!token) return false

    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)

    return Number(captcha.trim()) === payload.answer
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const { email, captcha } = await request.json()

    // 校验邮箱格式
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '请输入有效的邮箱地址' }, { status: 400 })
    }

    // 校验验证码
    const captchaValid = await verifyCaptcha(captcha)
    if (!captchaValid) {
      return NextResponse.json({ error: '验证码错误或已过期，请重试' }, { status: 400 })
    }

    // 验证通过后清除 captcha cookie
    const cookieStore = await cookies()
    cookieStore.set('captcha_token', '', { maxAge: 0, path: '/' })

    const normalizedEmail = email.trim().toLowerCase()

    // 查重
    const existing = await queryOne<Subscriber & RowDataPacket>(
      'SELECT * FROM `Subscriber` WHERE email = ?',
      [normalizedEmail],
    )

    if (existing) {
      if (existing.status === 'APPROVED') {
        return NextResponse.json({ message: '你已订阅，无需重复订阅' })
      }
      if (existing.status === 'PENDING') {
        return NextResponse.json({ message: '你的订阅申请正在审核中，请耐心等待' })
      }
      // REJECTED: 允许重新申请，更新状态为 PENDING
      await execute(
        'UPDATE `Subscriber` SET status = ?, createdAt = ? WHERE id = ?',
        ['PENDING', new Date(), existing.id],
      )
      return NextResponse.json({ message: '订阅申请已重新提交，等待审核' })
    }

    // 生成退订 token
    const token = crypto.randomUUID().replace(/-/g, '')

    await execute(
      'INSERT INTO `Subscriber` (email, token, status) VALUES (?, ?, ?)',
      [normalizedEmail, token, 'PENDING'],
    )

    return NextResponse.json({ message: '订阅申请已提交，等待管理员审核' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '订阅失败，请稍后重试' }, { status: 500 })
  }
}
