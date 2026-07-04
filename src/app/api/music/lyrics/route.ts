import { NextRequest, NextResponse } from 'next/server'
import { getLyrics, parseLrc, type LyricLine } from '@/lib/music-api'

// ============================================================
// LrcApi 公共歌词服务（无需认证）
// 文档: https://github.com/HisAtri/LrcApi
// ============================================================
const LRC_API = 'https://api.lrc.cx/lyrics'

async function fetchLrcApi(title: string, artist: string): Promise<{ lyricsRaw: string; lyrics: LyricLine[] } | null> {
  try {
    const url = `${LRC_API}?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const text = await res.text()
    if (!text || text.trim().length < 10) return null
    return { lyricsRaw: text, lyrics: parseLrc(text) }
  } catch {
    return null
  }
}

// ============================================================
// 服务端缓存
// ============================================================
const cache = new Map<string, { data: { lyricsRaw: string; lyrics: LyricLine[] }; timestamp: number }>()
const CACHE_TTL = 30 * 60 * 1000

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const msg = searchParams.get('msg')
  const n = parseInt(searchParams.get('n') || '0', 10)
  const title = searchParams.get('title') || ''
  const artist = searchParams.get('artist') || ''

  if (!msg || !n) {
    return NextResponse.json({ error: '请提供搜索词(msg)和序号(n)' }, { status: 400 })
  }

  const cacheKey = `${msg}|${n}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data)
  }

  // 1. 尝试妖狐 API
  let result: { lyricsRaw: string; lyrics: LyricLine[] } | null = null
  try {
    result = await getLyrics(msg, n)
  } catch { /* continue */ }

  // 2. 如果妖狐没有歌词，尝试 LrcApi（通过歌曲名+歌手）
  if (!result && title && artist) {
    result = await fetchLrcApi(title, artist)
  }

  const data = result || { lyricsRaw: '', lyrics: [] }

  // 写入缓存
  cache.set(cacheKey, { data, timestamp: Date.now() })
  if (cache.size > 200) {
    const oldest = cache.entries().next().value
    if (oldest) cache.delete(oldest[0])
  }

  return NextResponse.json(data)
}
