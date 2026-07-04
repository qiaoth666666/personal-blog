import { query, queryOne, count } from '@/lib/db'
import type { Article, FriendLink } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { cache } from '@/lib/cache'
import { getAboutConfigCached } from '@/lib/about-config'
import { PageTransition } from '@/components/effects/page-transition'
import { AboutHero } from '@/components/about/about-hero'
import { AboutConnect } from '@/components/about/about-connect'
import { AboutFriends } from '@/components/about/about-friends'
import { AboutBio } from '@/components/about/about-bio'
import { SiteIntro } from '@/components/about/site-intro'
import { SiteStats } from '@/components/about/site-stats'
import { TechStack } from '@/components/about/tech-stack'
import { ResumeFallback } from '@/components/resume/resume-fallback'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getAboutConfigCached()
  return {
    title: '关于',
    description: config.siteDescription || '了解更多关于我和这个博客的故事',
  }
}

/** 计算建站天数 */
function calcSiteDays(firstArticleDate: Date | null): number {
  if (!firstArticleDate) return 0
  const now = Date.now()
  const diff = now - firstArticleDate.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export default async function AboutPage() {
  let aboutConfig = null
  let articleCount = 0
  let softwareCount = 0
  let messageCount = 0
  let siteDays = 0
  let firstArticle: { createdAt: Date } | null = null
  let friendLinks: Array<{
    id: number
    name: string
    url: string
    description: string | null
  }> = []
  let dbError = false

  try {
    ;[aboutConfig, articleCount, softwareCount, messageCount, firstArticle, friendLinks] =
      await Promise.all([
        getAboutConfigCached(),
        cache('about:article-count', 60, () =>
          count('Article', 'published = true')
        ),
        cache('about:software-count', 60, () =>
          count('Software')
        ),
        cache('about:message-count', 60, () =>
          count('GuestbookMessage', 'status = ?', ['APPROVED'])
        ),
        cache('about:first-article', 120, () =>
          queryOne<Pick<Article, 'createdAt'> & RowDataPacket>(
            'SELECT createdAt FROM `Article` WHERE published = true ORDER BY createdAt ASC LIMIT 1'
          )
        ),
        cache('about:friend-links', 120, () =>
          query<Pick<FriendLink, 'id' | 'name' | 'url' | 'description'> & RowDataPacket>(
            'SELECT id, name, url, description FROM `FriendLink` WHERE status = ? ORDER BY sortOrder ASC LIMIT 6',
            ['APPROVED'],
          )
        ),
      ])

    siteDays = calcSiteDays(firstArticle?.createdAt ?? null)
  } catch {
    dbError = true
  }

  if (dbError) {
    return (
      <PageTransition>
        <ResumeFallback />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      {/* 1. Hero —— 大头像 + 姓名 + 标签 */}
      <AboutHero
        config={{
          displayName: aboutConfig?.displayName ?? null,
          tagline: aboutConfig?.tagline ?? null,
          avatarUrl: aboutConfig?.avatarUrl ?? null,
        }}
      />

      {/* 2. 站点简介 —— Markdown 渲染，后台可编辑 */}
      <SiteIntro content={aboutConfig?.siteIntro ?? null} />

      {/* 3. 个人介绍 —— Pull Quote + 正文 */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <AboutBio content={aboutConfig?.personalBio ?? null} />
      </section>

      {/* 4. 站点统计 */}
      <SiteStats
        articleCount={articleCount}
        softwareCount={softwareCount}
        messageCount={messageCount}
        siteDays={siteDays}
      />

      {/* 5. 技术栈 */}
      <section className="mx-auto max-w-2xl px-6">
        <TechStack />
      </section>

      {/* 6. 友链速览 */}
      <AboutFriends friends={friendLinks} />

      {/* 7. 联系方式 */}
      {aboutConfig && (
        <section className="mx-auto max-w-2xl px-6 pb-20">
          <AboutConnect
            config={{
              email: aboutConfig.email,
              location: null,
              website: null,
              github: aboutConfig.github,
              qq: aboutConfig.qq,
              twitter: aboutConfig.twitter,
              bilibili: aboutConfig.bilibili,
            }}
          />
        </section>
      )}
    </PageTransition>
  )
}
