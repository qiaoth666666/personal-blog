import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { stat } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const file = searchParams.get('file')

  if (!file) {
    return NextResponse.json({ error: '缺少文件名' }, { status: 400 })
  }

  const safeName = path.basename(file)
  const filePath = path.join(process.cwd(), 'public', 'downloads', safeName)

  try {
    await stat(filePath)
  } catch {
    return NextResponse.json({ error: '文件不存在' }, { status: 404 })
  }

  const buffer = await readFile(filePath)

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(safeName)}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(buffer.length),
    },
  })
}
