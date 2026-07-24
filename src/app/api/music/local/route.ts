import { NextResponse } from 'next/server'
import { getSongs } from '@/lib/songs-cache'

export async function GET() {
  try {
    const songs = await getSongs()
    return NextResponse.json({ songs })
  } catch (err) {
    console.error('[music/local] 获取歌曲失败:', err)
    return NextResponse.json({ error: '获取失败', songs: [] }, { status: 500 })
  }
}
