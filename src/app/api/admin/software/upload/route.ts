import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

// 2GB 硬上限，防磁盘被写满
const MAX_SIZE = 2 * 1024 * 1024 * 1024

// 只允许上传典型可执行/压缩包格式
const ALLOWED_EXTENSIONS = new Set([
  '.exe', '.msi', '.zip', '.7z', '.rar',
  '.dmg', '.pkg', '.deb', '.rpm',
  '.tar', '.gz', '.bz2', '.xz',
  '.apk', '.app', '.dll', '.jar',
  '.iso', '.img',
])

export async function POST(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    // 1. 校验文件名头
    const filenameHeader = request.headers.get('X-Filename')
    if (!filenameHeader) {
      return NextResponse.json({ error: '缺少文件名' }, { status: 400 })
    }

    const originalName = decodeURIComponent(filenameHeader)

    // 2. 防路径穿越（path.basename 去掉一切路径部分）
    const safeBase = path.basename(originalName)

    // 3. 校验扩展名
    const ext = path.extname(safeBase).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `不支持的文件类型: ${ext}` },
        { status: 400 },
      )
    }

    // 4. 读取原始二进制
    const buffer = Buffer.from(await request.arrayBuffer())

    if (buffer.length === 0) {
      return NextResponse.json({ error: '文件为空' }, { status: 400 })
    }

    if (buffer.length > MAX_SIZE) {
      return NextResponse.json(
        { error: `文件大小 ${(buffer.length / 1024 / 1024).toFixed(0)}MB 超过 2GB 限制` },
        { status: 400 },
      )
    }

    // 5. 写入磁盘
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads')
    await mkdir(downloadsDir, { recursive: true })

    const baseName = path.basename(safeBase, ext)
    const cleanName = baseName.replace(/[^a-zA-Z0-9一-龥_-]/g, '_')
    const fileName = `${cleanName}_${Date.now()}${ext}`
    const filePath = path.join(downloadsDir, fileName)

    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      fileName,
      originalName: safeBase,
      size: buffer.length,
    })
  } catch (error: any) {
    console.error('文件上传失败:', error?.message || error)
    return NextResponse.json(
      { error: error?.message || '上传失败' },
      { status: 500 },
    )
  }
}
