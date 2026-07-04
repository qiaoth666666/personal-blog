import type { Metadata } from 'next'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminThemeProvider } from '@/components/admin/admin-theme-provider'
import { requireAdmin } from '@/lib/auth-utils'

export const metadata: Metadata = {
  title: { default: '管理后台', template: '%s | 管理后台' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 服务端鉴权：未登录自动重定向到 /login
  await requireAdmin()

  return (
    <AdminThemeProvider>
      <div className="flex min-h-screen bg-[var(--sp-ground)]">
        <div className="sticky top-0 h-screen">
          <AdminSidebar />
        </div>
        <main className="flex-1 overflow-x-hidden p-8">
          {children}
        </main>
      </div>
    </AdminThemeProvider>
  )
}
