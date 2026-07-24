'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { Play, Music, Loader2 } from 'lucide-react'
import { useMusic } from './music-context'
import './song-wall.css'

// ============================================================
// Hooks (SSR 安全)
// ============================================================

function useMedia(queries: string[], values: number[], defaultValue: number): number {
  const [cols, setCols] = useState(defaultValue)

  useEffect(() => {
    const getValue = () => {
      const idx = queries.findIndex(q => window.matchMedia(q).matches)
      return idx >= 0 ? values[idx] : defaultValue
    }
    setCols(getValue())
    const cleanups = queries.map(q => {
      const mq = window.matchMedia(q)
      const handler = () => setCols(getValue())
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    })
    return () => cleanups.forEach(fn => fn())
  }, [queries, values, defaultValue])

  return cols
}

function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    if (rect.width > 0) setSize({ width: rect.width, height: rect.height })

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0) setSize({ width, height })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  return [ref, size] as const
}

// ============================================================
// 类型
// ============================================================

interface WallItem {
  id: string
  img: string
  name: string
  singer: string
  audioPath: string
  lyrics: string | null
  duration: number
  durationFormat: string
  ratio: number
}

interface GridItem extends WallItem {
  x: number
  y: number
  w: number
  h: number
}

// ============================================================
// 配置
// ============================================================

const BREAKPOINTS = [
  { query: '(min-width: 1200px)', cols: 6 },
  { query: '(min-width: 900px)', cols: 5 },
  { query: '(min-width: 640px)', cols: 4 },
  { query: '(min-width: 480px)', cols: 3 },
  { query: '(min-width: 400px)', cols: 2 },
]

const QUERIES = BREAKPOINTS.map(b => b.query)
const COL_VALUES = BREAKPOINTS.map(b => b.cols)
const GAP = 6

// ============================================================
// 组件
// ============================================================

interface SongWallProps {
  onLoaded?: () => void
}

