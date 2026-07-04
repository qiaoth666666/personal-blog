import type { Metadata } from 'next'
import { getAboutConfigCached } from '@/lib/about-config'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getAboutConfigCached()
  return {
    title: '拾曲',
    description: '拾取散落在时光里的旋律 —— 在线听歌、搜索、收藏',
    openGraph: {
      title: `拾曲 | ${config.siteName || '个人博客'}`,
      description: '拾取散落在时光里的旋律',
    },
  }
}

export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
