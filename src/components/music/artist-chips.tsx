'use client'

import { motion } from 'framer-motion'
import { useMusic } from './music-context'

const POPULAR_ARTISTS = [
  '周杰伦', '陈奕迅', '林俊杰', '邓紫棋',
  '告五人', '薛之谦', '毛不易', 'Taylor Swift',
]

interface ArtistChipsProps {
  onSearch: (keyword: string) => void
}

export function ArtistChips({ onSearch }: ArtistChipsProps) {
  const { searchHasSearched } = useMusic()

  if (searchHasSearched) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="mx-auto max-w-7xl px-4 sm:px-6 mt-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-5 w-1 rounded-full bg-[var(--sp-accent-teal)]" />
        <h2
          className="text-sm font-semibold tracking-widest uppercase text-[var(--sp-muted)]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          精选歌手
        </h2>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {POPULAR_ARTISTS.map((artist, i) => (
          <motion.button
            key={artist}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.04, duration: 0.3 }}
            onClick={() => onSearch(artist)}
            className="group relative inline-flex items-center gap-2 rounded-full border border-[var(--sp-hairline)]/40 bg-[var(--sp-surface)] px-4 py-2 text-sm text-[var(--sp-muted)] transition-all duration-300 hover:border-[var(--sp-accent-teal)]/50 hover:text-[var(--sp-ink)] hover:shadow-[0_4px_16px_rgba(30,94,107,0.08)] cursor-pointer"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {/* 小圆点 */}
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--sp-accent-sienna)]/60 transition-transform duration-300 group-hover:scale-125" />
            {artist}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
