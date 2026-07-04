'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Mail, Phone, MapPin, Globe } from 'lucide-react'
import Link from 'next/link'
import type { ResumeProfile } from '@/types/db'

/**
 * 名片区 —— 左大图 + 右信息
 *
 * 布局: 桌面端左右排列，移动端上下堆叠
 * 动效: 图片模糊加载 → 清晰 (blur-in)
 */
export function AvatarCard({ profile }: { profile: ResumeProfile }) {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-4 pb-10 md:pl-[90px]">
      <motion.div
        className="flex flex-col items-center gap-10 md:flex-row md:gap-16"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* 左侧大头像 */}
        <div className="shrink-0">
          {profile.avatarUrl ? (
            <div className="relative w-36 overflow-hidden shadow-book md:w-44" style={{ aspectRatio: '3/4' }}>
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 144px, 176px"
              />
            </div>
          ) : (
            <div className="flex w-36 items-center justify-center bg-[var(--sp-surface)] shadow-book md:w-44" style={{ aspectRatio: '3/4' }}>
              <span
                className="font-display text-6xl text-[var(--sp-muted)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {profile.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* 右侧信息 */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left"
          style={{ gap: '1.5rem' }}
        >
          {/* 姓名 */}
          <h1
            className="font-display text-4xl font-bold text-[var(--sp-ink)] md:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {profile.name}
          </h1>

          {/* 职位 */}
          {profile.title && (
            <p
              className="font-serif text-xl italic text-[var(--sp-muted)]"
              style={{ fontFamily: 'var(--font-serif)', marginBottom: 0 }}
            >
              {profile.title}
            </p>
          )}

          {/* 联系方式 + 社交链接 —— 统一一行 */}
          <div
            className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 md:justify-start"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {profile.email && (
              <span className="inline-flex items-center gap-1.5 text-sm text-[var(--sp-muted)]">
                <Mail size={14} />
                {profile.email}
              </span>
            )}
            {profile.phone && (
              <span className="inline-flex items-center gap-1.5 text-sm text-[var(--sp-muted)]">
                <Phone size={14} />
                {profile.phone}
              </span>
            )}
            {profile.location && (
              <span className="inline-flex items-center gap-1.5 text-sm text-[var(--sp-muted)]">
                <MapPin size={14} />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <Link
                href={profile.website}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--sp-accent-teal)] no-underline hover:opacity-70"
              >
                <Globe size={14} />
                个人网站
              </Link>
            )}
            {profile.github && (
              <Link
                href={profile.github}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                GitHub
              </Link>
            )}
            {profile.linkedin && (
              <Link
                href={profile.linkedin}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--sp-muted)] no-underline hover:text-[var(--sp-ink)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
                LinkedIn
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
