import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // 安全：只取文件名，去掉任何目录部分
    const safeName = path.basename(filename)

    // 拒绝路径穿越和空文件名
    if (!safeName || safeName === '.' || safeName === '..' || safeName.includes('..')) {
      return NextResponse.json({ error: '无效的文件名' }, { status: 400 })
    }

    const picturesDir = path.resolve(process.cwd(), '..', 'pictures')
    const filePath = path.join(picturesDir, safeName)

    // 确保解析后的路径仍在 picturesDir 内
    if (!filePath.startsWith(picturesDir)) {
      return NextResponse.json({ error: '无效的文件名' }, { status: 400 })
    }

    const buffer = await readFile(filePath)
    const ext = path.extname(safeName).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return NextResponse.json({ error: '图片不存在' }, { status: 404 })
    }
    console.error('图片服务错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
