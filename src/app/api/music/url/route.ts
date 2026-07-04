import { NextRequest, NextResponse } from 'next/server'
import { getSongDetail } from '@/lib/music-api'
import type { SongDetail } from '@/lib/music-api'

// ============================================================
// 服务端内存缓存 —— 避免重复请求外部 API
// 键: msg|n|quality
// 缓存时间: 30 分钟
// ============================================================
const cache = new Map<string, { data: SongDetail; timestamp: number }>()
const CACHE_TTL = 30 * 60 * 1000 // 30 分钟

function getCacheKey(msg: string, n: number, quality: string): string {
  return `${msg}|${n}|${quality}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const msg = searchParams.get('msg')
  const n = parseInt(searchParams.get('n') || '0', 10)
  const quality = searchParams.get('quality') || 'flac'

  if (!msg || !n) {
    return NextResponse.json({ error: '请提供搜索词(msg)和序号(n)' }, { status: 400 })
  }

  const cacheKey = getCacheKey(msg, n, quality)

  // 检查缓存
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data)
  }

  try {
    const detail = await getSongDetail(msg, n, quality)
    if (!detail) {
      return NextResponse.json({ error: '获取歌曲详情失败' }, { status: 404 })
    }

    // 写入缓存
    cache.set(cacheKey, { data: detail, timestamp: Date.now() })

    // 缓存上限 200 条，超出时删除最旧的
    if (cache.size > 200) {
      const oldest = cache.entries().next().value
      if (oldest) cache.delete(oldest[0])
    }

    return NextResponse.json(detail)
  } catch (err) {
    console.error('[music/url] 获取失败:', err)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
