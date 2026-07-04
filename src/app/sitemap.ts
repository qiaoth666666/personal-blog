import type { MetadataRoute } from 'next'
import { query } from '@/lib/db'
import type { Article } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // 静态页面
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/resume`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${baseUrl}/software`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/articles`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/guestbook`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
  ]

  // 动态文章路由
  let articleRoutes: MetadataRoute.Sitemap = []
  try {
    const articles = await query<Pick<Article, 'slug' | 'updatedAt'> & RowDataPacket>(
      'SELECT slug, updatedAt FROM `Article` WHERE published = true',
    )
    articleRoutes = articles.map((a) => ({
      url: `${baseUrl}/articles/${encodeURIComponent(a.slug)}`,
      lastModified: a.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    // 数据库不可用
  }

  return [...staticRoutes, ...articleRoutes]
}
