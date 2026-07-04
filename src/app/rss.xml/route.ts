import { query } from '@/lib/db'
import type { Article } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { SITE_CONFIG } from '@/lib/constants'

export const runtime = 'nodejs'

export async function GET() {
  const articles = await query<Pick<Article, 'title' | 'slug' | 'excerpt' | 'category' | 'createdAt'> & RowDataPacket>(
    'SELECT title, slug, excerpt, category, createdAt FROM `Article` WHERE published = true ORDER BY createdAt DESC LIMIT 20',
  )

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const items = articles
    .map(
      (a) => `    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${baseUrl}/articles/${encodeURIComponent(a.slug)}</link>
      <guid isPermaLink="true">${baseUrl}/articles/${encodeURIComponent(a.slug)}</guid>
      <description><![CDATA[${a.excerpt || ''}]]></description>
      ${a.category ? `<category>${a.category}</category>` : ''}
      <pubDate>${a.createdAt.toUTCString()}</pubDate>
    </item>`,
    )
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_CONFIG.name}</title>
    <link>${baseUrl}</link>
    <description>${SITE_CONFIG.description}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
