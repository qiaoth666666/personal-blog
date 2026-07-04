import { NextRequest, NextResponse } from 'next/server'
import { searchMusic } from '@/lib/music-api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('q')?.trim()

  if (!keyword) {
    return NextResponse.json({ error: '请提供搜索关键词 (q)' }, { status: 400 })
  }

  try {
    const result = await searchMusic(keyword, 20)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[music/search] 搜索失败:', err)
    return NextResponse.json(
      { error: '搜索失败', songs: [], text: '', simplify: '' },
      { status: 500 },
    )
  }
}
