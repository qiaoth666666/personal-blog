import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const EMPTY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const site = searchParams.get('site')
  const siteName = searchParams.get('name') || ''
  const debug = searchParams.get('debug') === '1'

  if (!site) {
    return debug ? NextResponse.json({ error: 'missing site param' }, { status: 400 })
      : new NextResponse(EMPTY_PNG, { status: 400 })
  }

  let origin: string
  try { origin = new URL(site).origin } catch {
    return debug ? NextResponse.json({ error: 'invalid URL' }, { status: 400 })
      : new NextResponse(EMPTY_PNG, { status: 400 })
  }

  const steps: string[] = []

  try {
    // 1. 抓取 HTML → 解析 favicon 链接 + OG 图 + title
    steps.push('抓取 HTML...')
    const html = await fetchHtml(origin, steps)
    const iconLinks = html ? parseIconLinks(html) : []
    const ogImage = html ? parseMetaTag(html, 'og:image') : null
    const twitterImage = html ? parseMetaTag(html, 'twitter:image') : null
    const title = html ? parseTitle(html) : null

    const resolvedName = siteName
      || title?.split(/[-–|—·•]/)[0]?.trim()
      || new URL(site).hostname.replace(/^www\./, '')

    steps.push(`icon links: ${iconLinks.length}`)

    // 2. 构建候选 URL 列表
    const candidates: string[] = []

    // HTML 中的 icon link
    for (const href of iconLinks) {
      try { candidates.push(new URL(href, origin).href) } catch {}
    }

    // /favicon.ico（优先放前面）
    candidates.push(`${origin}/favicon.ico`)

    // OG / Twitter 图片
    if (ogImage) {
      try { candidates.push(new URL(ogImage, origin).href); steps.push(`OG 图`) } catch {}
    }
    if (twitterImage) {
      try { candidates.push(new URL(twitterImage, origin).href); steps.push(`Twitter 图`) } catch {}
    }

    // 备选路径
    candidates.push(
      `${origin}/favicon.png`,
      `${origin}/apple-touch-icon.png`,
    )

    // 3. 依次尝试
    const seen = new Set<string>()
    for (const url of candidates) {
      if (seen.has(url)) continue
      seen.add(url)
      const result = await tryFetchImage(url, steps)
      if (result) return result
    }

    // 4. 全失败 → 文字头像
    steps.push('全部失败 → 文字头像')
    const svg = makeTextAvatar(resolvedName)
    if (debug) return NextResponse.json({ origin, textAvatar: true, siteName: resolvedName, steps })
    return serveSvg(svg)

  } catch (e: any) {
    steps.push(`异常: ${e?.message}`)
    return debug ? NextResponse.json({ origin, error: e?.message, steps })
      : new NextResponse(EMPTY_PNG, { status: 500 })
  }
}

// ============================================================
// 辅助函数
// ============================================================

async function fetchHtml(url: string, steps: string[]): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BlogBot/1.0)', 'Accept': 'text/html' },
      signal: AbortSignal.timeout(4000),
      redirect: 'follow',
    })
    if (!res.ok) { steps.push(`HTML HTTP ${res.status}`); return null }
    const html = await res.text()
    steps.push(`HTML: ${html.length}B`)
    return html
  } catch (e: any) { steps.push(`HTML 失败: ${e?.message}`); return null }
}

async function tryFetchImage(url: string, steps: string[]): Promise<NextResponse | null> {
  steps.push(`尝试: ${url}`)
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BlogBot/1.0)' },
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
    })
    if (!res.ok) { steps.push(`  HTTP ${res.status}`); return null }
    const ct = (res.headers.get('content-type') || '').toLowerCase()
    if (!ct.startsWith('image/') && !ct.includes('icon') && ct !== 'application/octet-stream') {
      steps.push(`  非图片: ${ct}`)
      return null
    }
    const buf = Buffer.from(await res.arrayBuffer())
    steps.push(`  ✓ ${ct} ${buf.length}B`)
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': ct,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    })
  } catch (e: any) { steps.push(`  失败: ${e?.message}`); return null }
}

// ============================================================
// HTML 解析
// ============================================================

function parseIconLinks(html: string): string[] {
  const hrefs: string[] = []
  const regex = /<link\b[^>]*>/gi
  let tag
  while ((tag = regex.exec(html)) !== null) {
    const s = tag[0]
    const rel = attrValue(s, 'rel').toLowerCase()
    if (!rel.includes('icon')) continue
    const href = attrValue(s, 'href')
    if (href) hrefs.push(href)
  }
  return hrefs
}

function parseMetaTag(html: string, prop: string): string | null {
  for (const attr of ['property', 'name']) {
    const m = html.match(new RegExp(
      `<meta\\b[^>]*\\b${attr}=["']${prop}["'][^>]*\\bcontent=["']([^"']+)["']`, 'i',
    )) || html.match(new RegExp(
      `<meta\\b[^>]*\\bcontent=["']([^"']+)["'][^>]*\\b${attr}=["']${prop}["']`, 'i',
    ))
    if (m?.[1]) return m[1]
  }
  return null
}

function parseTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return m?.[1]?.trim() || null
}

function attrValue(tag: string, name: string): string {
  let m = tag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i'))
  if (m?.[1]) return m[1]
  m = tag.match(new RegExp(`\\b${name}\\s*=\\s*'([^']*)'`, 'i'))
  if (m?.[1]) return m[1]
  m = tag.match(new RegExp(`\\b${name}\\s*=\\s*([^\\s"'>]+)`, 'i'))
  return m?.[1] || ''
}

// ============================================================
// 文字头像
// ============================================================

function makeTextAvatar(name: string): string {
  const first = [...name].find(c => /[\p{L}\p{N}]/u.test(c)) || name[0] || '?'
  const display = first.toUpperCase()
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
  const hue = Math.abs(hash) % 360
  const bg = `hsl(${hue}, 35%, 48%)`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
<rect width="64" height="64" fill="${bg}"/><text x="32" y="43" text-anchor="middle" font-family="serif" font-size="32" font-weight="600" fill="#faf7f2">${display}</text></svg>`
}

function serveSvg(svg: string): NextResponse {
  return new NextResponse(Buffer.from(svg), {
    status: 200,
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400, immutable' },
  })
}
