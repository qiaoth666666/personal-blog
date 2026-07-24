'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Music4, Loader2 } from 'lucide-react'
import { useMusic } from './music-context'
import { VinylPlayer } from './vinyl-player'
import type { LyricLine } from '@/lib/music-api'

export function SongDetailPanel() {
  const {
    showDetailPanel,
    closeDetailPanel,
    nowPlaying,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    parsedLyrics,
  } = useMusic()

  const [panelMode, setPanelMode] = useState<'vinyl' | 'lyric'>('vinyl')
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [lyricsLoading, setLyricsLoading] = useState(false)
  const [coverUrl, setCoverUrl] = useState('')
  const lyricsRef = useRef<HTMLDivElement>(null)


  // 当面板打开或当前歌曲变化时获取歌词和封面
  useEffect(() => {
    if (!showDetailPanel || !nowPlaying) return

    const { msg, n, cover } = nowPlaying
    setCoverUrl(cover || '')

    // 本地歌曲直接用 context 中已解析的歌词
    if (msg === 'local') {
      setLyrics(parsedLyrics)
      setLyricsLoading(false)
      return
    }

    let cancelled = false

    async function fetchData() {
      setLyricsLoading(true)
      try {
        const title = nowPlaying?.name || ''
        const artist = nowPlaying?.singer || ''
        const [lyricsRes] = await Promise.all([
          fetch(`/api/music/lyrics?msg=${encodeURIComponent(msg)}&n=${n}&title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`),
          cover ? Promise.resolve() : (
            fetch(`/api/music/url?msg=${encodeURIComponent(msg)}&n=${n}&quality=standard`)
              .then((r) => r.json())
              .then((d) => { if (!cancelled && d.cover) setCoverUrl(d.cover) })
              .catch(() => {})
          ),
        ])
        const lyricsData = await lyricsRes.json()
        if (!cancelled && lyricsData.lyrics) {
          setLyrics(lyricsData.lyrics)
        } else if (!cancelled) {
          setLyrics([])
        }
      } catch {
        if (!cancelled) setLyrics([])
      } finally {
        if (!cancelled) setLyricsLoading(false)
      }
    }

    fetchData()
    setLyrics([])
    setLyricsLoading(true)

    return () => { cancelled = true }
  }, [showDetailPanel, nowPlaying?.msg, nowPlaying?.n, parsedLyrics]) // eslint-disable-line react-hooks/exhaustive-deps

  // 计算当前高亮歌词行
  const activeLyricIndex = lyrics.reduce((last, line, i) => {
    if (currentTime >= line.time) return i
    return last
  }, -1)

  // 自动滚动到当前歌词
  useEffect(() => {
    if (!lyricsRef.current || activeLyricIndex < 0) return
    const activeEl = lyricsRef.current.children[activeLyricIndex] as HTMLElement | undefined
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeLyricIndex])


  return (
    <AnimatePresence>
      {showDetailPanel && nowPlaying && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 32, mass: 1 }}
          className="fixed inset-x-0 top-0 bottom-0 z-40"
        >
          {/* 背景 */}
          <div className="relative h-full w-full bg-[var(--sp-surface)] overflow-hidden">

            {/* 模式切换（仅手机端显示）+ 关闭按钮 */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
              {/* 唱片/歌词切换 —— 仅手机端可见 */}
              <div className="md:hidden flex overflow-hidden rounded-lg border border-[var(--sp-hairline)]/30 bg-[var(--sp-surface)] text-xs">
                <button
                  onClick={() => setPanelMode('vinyl')}
                  className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                    panelMode === 'vinyl'
                      ? 'bg-[var(--sp-accent-sienna)] text-white'
                      : 'text-[var(--sp-muted)] hover:text-[var(--sp-ink)]'
                  }`}
                >
                  唱片
                </button>
                <button
                  onClick={() => setPanelMode('lyric')}
                  className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                    panelMode === 'lyric'
                      ? 'bg-[var(--sp-accent-sienna)] text-white'
                      : 'text-[var(--sp-muted)] hover:text-[var(--sp-ink)]'
                  }`}
                >
                  歌词
                </button>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={closeDetailPanel}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--sp-hairline)]/30 bg-[var(--sp-surface)] text-[var(--sp-muted)] hover:text-[var(--sp-ink)] hover:bg-[var(--sp-surface-alt)] transition-colors cursor-pointer"
              >
                <ChevronDown size={18} />
              </motion.button>
            </div>

            {/* 主内容 */}
            <div className="flex h-full flex-col md:flex-row items-start gap-8 md:gap-10 px-6 py-8 md:py-10 overflow-y-auto">
              {/* 黑胶唱片机：手机端跟随 panelMode，桌面端始终显示 */}
              <div className={`${panelMode === 'lyric' ? 'hidden' : 'flex'} md:flex w-full flex-col items-center justify-center md:w-[500px] md:ml-60 md:mt-16 min-h-[60vh] md:min-h-0`}>
                  <div className="scale-[0.6] sm:scale-[0.7] md:scale-100 origin-center">
                    <VinylPlayer
                      coverUrl={coverUrl}
                      isPlaying={isPlaying && (nowPlaying?.url ? true : false)}
                      onTogglePlay={togglePlay}
                      progress={duration > 0 ? currentTime / duration : 0}
                    />
                  </div>

                  {/* 歌曲信息 */}
                  <div className="text-center -mt-8 md:mt-3">
                    <p className="text-base font-semibold text-[var(--sp-ink)] truncate max-w-[280px]" style={{ fontFamily: 'var(--font-sans)' }}>
                      {nowPlaying.name}
                    </p>
                    <p className="text-sm text-[var(--sp-muted)] truncate max-w-[280px]" style={{ fontFamily: 'var(--font-serif)' }}>
                      {nowPlaying.singer}
                    </p>
                  </div>
                </div>

              {/* 歌词：手机端跟随 panelMode，桌面端始终显示 */}
              <div className={`${panelMode === 'vinyl' ? 'hidden' : 'block'} md:block flex-1 min-h-0 w-full max-w-2xl mx-auto`}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h3
                      className="mb-5 text-sm font-semibold tracking-widest uppercase text-[var(--sp-muted)]/50 text-center"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {nowPlaying.name}
                    </h3>

                  {lyricsLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 size={24} className="animate-spin text-[var(--sp-muted)]/30" />
                    </div>
                  ) : lyrics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Music4 size={32} className="text-[var(--sp-muted)]/15 mb-3" />
                      <p className="text-base text-[var(--sp-muted)]/50" style={{ fontFamily: 'var(--font-serif)' }}>
                        暂无歌词
                      </p>
                      <p className="mt-1 text-sm text-[var(--sp-muted)]/30" style={{ fontFamily: 'var(--font-serif)' }}>
                        纯音乐或歌词未收录
                      </p>
                    </div>
                  ) : (
                    <div
                      ref={lyricsRef}
                      className="max-h-[50vh] md:max-h-[60vh] overflow-y-auto scrollbar-none space-y-1.5 text-center"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {lyrics.map((line, i) => {
                        const isActive = i === activeLyricIndex
                        return (
                          <motion.p
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.015 * Math.min(i, 60), duration: 0.3 }}
                            className={`transition-all duration-300 px-3 py-2 rounded-lg cursor-pointer leading-relaxed ${
                              isActive
                                ? 'text-[var(--sp-accent-sienna)] font-semibold text-xl bg-[var(--sp-accent-sienna)]/5'
                                : 'text-[var(--sp-muted)]/70 text-lg hover:text-[var(--sp-ink)] hover:bg-[var(--sp-hairline)]/20'
                            }`}
                            style={{ fontFamily: 'var(--font-serif)' }}
                            onClick={() => seek(line.time)}
                          >
                            {line.text}
                          </motion.p>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              </div>
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
