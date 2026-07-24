import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 3600

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawUrl = searchParams.get('url')

  if (!rawUrl) {
    return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 })
  }

  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    return NextResponse.json({ error: '无效的 URL' }, { status: 400 })
  }

  // 如果是 HTTPS 直接 302 重定向（不占用服务器带宽）
  if (rawUrl.startsWith('https://')) {
    return new Response(null, {
      status: 302,
      headers: { Location: rawUrl },
    })
  }

  // HTTP 资源 → 服务端抓取后返回（绕过浏览器混合内容拦截）
  try {
    const upstream = await fetch(rawUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000),
    })

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: '获取失败' }, { status: 502 })
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg'

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    console.error('[proxy-image] 代理失败:', (err as Error).message)
    return NextResponse.json({ error: '代理失败' }, { status: 502 })
  }
}
