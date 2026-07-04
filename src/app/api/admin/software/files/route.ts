import { NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import path from 'path'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function GET() {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads')
    const entries = await readdir(downloadsDir)

    const files = await Promise.all(
      entries
        .filter((name) => !name.startsWith('.') && !name.startsWith('_'))
        .map(async (name) => {
          const s = await stat(path.join(downloadsDir, name))
          return {
            name,
            size: s.size,
            mtime: s.mtime.toISOString(),
          }
        }),
    )

    // 按修改时间倒序
    files.sort((a, b) => b.mtime.localeCompare(a.mtime))

    return NextResponse.json({ files })
  } catch (error: any) {
    console.error('读取文件列表失败:', error?.message || error)
    return NextResponse.json({ error: '读取失败' }, { status: 500 })
  }
}
