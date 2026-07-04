'use client'

import { motion } from 'framer-motion'
import { Music4 } from 'lucide-react'
import { SongCard } from './song-card'
import type { SongResult } from '@/lib/music-api'

interface SearchResultsProps {
  songs: SongResult[]
  isLoading: boolean
  hasSearched: boolean
  searchKeyword: string
}

function SkeletonCard() {
  return (
    <div
      className="animate-pulse overflow-hidden bg-[var(--sp-surface)] border border-[var(--sp-hairline)]/30"
      style={{ borderRadius: '12px' }}
    >
      <div className="aspect-square bg-[var(--sp-surface-alt)]" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-3.5 w-4/5 rounded bg-[var(--sp-surface-alt)]" />
        <div className="h-3 w-3/5 rounded bg-[var(--sp-surface-alt)]" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-2.5 w-2/5 rounded bg-[var(--sp-surface-alt)]" />
          <div className="h-6 w-6 rounded-full bg-[var(--sp-surface-alt)]" />
        </div>
      </div>
    </div>
  )
}

export function SearchResults({ songs, isLoading, hasSearched, searchKeyword }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (hasSearched && songs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-16 flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="relative mb-8">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-[var(--sp-hairline)]/30 bg-[var(--sp-surface)]">
            <Music4 size={40} className="text-[var(--sp-muted)]/30" />
          </div>
          <div className="absolute inset-0 rounded-full border border-[var(--sp-hairline)]/15 scale-[1.25]" />
          <div className="absolute inset-0 rounded-full border border-[var(--sp-hairline)]/10 scale-[1.5]" />
        </div>
        <p className="text-lg text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-display)' }}>
          未找到与「{searchKeyword}」相关的歌曲
        </p>
        <p className="mt-2 text-sm text-[var(--sp-muted)]/60" style={{ fontFamily: 'var(--font-serif)' }}>
          试试其他关键词
        </p>
      </motion.div>
    )
  }

  if (!hasSearched) return null

  return (
    <div className="mt-10">
      <p
        className="mb-5 text-xs font-medium tracking-widest uppercase text-[var(--sp-muted)]/60"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        找到 {songs.length} 首歌曲
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {songs.map((song, i) => (
          <SongCard
            key={song.n}
            song={{
              n: song.n,
              name: song.name,
              singer: song.singer,
              album: song.album,
              cover: song.cover,
              qualities: song.qualities,
            }}
            searchMsg={searchKeyword}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}
