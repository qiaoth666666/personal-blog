import { NextResponse } from 'next/server'
import { getAboutConfigCached } from '@/lib/about-config'

export const runtime = 'nodejs'

/** 公开获取站点配置（供前端 context 使用） */
export async function GET() {
  try {
    const config = await getAboutConfigCached()
    return NextResponse.json(config)
  } catch {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