export function SongWall({ onLoaded }: SongWallProps) {
  const { playLocal, nowPlaying, isPlaying, loadingSong } = useMusic()

  const cols = useMedia(QUERIES, COL_VALUES, 1)
  const [containerRef, { width: containerW }] = useMeasure<HTMLDivElement>()
  const entranceDone = useRef(false)
  const prevGridRef = useRef<GridItem[]>([])

  const [wallItems, setWallItems] = useState<WallItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visibleCount, setVisibleCount] = useState(15)
  const animatedCountRef = useRef(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // ============================================================
  // 数据获取 —— 从本地歌曲目录
  // ============================================================
  useEffect(() => {
    let cancelled = false

    async function init() {
      setLoading(true)
      setError(false)
      entranceDone.current = false
      animatedCountRef.current = 0

      try {
        const res = await fetch('/api/music/local')
        const data = await res.json()
        const songs = data.songs || []

        if (cancelled) return
        if (songs.length === 0) {
          setError(true)
          setLoading(false)
          return
        }

        // 封面直接可用，无需另外拉取
        const RATIOS = [1.2, 0.85, 1.5, 0.95, 1.35, 0.8, 1.1, 1.45, 0.9, 1.25, 1.05, 1.55, 0.75, 1.3, 0.95, 1.4, 0.85, 1.15, 1.5, 1.0, 1.3, 0.8, 1.45, 1.05, 0.9, 1.35, 1.15, 0.85, 1.5, 1.0, 1.25, 0.95, 1.4, 0.75, 1.1]
        const items: WallItem[] = songs.map((song: { id: string; name: string; artist: string; coverPath: string | null; audioPath: string; lyrics: string | null; duration: number; durationFormat: string }, i: number) => ({
          id: song.id,
          img: song.coverPath || '',
          name: song.name,
          singer: song.artist,
          audioPath: song.audioPath,
          lyrics: song.lyrics,
          duration: song.duration || 0,
          durationFormat: song.durationFormat || '',
          ratio: RATIOS[i % RATIOS.length],
        }))

        if (!cancelled) {
          setWallItems(items)
          setLoading(false)
          setVisibleCount(15)
          // 通知父组件加载完成，延迟等 GSAP 入场动画开始
          setTimeout(() => onLoaded?.(), 100)
        }
      } catch {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  // ============================================================
  // 可见项 + 无限滚动
  // ============================================================
  const visibleItems = useMemo(
    () => wallItems.slice(0, visibleCount),
    [wallItems, visibleCount],
  )
  const hasMore = visibleCount < wallItems.length

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true)
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 10, wallItems.length))
      setLoadingMore(false)
    }, 300)
  }, [wallItems.length])

  // 无限滚动：哨兵进入视野 → 自动加载更多
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 10, wallItems.length))
        }
      },
      { rootMargin: '50px' },
    )
    io.observe(sentinel)
    return () => io.disconnect()
  }, [hasMore, wallItems.length])

  // ============================================================
  // 瀑布流布局
  // ============================================================
  const grid = useMemo<GridItem[]>(() => {
    if (!containerW || cols === 0 || visibleItems.length === 0) return []

    const colW = (containerW - GAP * (cols - 1)) / cols
    const colHeights = new Array(cols).fill(0)

    return visibleItems.map(item => {
      const idx = colHeights.indexOf(Math.min(...colHeights))
      const x = idx * (colW + GAP)
      const h = colW * item.ratio
      const y = colHeights[idx]
      colHeights[idx] += h + GAP
      return { ...item, x, y, w: colW, h }
    })
  }, [containerW, cols, visibleItems])

  const containerH = useMemo(() => {
    if (grid.length === 0) return 300
    return Math.max(...grid.map(g => g.y + g.h)) + 6
  }, [grid])

  // ============================================================
  // GSAP 入场动画 —— 从底部飞入 + blur → 清晰
  // ============================================================
  useLayoutEffect(() => {
    if (grid.length === 0) return

    const prevCount = animatedCountRef.current
    const newItems = grid.slice(prevCount)

    if (newItems.length === 0) return
    animatedCountRef.current = grid.length
    entranceDone.current = true

    const frame = requestAnimationFrame(() => {
      const DURATION = 0.5
      const STAGGER = 0.02
      const EASE = 'power3.out'

      newItems.forEach((item, index) => {
        const el = document.querySelector(`[data-song-id="${item.id}"]`) as HTMLElement | null
        if (!el) return

        const fromY = prevCount === 0 ? window.innerHeight + 200 : item.y + 60

        gsap.fromTo(
          el,
          { top: fromY, opacity: 0, filter: 'blur(4px)' },
          { top: item.y, opacity: 1, filter: 'blur(0px)', duration: DURATION, ease: EASE, delay: index * STAGGER },
        )
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [grid])

  // ---- 位置更新 ----
  useLayoutEffect(() => {
    if (grid.length === 0) return
    if (!entranceDone.current) return

    const prev = prevGridRef.current
    prevGridRef.current = grid
    if (prev.length === 0) return

    grid.forEach(item => {
      const el = document.querySelector(`[data-song-id="${item.id}"]`) as HTMLElement | null
      if (!el) return
      gsap.to(el, {
        left: item.x,
        top: item.y,
        width: item.w,
        height: item.h,
        duration: 0.6,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    })
  }, [grid])

  // ---- 事件处理 ----
  const handleClick = useCallback(
    (item: GridItem) => {
      const queue = wallItems.map(w => ({
        id: w.id,
        name: w.name,
        singer: w.singer,
        cover: w.img,
        audioPath: w.audioPath,
        lyrics: w.lyrics,
        duration: w.duration,
        durationFormat: w.durationFormat,
      }))
      playLocal({
        id: item.id,
        name: item.name,
        singer: item.singer,
        cover: item.img,
        audioPath: item.audioPath,
        lyrics: item.lyrics,
        duration: item.duration,
        durationFormat: item.durationFormat,
      }, queue)
    },
    [playLocal, wallItems],
  )

  const handleMouseEnter = useCallback((item: GridItem) => {
    const el = document.querySelector(`[data-song-id="${item.id}"]`) as HTMLElement | null
    if (el) gsap.to(el, { scale: 0.95, duration: 0.35, ease: 'power2.out' })
  }, [])

  const handleMouseLeave = useCallback((item: GridItem) => {
    const el = document.querySelector(`[data-song-id="${item.id}"]`) as HTMLElement | null
    if (el) gsap.to(el, { scale: 1, duration: 0.35, ease: 'power2.out' })
  }, [])

  // ============================================================
  // 渲染
  // ============================================================
  return (
    <section className="mx-auto max-w-7xl">
      {/* 加载中 —— 静默等待，不显示转圈 */}
      {loading && <div className="py-8" />}

      {/* 出错 */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Music size={28} className="text-[var(--sp-muted)]/15 mb-3" />
          <p className="text-sm text-[var(--sp-muted)]/50" style={{ fontFamily: 'var(--font-serif)' }}>
            歌曲加载失败，请稍后刷新重试
          </p>
        </div>
      )}

      {/* 空数据 */}
      {!loading && !error && wallItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-[var(--sp-muted)]/50" style={{ fontFamily: 'var(--font-serif)' }}>
            暂无歌曲数据
          </p>
        </div>
      )}

      {/* 瀑布流 —— 容器始终渲染，确保 ResizeObserver 能测到宽度 */}
      <div
        ref={containerRef}
        className="song-wall-container"
        style={{ height: containerH, minHeight: 200 }}
      >
        {!loading && !error && wallItems.length > 0 && (
          <>
          {grid.map(item => {
            const isCurrent = nowPlaying?.name === item.name && nowPlaying?.singer === item.singer
            const isPlayingThis = isCurrent && isPlaying
            const isLoadingThis = false
            const hasImage = !!item.img

            return (
              <div
                key={item.id}
                data-song-id={item.id}
                className={`song-wall-item${isCurrent ? ' is-playing' : ''}`}
                style={{ width: item.w, height: item.h, left: item.x, top: item.y }}
                onClick={() => handleClick(item)}
                onMouseEnter={() => handleMouseEnter(item)}
                onMouseLeave={() => handleMouseLeave(item)}
              >
                <div className="song-wall-card">
                  <div className="song-wall-img">
                    <div className="song-wall-noise" />

                    {hasImage && (
                      <div className="song-wall-img-bg" style={{ backgroundImage: `url(${item.img})` }} />
                    )}

                    {!hasImage && (
                      <div className="song-wall-placeholder">
                        <div className="flex flex-col items-center gap-2 px-3 text-center">
                          <span className="text-2xl font-bold leading-tight tracking-tight text-[var(--sp-ink)]/12 sm:text-3xl"
                            style={{ fontFamily: 'var(--font-display)' }}>
                            {item.name}
                          </span>
                          <span className="text-xs italic text-[var(--sp-muted)]/20"
                            style={{ fontFamily: 'var(--font-serif)' }}>
                            {item.singer}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="song-wall-play-overlay">
                      <div className="song-wall-play-circle">
                        {isLoadingThis ? (
                          <Loader2 size={20} className="animate-spin text-white" />
                        ) : isPlayingThis ? (
                          <div className="flex gap-[3px] items-end h-3">
                            <span className="w-[3px] rounded-full bg-white animate-wave" style={{ height: '60%' }} />
                            <span className="w-[3px] rounded-full bg-white animate-wave" style={{ height: '100%', animationDelay: '0.15s' }} />
                            <span className="w-[3px] rounded-full bg-white animate-wave" style={{ height: '40%', animationDelay: '0.3s' }} />
                          </div>
                        ) : (
                          <Play size={18} className="ml-0.5 text-white" />
                        )}
                      </div>
                    </div>

                    <div className="song-wall-info">
                      <p className="song-wall-name" style={{ fontFamily: 'var(--font-sans)' }}>{item.name}</p>
                      <p className="song-wall-artist" style={{ fontFamily: 'var(--font-serif)' }}>{item.singer}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          </>
        )}
      </div>

      {/* 无限滚动哨兵 */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* 兜底按钮（IntersectionObserver 不支持时显示） */}
      {hasMore && (
        <div className="flex justify-center py-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="text-xs tracking-wider text-[var(--sp-muted)]/30 transition-colors hover:text-[var(--sp-muted)] disabled:opacity-20"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {loadingMore ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}
    </section>
  )
}
