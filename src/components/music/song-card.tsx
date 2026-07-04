'use client'

import { motion } from 'framer-motion'
import { Play, Plus, Check, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useMusic } from './music-context'

interface SongCardProps {
  song: {
    n: number
    name: string
    singer: string
    album: string
    cover: string
    qualities: string[]
  }
  /** 搜索关键词，播放时需要 */
  searchMsg: string
  index: number
}

export function SongCard({ song, searchMsg, index }: SongCardProps) {
  const { play, nowPlaying, isPlaying, loadingSong, fetchCover, addToPlaylist } = useMusic()
  const [added, setAdded] = useState(false)
  const [lazyCover, setLazyCover] = useState(song.cover || '')

  const isCurrentSong =
    nowPlaying?.n === song.n && nowPlaying?.msg === searchMsg
  const isCurrentlyPlaying = isCurrentSong && isPlaying
  const isLoadingThis =
    loadingSong?.n === song.n && loadingSong?.msg === searchMsg

  // 按需加载封面（搜索 API 可能不返回封面）
  useEffect(() => {
    if (!song.cover) {
      fetchCover(searchMsg, song.n).then((cover) => {
        if (cover) setLazyCover(cover)
      })
    }
  }, [song.cover, song.n, searchMsg, fetchCover])

  const displayCover = lazyCover || song.cover

  const handlePlay = () => {
    play({ msg: searchMsg, n: song.n, name: song.name, singer: song.singer })
  }

  const handleAdd = async () => {
    await addToPlaylist({
      n: song.n,
      msg: searchMsg,
      name: song.name,
      singer: song.singer,
      album: song.album,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // 音质标签
  const qualityLabel = song.qualities?.includes('flac')
    ? 'FLAC'
    : song.qualities?.includes('320')
      ? '320K'
      : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div
        className="
          relative overflow-hidden
          bg-[var(--sp-surface)] border border-[var(--sp-hairline)]/40
          transition-all duration-500
          hover:border-[var(--sp-accent-sienna)]/50
          hover:shadow-[0_8px_32px_rgba(184,85,58,0.08)]
        "
        style={{ borderRadius: '12px' }}
      >
        {/* 微噪点纹理 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02] z-10"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 128 128\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'g\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23g)\'/%3E%3C/svg%3E")',
          }}
        />

        {/* 封面区 */}
        <div className="relative aspect-square overflow-hidden">
          {/* 唱片封面或占位图 */}
          {displayCover ? (
            <img
              src={displayCover}
              alt={song.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--sp-surface-alt)] vinyl-groove">
              <svg viewBox="0 0 120 120" className="h-20 w-20 opacity-20">
                <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="60" cy="60" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="60" cy="60" r="2" fill="currentColor" />
              </svg>
            </div>
          )}

          {/* 播放叠加层 */}
          <div
            className={`
              absolute inset-0 flex items-center justify-center
              transition-all duration-300
              ${isCurrentlyPlaying
                ? 'bg-black/30 opacity-100'
                : 'bg-black/0 opacity-0 group-hover:bg-black/20 group-hover:opacity-100'
              }
            `}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePlay}
              disabled={isLoadingThis}
              className="
                flex h-12 w-12 items-center justify-center rounded-full
                bg-white/90 text-[var(--sp-ink)] shadow-lg
                hover:bg-white transition-colors cursor-pointer
                disabled:opacity-80 disabled:cursor-wait
              "
            >
              {isLoadingThis ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isCurrentlyPlaying ? (
                <div className="flex gap-1">
                  <span className="h-3 w-1 animate-pulse rounded-full bg-current" />
                  <span className="h-3 w-1 animate-pulse rounded-full bg-current" style={{ animationDelay: '0.2s' }} />
                  <span className="h-3 w-1 animate-pulse rounded-full bg-current" style={{ animationDelay: '0.4s' }} />
                </div>
              ) : (
                <Play size={18} className="ml-0.5" />
              )}
            </motion.button>
          </div>

          {/* 序号角标 */}
          <span
            className="absolute top-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white/70 font-mono z-10"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            #{song.n}
          </span>

          {/* 音质标签 */}
          {qualityLabel && (
            <span
              className="absolute top-2 right-2 rounded-md bg-[var(--sp-accent-sienna)]/80 px-1.5 py-0.5 text-[10px] text-white font-mono z-10"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {qualityLabel}
            </span>
          )}
        </div>

        {/* 信息区 */}
        <div className="p-3.5">
          <h3
            className="truncate text-sm font-semibold text-[var(--sp-ink)] leading-tight"
            style={{ fontFamily: 'var(--font-sans)' }}
            title={song.name}
          >
            {song.name}
          </h3>

          <p
            className="mt-1 truncate text-xs text-[var(--sp-muted)]"
            style={{ fontFamily: 'var(--font-serif)' }}
            title={song.singer}
          >
            {song.singer}
          </p>

          <div className="mt-2.5 flex items-center justify-between">
            <span
              className="truncate text-[10px] text-[var(--sp-muted)]/60 max-w-[75%]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {song.album || '酷狗音乐'}
            </span>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleAdd}
              className={`
                flex h-7 w-7 items-center justify-center rounded-full
                transition-all duration-300 cursor-pointer
                ${added
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'text-[var(--sp-muted)]/50 hover:text-[var(--sp-accent-sienna)] hover:bg-[var(--sp-accent-sienna)]/5'
                }
              `}
              title="添加到播放列表"
            >
              {added ? <Check size={14} /> : <Plus size={14} />}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
