'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Loader2 } from 'lucide-react'
import { useMusic } from './music-context'
import type { SongResult } from '@/lib/music-api'

/** 热门搜索关键词，页面加载时自动搜索第一批 */
const HOT_KEYWORD = '热歌'

export function HotPicks() {
  const { play, nowPlaying, isPlaying, loadingSong, setSearchResults, searchHasSearched } = useMusic()
  const [songs, setSongs] = useState<SongResult[]>([])
  const [loading, setLoading] = useState(true)
  const [covers, setCovers] = useState<Record<number, string>>({})

  // 自动搜索热门歌曲（仅当用户未手动搜索时）
  useEffect(() => {
    if (searchHasSearched) return
    let cancelled = false

    async function fetchHotSongs() {
      try {
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(HOT_KEYWORD)}`)
        const data = await res.json()
        if (!cancelled) {
          setSongs(data.songs?.slice(0, 8) || [])
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchHotSongs()
    return () => { cancelled = true }
  }, [searchHasSearched])

  // 逐首获取封面（每首间隔 300ms，避免 API 限流）
  useEffect(() => {
    if (songs.length === 0) return

    const uncached = songs.filter((s) => !s.cover)
    if (uncached.length === 0) return

    let cancelled = false

    async function fetchOneByOne() {
      for (const song of uncached) {
        if (cancelled) break

        try {
          const res = await fetch(`/api/music/url?msg=${encodeURIComponent(HOT_KEYWORD)}&n=${song.n}&quality=standard`)
          const data = await res.json()
          if (!cancelled && data.cover) {
            setCovers((prev) => ({ ...prev, [song.n]: data.cover }))
          }
        } catch {
          // ignore
        }

        // 每首之间间隔 300ms
        await new Promise((r) => setTimeout(r, 300))
      }
    }

    const timer = setTimeout(fetchOneByOne, 500) // 延迟 500ms 启动，不阻塞首次渲染

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [songs])

  // 如果用户已搜索，不显示
  if (searchHasSearched) return null
  if (!loading && songs.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="h-5 w-1 rounded-full bg-[var(--sp-accent-sienna)]" />
          <h2
            className="text-sm font-semibold tracking-widest uppercase text-[var(--sp-muted)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            热门推荐
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-[var(--sp-surface)] border border-[var(--sp-hairline)]/30 aspect-[4/5]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {songs.map((song, i) => {
              const cover = song.cover || covers[song.n] || ''
              const isCurrent = nowPlaying?.n === song.n && nowPlaying?.msg === HOT_KEYWORD
              const isPlayingThis = isCurrent && isPlaying
              const isLoadingThis = loadingSong?.n === song.n && loadingSong?.msg === HOT_KEYWORD

              return (
                <motion.button
                  key={song.n}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => {
                    // 同时设置搜索结果以便上下曲切换
                    setSearchResults(HOT_KEYWORD, songs)
                    play({ msg: HOT_KEYWORD, n: song.n, name: song.name, singer: song.singer })
                  }}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--sp-hairline)]/30 bg-[var(--sp-surface)] text-left transition-all duration-300 hover:border-[var(--sp-accent-sienna)]/40 hover:shadow-[0_8px_32px_rgba(184,85,58,0.06)] cursor-pointer"
                >
                  {/* 封面 */}
                  <div className="relative aspect-square overflow-hidden">
                    {cover ? (
                      <img src={cover} alt={song.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--sp-surface-alt)]">
                        <svg viewBox="0 0 120 120" className="h-16 w-16 opacity-15">
                          <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="2" />
                          <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="60" cy="60" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
                          <circle cx="60" cy="60" r="2" fill="currentColor" />
                        </svg>
                      </div>
                    )}

                    {/* 播放按钮 */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--sp-ink)] shadow-lg">
                        {isLoadingThis ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : isPlayingThis ? (
                          <div className="flex gap-0.5">
                            <span className="h-2.5 w-0.5 animate-pulse rounded-full bg-current" />
                            <span className="h-2.5 w-0.5 animate-pulse rounded-full bg-current" style={{ animationDelay: '0.2s' }} />
                            <span className="h-2.5 w-0.5 animate-pulse rounded-full bg-current" style={{ animationDelay: '0.4s' }} />
                          </div>
                        ) : (
                          <Play size={15} className="ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 信息 */}
                  <div className="flex-1 p-3">
                    <p className="truncate text-xs font-semibold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-sans)' }}>
                      {song.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-serif)' }}>
                      {song.singer}
                    </p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </motion.div>
    </section>
  )
}
