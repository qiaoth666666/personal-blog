'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import FuzzyText from '@/components/effects/fuzzy-text'

export default function NotFound() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // 青色（teal），跟随主题
  const isDark = mounted && resolvedTheme === 'dark'
  const accentColor = isDark ? '#6db8c4' : '#1e5e6b'

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center">
      {/* ═══ 404 模糊文字 ═══ */}
      <FuzzyText
        fontSize="clamp(7rem, 16vw, 11rem)"
        fontWeight={900}
        fontFamily="'Playfair Display', 'Noto Serif SC', Georgia, serif"
        color={accentColor}
        baseIntensity={0}
        hoverIntensity={0.45}
        enableHover
        glitchMode
        glitchInterval={2000}
        glitchDuration={200}
        direction="both"
        fuzzRange={25}
        transitionDuration={0.4}
        letterSpacing={-2}
        className="max-w-full"
      >
        404
      </FuzzyText>

      {/* ═══ 装饰短线 ═══ */}
      <div className="mt-5 h-px w-16 bg-[var(--sp-hairline)]" />

      {/* ═══ 提示文字 ═══ */}
      <p
        className="mt-4 text-sm tracking-wide text-[var(--sp-muted)]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        页面不存在
      </p>

      {/* ═══ 返回首页 ═══ */}
      <Link
        href="/"
        className="group relative mt-7 inline-flex items-center gap-2.5 overflow-hidden border border-[var(--sp-ink)] bg-[var(--sp-ink)] px-6 py-2.5 text-sm font-medium text-[var(--sp-ground)] no-underline transition-all duration-300 hover:bg-transparent hover:text-[var(--sp-ink)]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <span className="absolute inset-0 -translate-x-full bg-[var(--sp-ground)] transition-transform duration-300 group-hover:translate-x-0" />
        <ArrowLeft size={16} className="relative z-10" />
        <span className="relative z-10">返回首页</span>
      </Link>
    </div>
  )
}
