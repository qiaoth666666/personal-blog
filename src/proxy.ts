import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth-utils'

/**
 * Next.js 16 Proxy — 在请求到达页面前运行。
 * 对 /admin 和 /api/admin 路由做乐观鉴权检查：
 * - 未登录访问后台 → 跳转登录页
 * - 已登录访问登录页 → 跳转后台首页
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/login'
  const isApiAdminRoute = pathname.startsWith('/api/admin')
  const isLoginApi = pathname === '/api/login'

  // 登录 API 直接放行
  if (isLoginApi) return NextResponse.next()

  // 验证 admin_token cookie（乐观检查，不查数据库）
  const admin = await getAdminFromRequest(request)

  // 未登录访问后台 → 跳转登录页
  if ((isAdminRoute || isApiAdminRoute) && !admin && !isLoginPage) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 已登录访问登录页 → 跳转后台首页
  if (isLoginPage && admin) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/login', '/login'],
}
