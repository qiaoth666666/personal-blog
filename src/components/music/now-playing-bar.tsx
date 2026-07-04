'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
  X,
  ChevronUp,
  Trash2,
} from 'lucide-react'
import { useMusic } from './music-context'

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function NowPlayingBar() {
  const {
    nowPlaying,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    seek,
    setVolume,
    playNext,
    playPrev,
    toggleDetailPanel,
    showNavLyrics,
    toggleNavLyrics,
  } = useMusic()

  const [showPlaylist, setShowPlaylist] = useState(false)

  const handleSongInfoClick = () => {
    if (nowPlaying) {
      toggleDetailPanel()
    }
  }

  if (!nowPlaying) return null

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, x / rect.width))
    seek(pct * (duration || 0))
  }

  return (
    <>
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="
          fixed bottom-0 left-0 right-0 z-50
          border-t border-[var(--sp-hairline)]/30
          bg-[var(--sp-surface)]
          shadow-[0_-4px_24px_rgba(0,0,0,0.06)]
        "
      >
        {/* 进度条 */}
        <div
          className="group relative h-1 w-full cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full transition-all duration-100"
            style={{
              width: `${progressPercent}%`,
              background: 'var(--sp-accent-sienna)',
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2
              h-3 w-3 rounded-full bg-[var(--sp-accent-sienna)]
              opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-2.5">
          {/* 左侧：向上箭头 + 歌曲信息 —— 点击弹出详情面板 */}
          <button
            onClick={handleSongInfoClick}
            className="flex items-center gap-2 min-w-0 flex-1 rounded-lg -ml-2 px-2 py-1 transition-all duration-300 cursor-pointer text-left hover:bg-[var(--sp-accent-sienna)]/5 hover:shadow-[0_2px_12px_rgba(184,85,58,0.06)] active:scale-[0.98]"
          >
            <ChevronUp size={18} className="shrink-0 text-[var(--sp-muted)]/50 transition-colors" />
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[var(--sp-hairline)]/30">
              {nowPlaying.cover ? (
                <img
                  src={nowPlaying.cover}
                  alt={nowPlaying.name}
                  className={`h-full w-full object-cover transition-all duration-700 ${isPlaying ? 'scale-105' : ''}`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[var(--sp-surface-alt)]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-20">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                  </svg>
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-sans)' }}>
                {nowPlaying.name}
              </p>
              <p className="truncate text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-serif)' }}>
                {nowPlaying.singer}
              </p>
            </div>

            <span className="hidden sm:inline text-xs text-[var(--sp-muted)]/60 font-mono shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </button>

          {/* 中间：控制 */}
          <div className="flex items-center gap-1 shrink-0">
            <motion.button whileTap={{ scale: 0.85 }} onClick={playPrev}
              className="rounded-lg p-2 text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors cursor-pointer">
              <SkipBack size={18} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.85 }} onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sp-accent-sienna)] text-white hover:opacity-90 transition-opacity cursor-pointer shadow-md">
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </motion.button>
            <motion.button whileTap={{ scale: 0.85 }} onClick={playNext}
              className="rounded-lg p-2 text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors cursor-pointer">
              <SkipForward size={18} />
            </motion.button>
          </div>

          {/* 右侧 */}
          <div className="hidden sm:flex items-center gap-1 flex-1 justify-end">
            {/* 导航栏歌词开关 */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleNavLyrics}
              className={`rounded-lg p-2 transition-colors cursor-pointer ${
                showNavLyrics
                  ? 'text-[var(--sp-accent-teal)]'
                  : 'text-[var(--sp-muted)] hover:text-[var(--sp-ink)]'
              }`}
              title={showNavLyrics ? '关闭导航栏歌词' : '开启导航栏歌词'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[17px] h-[17px]">
                <path d="M3 5h18M3 12h14M3 19h10" strokeLinecap="round" />
              </svg>
            </motion.button>
            <VolumeControl volume={volume} setVolume={setVolume} />
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowPlaylist(!showPlaylist)}
              className="rounded-lg p-2 text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors cursor-pointer">
              <ListMusic size={17} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <PlaylistDrawer isOpen={showPlaylist} onClose={() => setShowPlaylist(false)} />
    </>
  )
}

function VolumeControl({ volume, setVolume }: { volume: number; setVolume: (v: number) => void }) {
  const [prevVolume, setPrevVolume] = useState(volume)
  const toggleMute = () => {
    if (volume > 0) { setPrevVolume(volume); setVolume(0) }
    else { setVolume(prevVolume || 0.5) }
  }
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={toggleMute} className="p-1 text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors cursor-pointer">
        {volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>
      <input type="range" min={0} max={1} step={0.01} value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-[var(--sp-hairline)]/30
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--sp-accent-sienna)] [&::-webkit-slider-thumb]:cursor-pointer" />
    </div>
  )
}

function PlaylistDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { playlist, removeFromPlaylist, play, nowPlaying } = useMusic()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[60vh] overflow-y-auto
              border-t border-[var(--sp-hairline)]/30 bg-[var(--sp-surface)]/98 backdrop-blur-xl
              shadow-[0_-8px_48px_rgba(0,0,0,0.1)]"
            style={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}
          >
            <div className="sticky top-0 z-10 bg-[var(--sp-surface)]/98 backdrop-blur-xl pb-3"
              style={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
              <div className="flex items-center justify-between px-6 pt-4">
                <div className="flex items-center gap-2">
                  <ChevronUp size={16} className="text-[var(--sp-muted)]/40" />
                  <h3 className="text-sm font-semibold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-sans)' }}>
                    播放列表 · {playlist.length} 首
                  </h3>
                </div>
                <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors cursor-pointer">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="px-4 pb-8">
              {playlist.length === 0 ? (
                <div className="py-12 text-center text-sm text-[var(--sp-muted)]/60" style={{ fontFamily: 'var(--font-serif)' }}>
                  播放列表为空，快去搜索添加歌曲吧
                </div>
              ) : (
                <div className="space-y-1">
                  {playlist.map((song) => {
                    const isActive = nowPlaying?.n === song.n && nowPlaying?.msg === (song.searchMsg || '')
                    return (
                      <motion.div key={song.id} layout
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors cursor-pointer
                          ${isActive ? 'bg-[var(--sp-accent-sienna)]/5 border border-[var(--sp-accent-sienna)]/15'
                            : 'hover:bg-[var(--sp-surface-alt)] border border-transparent'}`}
                        onClick={() => play({ msg: song.searchMsg || '', n: song.n, name: song.title, singer: song.artist })}
                      >
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-[var(--sp-hairline)]/20">
                          {song.coverUrl ? (
                            <img src={song.coverUrl} alt={song.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[var(--sp-surface-alt)]">
                              <svg viewBox="0 0 16 16" className="h-3 w-3 opacity-20">
                                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
                                <circle cx="8" cy="8" r="1" fill="currentColor" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm ${isActive ? 'text-[var(--sp-accent-sienna)] font-semibold' : 'text-[var(--sp-ink)]'}`}
                            style={{ fontFamily: 'var(--font-sans)' }}>{song.title}</p>
                          <p className="truncate text-xs text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-serif)' }}>{song.artist}</p>
                        </div>
                        <motion.button whileTap={{ scale: 0.8 }}
                          onClick={(e) => { e.stopPropagation(); removeFromPlaylist(song.id) }}
                          className="shrink-0 rounded-lg p-1.5 text-[var(--sp-muted)]/30 hover:text-red-500 hover:bg-red-50
                            opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                          <Trash2 size={14} />
                        </motion.button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
