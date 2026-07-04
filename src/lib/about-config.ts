import { cache as reactCache } from 'react'
import { queryOne } from '@/lib/db'
import type { AboutConfig } from '@/types/db'
import { cache } from '@/lib/cache'
import { SITE_CONFIG, SITE_INTRO } from '@/lib/constants'
import { CACHE_KEYS } from '@/lib/cache-keys'

export interface AboutConfigData {
  siteName: string | null
  siteDescription: string | null
  siteAuthor: string | null
  avatarUrl: string | null
  displayName: string | null
  tagline: string | null
  siteIntro: string | null
  personalBio: string | null
  email: string | null
  github: string | null
  qq: string | null
  twitter: string | null
  bilibili: string | null
}

function fetchAboutConfig(): Promise<AboutConfigData> {
  return queryOne<AboutConfig & import('mysql2').RowDataPacket>('SELECT * FROM `AboutConfig` LIMIT 1').then((row) => {
    if (row) {
      return {
        siteName: row.siteName ?? SITE_CONFIG.name,
        siteDescription: row.siteDescription ?? SITE_CONFIG.description,
        siteAuthor: row.siteAuthor ?? SITE_CONFIG.author,
        avatarUrl: row.avatarUrl,
        displayName: row.displayName,
        tagline: row.tagline,
        siteIntro: row.siteIntro ?? SITE_INTRO.content,
        personalBio: row.personalBio,
        email: row.email,
        github: row.github,
        qq: row.qq,
        twitter: row.twitter,
        bilibili: row.bilibili,
      }
    }
    // 回退到常量
    return {
      siteName: SITE_CONFIG.name,
      siteDescription: SITE_CONFIG.description,
      siteAuthor: SITE_CONFIG.author,
      avatarUrl: null,
      displayName: null,
      tagline: null,
      siteIntro: SITE_INTRO.content,
      personalBio: null,
      email: null,
      github: null,
      qq: null,
      twitter: null,
      bilibili: null,
    }
  }).catch(() => ({
    siteName: SITE_CONFIG.name,
    siteDescription: SITE_CONFIG.description,
    siteAuthor: SITE_CONFIG.author,
    avatarUrl: null,
    displayName: null,
    tagline: null,
    siteIntro: SITE_INTRO.content,
    personalBio: null,
    email: null,
    github: null,
    qq: null,
    twitter: null,
    bilibili: null,
  }))
}

/** 获取关于页配置（带内存缓存） */
export function getAboutConfig(): Promise<AboutConfigData> {
  return cache(CACHE_KEYS.aboutConfig, 120, fetchAboutConfig)
}

/** React cache 包装 —— 同一请求内去重 */
export const getAboutConfigCached = reactCache(fetchAboutConfig)
