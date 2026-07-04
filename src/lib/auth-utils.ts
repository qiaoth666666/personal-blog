import 'server-only'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET 环境变量未设置，无法进行认证')
  }
  return new TextEncoder().encode(secret)
}

/**
 * 验证 admin_token cookie 并返回用户信息。
 * 用于 Server Components 和 Route Handler 中。
 * 未登录时返回 null（不自动 redirect，由调用方决定行为）。
 */
export async function getAdminFromCookie(): Promise<{
  id: string
  name: string
} | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token) return null

    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)
    return { id: payload.id as string, name: payload.name as string }
  } catch {
    return null
  }
}

/**
 * 验证管理员身份，未登录则重定向到登录页。
 * 用于 Server Components（如 admin layout / pages）。
 */
export async function requireAdmin(): Promise<{ id: string; name: string }> {
  const admin = await getAdminFromCookie()
  if (!admin) {
    redirect('/login')
  }
  return admin
}

/**
 * 验证管理员身份，未登录返回 401 JSON 响应。
 * 用于 API Route Handler 中。
 * 返回 null 表示已通过验证（调用方可继续），
 * 返回 NextResponse 表示验证失败（调用方应直接 return）。
 */
export async function verifyAdminApi(): Promise<NextResponse | null> {
  const admin = await getAdminFromCookie()
  if (!admin) {
    return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 })
  }
  return null
}

/**
 * 从 request 中提取 admin_token cookie 并验证。
 * 用于 proxy.ts（入参是 NextRequest 而非 cookies()）。
 */
export async function getAdminFromRequest(request: {
  cookies: { get(name: string): { value: string } | undefined }
}): Promise<{ id: string; name: string } | null> {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) return null

    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)
    return { id: payload.id as string, name: payload.name as string }
  } catch {
    return null
  }
}
