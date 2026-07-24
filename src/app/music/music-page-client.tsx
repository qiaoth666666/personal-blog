'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { PageTransition } from '@/components/effects/page-transition'
import { MusicHero } from '@/components/music/music-hero'
import { SearchBar } from '@/components/music/search-bar'
import { SearchResults } from '@/components/music/search-results'
import { HotPicks } from '@/components/music/hot-picks'
import { ArtistChips } from '@/components/music/artist-chips'
import { NowPlayingBar } from '@/components/music/now-playing-bar'
import { SongDetailPanel } from '@/components/music/song-detail-panel'
import { useMusic } from '@/components/music/music-context'

const SongWall = dynamic(() => import('@/components/music/song-wall').then(m => ({ default: m.SongWall })), { ssr: false })

export function MusicPageClient() {
  const [isLoading, setIsLoading] = useState(false)
  const [wallReady, setWallReady] = useState(false)
  const { nowPlaying, searchSongs, searchHasSearched, searchKeyword, setSearchResults } = useMusic()

  const handleSearch = useCallback(async (keyword: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(keyword)}`)
      const data = await res.json()
      setSearchResults(keyword, data.songs || [])
    } catch {
      setSearchResults(keyword, [])
    } finally {
      setIsLoading(false)
    }
  }, [setSearchResults])

  return (
    <PageTransition>
      <div className={`music-page-bg ${nowPlaying ? 'pb-24' : ''}`}>
        <MusicHero />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-4 relative" style={{ minHeight: '60vh', zIndex: 1 }}>
          <SongWall onLoaded={() => setWallReady(true)} />
        </div>
        <div style={{ opacity: wallReady ? 1 : 0, pointerEvents: wallReady ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
        <div className="mx-auto max-w-5xl px-6 mt-6">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
        {!searchHasSearched && (
          <>
            <HotPicks />
            <ArtistChips onSearch={handleSearch} />
            <div className="py-8" />
          </>
        )}
        {searchHasSearched && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
            <SearchResults
              songs={searchSongs}
              isLoading={isLoading}
              hasSearched={searchHasSearched}
              searchKeyword={searchKeyword}
            />
          </div>
        )}
        {!nowPlaying && !searchHasSearched && <div className="py-24" />}
        </div>
      </div>
      <NowPlayingBar />
      <SongDetailPanel />
    </PageTransition>
  )
}
