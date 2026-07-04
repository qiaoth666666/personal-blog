import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'])

export async function POST(request: Request) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 })
    }

    // 限制文件大小
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '图片大小不能超过 10MB' }, { status: 400 })
    }

    // 校验扩展名
    const originalName = file.name
    const ext = path.extname(originalName).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: '仅支持 JPG/PNG/GIF/WebP/SVG 格式' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 保存到根目录的 pictures/ 文件夹
    const picturesDir = path.resolve(process.cwd(), '..', 'pictures')
    await mkdir(picturesDir, { recursive: true })

    // 生成唯一文件名：清洗 + 时间戳
    const baseName = path.basename(originalName, ext)
    const safeName = baseName.replace(/[^a-zA-Z0-9一-鿿_-]/g, '_')
    const fileName = `${safeName}_${Date.now()}${ext}`
    const filePath = path.join(picturesDir, fileName)

    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      fileName,
      originalName,
      size: file.size,
    })
  } catch (error) {
    console.error('图片上传失败:', error)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}
