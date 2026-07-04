'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type AdminTheme = 'light' | 'dark' | 'system'

interface AdminThemeContextValue {
  theme: AdminTheme
  resolved: 'light' | 'dark'
  setTheme: (theme: AdminTheme) => void
  toggle: () => void
}

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null)

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(stored: AdminTheme): 'light' | 'dark' {
  if (stored === 'system') return getSystemPreference()
  return stored
}

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>('system')
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // 初始化：从 localStorage 读取
  useEffect(() => {
    const stored = (localStorage.getItem('admin-theme') as AdminTheme) || 'system'
    setThemeState(stored)
    setResolved(resolveTheme(stored))
    setMounted(true)
  }, [])

  // 监听系统主题变化
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setResolved(getSystemPreference())
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((t: AdminTheme) => {
    setThemeState(t)
    localStorage.setItem('admin-theme', t)
    setResolved(resolveTheme(t))
  }, [])

  const toggle = useCallback(() => {
    setTheme(resolved === 'dark' ? 'light' : 'dark')
  }, [resolved, setTheme])

  // 始终包裹 Provider（否则子组件 useAdminTheme() 会报错）
  // 仅延迟 data-admin-theme 属性以避免 hydration mismatch
  return (
    <AdminThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      <div {...(mounted ? { 'data-admin-theme': resolved } : {})}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  )
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext)
  if (!ctx) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider')
  }
  return ctx
}
