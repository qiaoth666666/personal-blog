import { Suspense } from 'react'
import { PageTransition } from '@/components/effects/page-transition'
import { HeroSection } from '@/components/home/hero-section'
import { NavCards } from '@/components/home/nav-cards'
import { PhotoStrip } from '@/components/home/photo-strip'
import { RecentArticles } from '@/components/home/recent-articles'

import { query, queryOne } from '@/lib/db'
import type { ResumeProfile, Photo, HeroTag } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { cache } from '@/lib/cache'

// ISR: 每 60 秒后台刷新
export const revalidate = 60

/**
 * 首页 —— 流式 SSR
 *
 * 静态部分（FloatingOrbs/NavCards）放在 Suspense 外层实现渐进渲染；
 * 数据部分通过 HomeData async 组件在 Suspense 内加载。
 */
export default function HomePage() {
  return (
    <PageTransition>
      {/* 数据区 —— 流式加载 */}
      <Suspense fallback={<HomeShell />}>
        <HomeData />
      </Suspense>
    </PageTransition>
  )
}

/**
 * 数据获取 —— 与原始 page.tsx 完全一致的逻辑，
 * 仅拆分到独立 async 组件中以配合 Suspense 流式输出。
 */
async function HomeData() {
  let profile: {
    name: string
    title: string | null
    avatarUrl: string | null
    status: string | null
    location: string | null
    heroIntro: string | null
  } | null = null
  let photoUrls: string[] = []
  let stackPhotos: string[] = []
  let heroTagsData: { tag: string; imageUrl: string | null }[] = []

  try {
    ;[profile, photoUrls, stackPhotos, heroTagsData] = await Promise.all([
      cache('home:profile', 60, () =>
        queryOne<Pick<ResumeProfile, 'name' | 'title' | 'avatarUrl' | 'status' | 'location' | 'heroIntro'> & RowDataPacket>(
          'SELECT name, title, avatarUrl, status, location, heroIntro FROM `ResumeProfile` LIMIT 1'
        )
      ),
      cache('home:strip-photos', 60, () =>
        query<Pick<Photo, 'url'> & RowDataPacket>(
          'SELECT url FROM `Photo` WHERE section = ? ORDER BY sortOrder ASC', ['strip']
        ).then((photos) => photos.map((p) => p.url))
      ),
      cache('home:stack-photos', 60, () =>
        query<Pick<Photo, 'url'> & RowDataPacket>(
          'SELECT url FROM `Photo` WHERE section = ? ORDER BY sortOrder ASC', ['stack']
        ).then((photos) => photos.map((p) => p.url))
      ),
      cache('home:hero-tags', 60, () =>
        query<Pick<HeroTag, 'tag' | 'imageUrl'> & RowDataPacket>(
          'SELECT tag, imageUrl FROM `HeroTag` ORDER BY sortOrder ASC'
        )
      ),
    ])
  } catch (err) {
    console.error('[HomeData] 数据库查询失败:', err)
    // 数据库不可用 — 使用默认值
  }

  return (
    <>
      <HeroSection
        avatarUrl={profile?.avatarUrl}
        name={profile?.name}
        tagline={profile?.title ?? undefined}
        status={profile?.status}
        location={profile?.location}
        heroIntro={profile?.heroIntro}
        stackPhotos={stackPhotos}
        heroTagImages={heroTagsData}
      />

      <PhotoStrip images={photoUrls} />

      <NavCards />


      <Suspense
        fallback={
          <div className="py-24 text-center text-[var(--sp-muted)]">
            <p style={{ fontFamily: 'var(--font-serif)' }}>正在加载文章...</p>
          </div>
        }
      >
        <RecentArticles />
      </Suspense>
    </>
  )
}

/** 数据加载期间的骨架 Shell */
function HomeShell() {
  return (
    <>
      <section className="relative flex min-h-[90vh] items-center overflow-hidden">
        <div className="absolute inset-0 bg-[var(--sp-ground)]" />
        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-[1fr_560px]">
          <div className="flex flex-col justify-center">
            <div className="h-20 w-72 animate-pulse rounded bg-[var(--sp-surface)]" />
            <div className="mt-5 h-6 w-48 animate-pulse rounded bg-[var(--sp-surface)]" />
            <div className="mt-7 h-4 w-96 animate-pulse rounded bg-[var(--sp-surface)]" />
          </div>
          <div className="hidden lg:block">
            <div className="aspect-[4/3] w-full max-w-[500px] animate-pulse rounded bg-[var(--sp-surface)]" />
          </div>
        </div>
      </section>
      <div className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-48 w-72 shrink-0 animate-pulse rounded bg-[var(--sp-surface)]" />
            ))}
          </div>
        </div>
      </div>
      <div className="py-24 text-center text-[var(--sp-muted)]">
        <p style={{ fontFamily: 'var(--font-serif)' }}>正在加载文章...</p>
      </div>
    </>
  )
}
