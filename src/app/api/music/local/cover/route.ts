import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parseFile } from 'music-metadata'

const SONGS_DIR = path.join(process.cwd(), 'public/songs')
// 封面缓存目录
const COVER_CACHE_DIR = path.join(process.cwd(), 'public/images/covers')

// 内存缓存：避免重复读 FLAC 文件
const coverCache = new Map<string, { data: Buffer; mime: string; time: number }>()
const CACHE_TTL = 30 * 60 * 1000 // 30 分钟

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const file = searchParams.get('file')

  if (!file) {
    return NextResponse.json({ error: '缺少 file 参数' }, { status: 400 })
  }

  // 安全检查：防止路径遍历
  const safeName = path.basename(file)
  if (safeName !== file || !safeName.endsWith('.flac')) {
    return NextResponse.json({ error: '无效的文件名' }, { status: 400 })
  }

  // 检查内存缓存
  const cached = coverCache.get(safeName)
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return new NextResponse(new Uint8Array(cached.data), {
      headers: {
        'Content-Type': cached.mime,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }

  // 检查磁盘缓存
  const cachePath = path.join(COVER_CACHE_DIR, safeName.replace(/\.flac$/i, '.jpg'))
  if (fs.existsSync(cachePath)) {
    const data = fs.readFileSync(cachePath)
    const mime = 'image/jpeg'
    coverCache.set(safeName, { data, mime, time: Date.now() })
    const uint8 = new Uint8Array(data)
    return new NextResponse(uint8, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }

  try {
    const filePath = path.join(SONGS_DIR, safeName)
    const meta = await parseFile(filePath)

    const picture = meta.common.picture?.[0]
    if (!picture) {
      return NextResponse.json({ error: '无封面' }, { status: 404 })
    }

    const mime = picture.format || 'image/jpeg'
    const data = Buffer.from(picture.data)

    // 保存到磁盘缓存
    try {
      if (!fs.existsSync(COVER_CACHE_DIR)) {
        fs.mkdirSync(COVER_CACHE_DIR, { recursive: true })
      }
      if (!fs.existsSync(COVER_CACHE_DIR)) {
        console.error('[cover] 无法创建缓存目录:', COVER_CACHE_DIR)
      } else {
        fs.writeFileSync(cachePath, data)
      }
    } catch (err) {
      console.error('[cover] 写入磁盘缓存失败:', err)
    }

    // 存入内存缓存
    coverCache.set(safeName, { data, mime, time: Date.now() })

    const uint8 = new Uint8Array(data)
    return new NextResponse(uint8, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    console.error('[music/local/cover] 提取封面失败:', err)
    return NextResponse.json({ error: '提取失败' }, { status: 500 })
  }
}
