'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { SITE_CONFIG, SITE_INTRO } from '@/lib/constants'
import type { AboutConfigData } from '@/lib/about-config'

const defaultConfig: AboutConfigData = {
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

const SiteConfigContext = createContext<AboutConfigData>(defaultConfig)

/**
 * 站点配置 Provider —— 从公开 API 获取动态配置
 * 包裹在 LayoutShell 外层，供 Header/Footer 等前台组件使用
 */
export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AboutConfigData>(defaultConfig)

  useEffect(() => {
    fetch('/api/about-config')
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error()
      })
      .then((data: AboutConfigData) => {
        if (data) setConfig((prev) => ({ ...prev, ...data }))
      })
      .catch(() => {
        // 网络错误时保持默认值
      })
  }, [])

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  )
}

/** 读取站点动态配置（回退到 SITE_CONFIG 常量） */
export function useSiteConfig(): AboutConfigData {
  return useContext(SiteConfigContext)
}
