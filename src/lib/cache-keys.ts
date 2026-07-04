import { invalidatePrefix, invalidate } from '@/lib/cache'

/**
 * 缓存键常量 —— 与前端页面缓存调用保持一致
 *
 * 数据变更时（admin API），按此映射清除对应缓存
 */

export const CACHE_KEYS = {
  home: {
    profile: 'home:profile',
    stripPhotos: 'home:strip-photos',
    stackPhotos: 'home:stack-photos',
    heroTags: 'home:hero-tags',
    recentArticles: 'home:recent-articles',
  },
  software: {
    list: 'software:list',
  },
  resume: {
    profile: 'resume:profile',
    education: 'resume:education',
    skills: 'resume:skills',
    skillContent: 'resume:skill-content',
    projects: 'resume:projects',
    certificates: 'resume:certificates',
    intro: 'resume:intro',
    siteIntro: 'resume:site-intro',
    style: 'resume:style',
  },
  friends: {
    list: 'friends:list',
    about: 'about:friend-links',
  },
  aboutConfig: 'about:config',
  markdownConfig: 'markdown:config',
} as const

/** 清除首页所有缓存 */
export function invalidateHome() {
  invalidatePrefix('home:')
}

/** 清除软库缓存 */
export function invalidateSoftware() {
  invalidate('software:list')
}

/** 清除简历所有缓存 */
export function invalidateResume() {
  invalidatePrefix('resume:')
}

/** 清除留言板缓存 */
export function invalidateGuestbook() {
  invalidatePrefix('guestbook:')
}

/** 清除友链缓存 */
export function invalidateFriends() {
  invalidatePrefix('friends:')
  invalidate('about:friend-links')
}

/** 清除关于页配置缓存 */
export function invalidateAboutConfig() {
  invalidate('about:config')
}

/** 清除 Markdown 排版配置缓存 */
export function invalidateMarkdownConfig() {
  invalidate('markdown:config')
}
