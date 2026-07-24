import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawUrl = searchParams.get('url')

  if (!rawUrl) {
    return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 })
  }

  // 只允许代理 HTTP URL（HTTPS 的直接走，无需代理）
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    return NextResponse.json({ error: '无效的 URL' }, { status: 400 })
  }

  try {
    const upstream = await fetch(rawUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(30000),
    })

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: '获取音频失败' }, { status: 502 })
    }

    // 流式转发：服务端一块块读 → 一块块写给客户端，内存恒定
    const [type, length] = [
      upstream.headers.get('content-type') || 'audio/mpeg',
      upstream.headers.get('content-length'),
    ]

    const headers: HeadersInit = {
      'Content-Type': type,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    }
    if (length) headers['Content-Length'] = length

    // 判断是否支持 Range 请求（seek 需要）
    const rangeHeader = request.headers.get('range')
    if (rangeHeader) {
      headers['Content-Range'] = `bytes */${length || '*'}`  // 简单处理
    }

    return new Response(upstream.body, { status: 200, headers })
  } catch (err) {
    console.error('[proxy-audio] 代理失败:', (err as Error).message)
    return NextResponse.json({ error: '代理请求失败' }, { status: 502 })
  }
}
