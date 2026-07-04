'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogIn } from 'lucide-react'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFormLoading />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || '用户名或密码错误')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--sp-ground)] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1
            className="font-display text-3xl font-bold italic text-[var(--sp-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            管理后台
          </h1>
          <p
            className="mt-2 text-sm text-[var(--sp-muted)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            请登录以继续
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border-b-2 border-[var(--sp-hairline)] bg-transparent py-3 text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-accent-teal)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-b-2 border-[var(--sp-hairline)] bg-transparent py-3 text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-accent-teal)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            />
          </div>

          {error && (
            <p
              className="text-sm text-[var(--sp-accent-sienna)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-6 py-3 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <LogIn size={16} />
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-xs text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)] transition-colors"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            ← 返回前台
          </a>
        </div>
      </div>
    </div>
  )
}

function LoginFormLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--sp-ground)]">
      <p className="text-sm text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-sans)' }}>加载中...</p>
    </div>
  )
}
