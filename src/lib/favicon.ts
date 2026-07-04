/**
 * Favicon 发现工具
 *
 * 服务端抓取目标网站 HTML，解析出真实 favicon 链接。
 * 不依赖任何第三方 favicon 服务（Google S2 / favicon.im 在国内均不可靠）。
 */

/**
 * 从目标网站抓取并解析出 favicon URL。
 * 优先级: <link rel="icon"> → <link rel="shortcut icon"> → /favicon.ico
 *
 * 有 3 秒超时保护，避免卡住请求。
 */
export async function discoverFaviconUrl(siteUrl: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)

  try {
    const html = await fetch(siteUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlogBot/1.0)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    }).then(r => r.text())

    clearTimeout(timeout)

    const faviconUrl = extractFaviconFromHtml(html, siteUrl)
    if (faviconUrl) return faviconUrl
  } catch {
    clearTimeout(timeout)
  }

  // 最终降级：直接拼 /favicon.ico
  try {
    const parsed = new URL(siteUrl)
    return `${parsed.origin}/favicon.ico`
  } catch {
    return ''
  }
}

/**
 * 从 HTML 中提取 favicon 链接
 */
function extractFaviconFromHtml(html: string, baseUrl: string): string | null {
  // 匹配 <link ... rel="...icon..." ... href="...">
  // 支持: rel="icon", rel="shortcut icon", rel="apple-touch-icon" 等

  // 方式 1: rel 在 href 前面
  let match = html.match(/<link[^>]*\brel=["'](?:shortcut\s+)?icon["'][^>]*\bhref=["']([^"']+)["'][^>]*>/i)
  if (!match) {
    // 方式 2: href 在 rel 前面
    match = html.match(/<link[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["'](?:shortcut\s+)?icon["'][^>]*>/i)
  }
  if (!match) {
    // 方式 3: apple-touch-icon
    match = html.match(/<link[^>]*\brel=["']apple-touch-icon["'][^>]*\bhref=["']([^"']+)["'][^>]*>/i)
  }

  if (match?.[1]) {
    try {
      return new URL(match[1], baseUrl).href
    } catch {
      return null
    }
  }

  return null
}

/**
 * 从完整 URL 提取 hostname 拼 /favicon.ico（同步版本，用于快速降级）
 */
export function getFaviconUrlFromUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.origin}/favicon.ico`
  } catch {
    return ''
  }
}
