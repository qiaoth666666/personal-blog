import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { compare } from 'bcryptjs'
import { queryOne } from '@/lib/db'
import type { User } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: '请输入用户名和密码' }, { status: 400 })
    }

    const user = await queryOne<User & RowDataPacket>(
      'SELECT * FROM `User` WHERE username = ?',
      [username],
    )

    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
    }

    const isValid = await compare(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
    }

    // 确保 AUTH_SECRET 已设置
    const secret = process.env.AUTH_SECRET
    if (!secret) {
      console.error('[LOGIN] AUTH_SECRET 环境变量未设置')
      return NextResponse.json({ error: '服务器配置错误' }, { status: 500 })
    }

    // 签发 JWT（24 小时有效）
    const token = await new SignJWT({ id: user.id.toString(), name: user.username })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(secret))

    // 只在真正走 HTTPS 时才设置 secure（兼容 HTTP 部署）
    const isSecure = process.env.NODE_ENV === 'production'
      && new URL(request.url).protocol === 'https:'

    // 设置 cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24h
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[LOGIN] ERROR:', e?.message || e)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
