'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Globe } from 'lucide-react'

interface FriendLinkData {
  id: number
  name: string
  url: string
  description: string | null
  iconUrl: string | null
  sortOrder: number
}

/**
 * 友链卡片 —— 书册条目风
 *
 * - 鼠标跟随 3D 微倾（仿手持书册的轻微角度变化）
 * - 底部 accent line 悬停渐显
 * - 图标区采用藏书票质感
 * - spring physics 入场动画
 */
export function FriendLinkCard({ friend, index }: { friend: FriendLinkData; index: number }) {
  // favicon 通过服务端代理加载：自动发现真实 favicon + 缓存 + 无浏览器超时
  const [imgFailed, setImgFailed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 })
  const cardRef = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setGlowPos({ x: 50, y: 50 })
  }, [])

  // 提取域名
  let domain = ''
  try {
    domain = new URL(friend.url).hostname.replace(/^www\./, '')
  } catch {
    domain = friend.url
  }

  // 通过服务端代理获取 favicon（自动发现 + 缓存 + 文字头像降级）
  const proxyUrl = `/api/favicon-proxy?site=${encodeURIComponent(friend.url)}&name=${encodeURIComponent(friend.name)}`
  const showImg = !imgFailed

  return (
    <motion.a
      ref={cardRef}
      href={friend.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col gap-5 border border-[var(--sp-hairline)]/50 bg-[var(--sp-surface)] p-6 no-underline overflow-hidden"
      style={{ transformStyle: 'preserve-3d' }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.65,
        delay: index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── 悬停光晕：跟随鼠标的暖光 ── */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: `radial-gradient(circle 400px at ${glowPos.x}% ${glowPos.y}%, rgba(30,94,107,0.05) 0%, transparent 60%)`,
        }}
      />

      {/* ── 内容区 ── */}
      <div className="relative z-10 flex items-start gap-4">
        {/* 图标 —— 藏书票质感 */}
        <motion.div
          className="flex h-14 w-14 shrink-0 items-center justify-center border border-[var(--sp-hairline)]/40 bg-[var(--sp-ground)]"
          animate={{
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {showImg ? (
            <img
              src={proxyUrl}
              alt={friend.name}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Globe size={18} className="text-[var(--sp-hairline)]" strokeWidth={1} />
            </div>
          )}
        </motion.div>

        {/* 站名 + 域名 + 简介 */}
        <div className="flex-1 min-w-0 pt-0.5">
          {/* 站名 + 外链箭头 */}
          <h3
            className="flex items-center gap-1.5 font-display text-[15px] font-bold leading-tight text-[var(--sp-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="transition-colors duration-400 group-hover:text-[var(--sp-accent-teal)]">
              {friend.name}
            </span>
            <motion.span
              animate={{
                opacity: isHovered ? 1 : 0,
                x: isHovered ? 0 : -6,
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <ExternalLink
                size={11}
                className="shrink-0 text-[var(--sp-accent-teal)]/50"
                strokeWidth={1.5}
              />
            </motion.span>
          </h3>

          {/* 域名 */}
          <p
            className="mt-1 text-[11px] tracking-[0.06em] text-[var(--sp-muted)]/45 uppercase"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {domain}
          </p>

          {/* 简介 */}
          {friend.description && (
            <p
              className="mt-2.5 text-[13px] leading-relaxed text-[var(--sp-muted)] line-clamp-2"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {friend.description}
            </p>
          )}
        </div>
      </div>

      {/* ── 底部 accent line —— 悬停时从左向右展开 ── */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-[var(--sp-accent-teal)]/35"
        initial={{ width: '0%' }}
        animate={{ width: isHovered ? '100%' : '0%' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.a>
  )
}
