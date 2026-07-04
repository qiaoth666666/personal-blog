// ============================================================
// 数据库模型类型定义 —— 替代 Prisma 生成的类型
// ============================================================

// ── 枚举 ──
export type MessageStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type SubscriberStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// ── 文章 ──
export interface Article {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  category: string | null
  tags: string | null
  coverUrl: string | null
  published: boolean
  viewCount: number
  createdAt: Date
  updatedAt: Date
}

// ── 软库 — 软件资源 ──
export interface Software {
  id: number
  name: string
  version: string | null
  description: string | null
  detailContent: string | null
  officialUrl: string | null
  downloadUrl: string | null
  downloadFile: string | null
  fileSize: string | null
  platform: string | null
  category: string | null
  tags: string | null
  iconUrl: string | null
  notes: string | null
  sortOrder: number
  createdAt: Date
}

// ── 留言 ──
export interface GuestbookMessage {
  id: number
  nickname: string
  email: string | null
  content: string
  status: MessageStatus
  ipProvince: string | null
  ipCity: string | null
  deviceType: string | null
  parentId: number | null
  isAdmin: boolean
  createdAt: Date
}

// ── 简历模块 ──
export interface ResumeProfile {
  id: number
  name: string
  title: string | null
  email: string | null
  phone: string | null
  location: string | null
  website: string | null
  github: string | null
  linkedin: string | null
  twitter: string | null
  avatarUrl: string | null
  status: string | null
  heroTags: string | null
  heroIntro: string | null
  updatedAt: Date
}

export interface ResumeEducation {
  id: number
  school: string
  degree: string
  major: string | null
  startDate: Date
  endDate: Date | null
  description: string | null
  sortOrder: number
  createdAt: Date
}

export interface ResumeSkill {
  id: number
  name: string
  category: string
  level: number | null
  description: string | null
  sortOrder: number
  createdAt: Date
}

export interface ResumeSkillContent {
  id: number
  content: string
  updatedAt: Date
}

export interface ResumeProject {
  id: number
  name: string
  role: string | null
  startDate: Date | null
  endDate: Date | null
  description: string
  techStack: string | null
  link: string | null
  sortOrder: number
  createdAt: Date
}

export interface ResumeCertificate {
  id: number
  name: string
  issuer: string | null
  issueDate: Date | null
  description: string | null
  sortOrder: number
  createdAt: Date
}

export interface ResumeIntro {
  id: number
  content: string
  updatedAt: Date
}

export interface ResumeStyle {
  id: number
  config: string
  updatedAt: Date
}

export interface SiteIntro {
  id: number
  content: string
  updatedAt: Date
}

// ── 关于页 & 站点全局配置 ──
export interface AboutConfig {
  id: number
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
  updatedAt: Date
}

// ── 管理员认证 ──
export interface User {
  id: number
  username: string
  password: string
  createdAt: Date
}

export interface Account {
  id: string
  userId: number
  type: string
  provider: string
  providerAccountId: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
}

// ── 摄影 ──
export interface Photo {
  id: number
  url: string
  caption: string | null
  section: string
  sortOrder: number
  createdAt: Date
}

// ── 邮件订阅 ──
export interface Subscriber {
  id: number
  email: string
  status: SubscriberStatus
  token: string
  createdAt: Date
  approvedAt: Date | null
}

// ── 友链 ──
export interface FriendLink {
  id: number
  name: string
  url: string
  description: string | null
  iconUrl: string | null
  email: string | null
  message: string | null
  sortOrder: number
  status: string
  createdAt: Date
  updatedAt: Date
}

// ── 首页标签 ──
export interface HeroTag {
  id: number
  tag: string
  imageUrl: string | null
  sortOrder: number
  createdAt: Date
}

// ── 拾曲 - 播放列表 ──
export interface MusicPlaylist {
  id: number
  /** 歌曲序号 n（妖狐API搜索结果序号） */
  n: number
  title: string
  artist: string
  album: string | null
  coverUrl: string | null
  /** 搜索关键词（用于重新获取播放链接） */
  searchMsg: string | null
  duration: number | null
  sortOrder: number
  createdAt: Date
}

// ── Markdown 排版配置 ──
export interface MarkdownConfig {
  id: number
  config: string
  updatedAt: Date
}
