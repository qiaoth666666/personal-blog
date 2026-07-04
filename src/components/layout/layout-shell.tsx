'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BackToTop } from '@/components/layout/back-to-top'

import { Toaster } from '@/components/ui/sonner'

/**
 * 布局外壳 —— 根据路由决定是否显示前台导航外壳
 *
 * 后台 (/admin/*) 有自己的侧边栏，不显示前台 Header/Footer/BackToTop
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      {!isAdmin && <Header />}
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <BackToTop />}
      <Toaster position="bottom-right" richColors closeButton duration={4000} />
    </>
  )
}
