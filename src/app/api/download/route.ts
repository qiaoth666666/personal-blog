import { NextResponse } from 'next/server'
import { stat, createReadStream } from 'fs'
import { promisify } from 'util'
import path from 'path'
import { execute } from '@/lib/db'

export const runtime = 'nodejs'

const statAsync = promisify(stat)

/** 从请求头中提取客户端真实 IP */
function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip')
}

/** 异步写下载日志（不阻塞下载响应） */
function logDownload(fileName: string, fileSize: number, ip: string | null, ua: string | null) {
  execute(
    'INSERT INTO `DownloadLog` (fileName, fileSize, ip, userAgent) VALUES (?, ?, ?, ?)',
    [fileName, fileSize, ip, ua?.slice(0, 500) ?? null],
  ).catch((e) => console.error('[download] 日志写入失败:', e.message))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const file = searchParams.get('file')

  if (!file) {
    return NextResponse.json({ error: '缺少文件名' }, { status: 400 })
  }

  // 防目录穿越
  const safeName = path.basename(file)
  if (!safeName || safeName === '.' || safeName === '..') {
    return NextResponse.json({ error: '无效的文件名' }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), 'public', 'downloads', safeName)

  let fileStat
  try {
    fileStat = await statAsync(filePath)
  } catch {
    return NextResponse.json({ error: '文件不存在' }, { status: 404 })
  }

  // 异步记日志 —— 不等待，不阻塞下载
  const ip = getClientIp(request)
  const ua = request.headers.get('user-agent')
  logDownload(safeName, fileStat.size, ip, ua)

  const encodedName = encodeURIComponent(safeName)
  const disposition = `attachment; filename*=UTF-8''${encodedName}`

  // ============================================
  // Nginx X-Accel-Redirect （生产环境零拷贝）
  // ============================================
  const nginxPrefix = process.env.NGINX_DOWNLOAD_PREFIX
  if (nginxPrefix) {
    return new Response(null, {
      status: 200,
      headers: {
        'Content-Disposition': disposition,
        'Content-Type': 'application/octet-stream',
        'X-Accel-Redirect': `${nginxPrefix}/${safeName}`,
      },
    })
  }

  // ============================================
  // 流式 fallback （本地开发 / 无 Nginx 环境）
  // ============================================
  try {
    // Node.js Readable → Web ReadableStream (Node 18+)
    const { Readable } = await import('node:stream')
    const nodeStream = createReadStream(filePath, { highWaterMark: 256 * 1024 }) // 256KB chunks
    const webStream = Readable.toWeb(nodeStream) as ReadableStream

    return new Response(webStream, {
      status: 200,
      headers: {
        'Content-Disposition': disposition,
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(fileStat.size),
      },
    })
  } catch (err) {
    console.error('[download] 流式传输失败:', (err as Error).message)
    return NextResponse.json({ error: '下载失败' }, { status: 500 })
  }
}
