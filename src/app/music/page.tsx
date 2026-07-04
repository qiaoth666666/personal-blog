'use client'

import { useState, useCallback } from 'react'
import { PageTransition } from '@/components/effects/page-transition'
import { MusicHero } from '@/components/music/music-hero'
import { SearchBar } from '@/components/music/search-bar'
import { SearchResults } from '@/components/music/search-results'
import { HotPicks } from '@/components/music/hot-picks'
import { ArtistChips } from '@/components/music/artist-chips'
import { NowPlayingBar } from '@/components/music/now-playing-bar'
import { SongDetailPanel } from '@/components/music/song-detail-panel'
import { useMusic } from '@/components/music/music-context'

export default function MusicPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { nowPlaying, searchSongs, searchHasSearched, searchKeyword, setSearchResults } = useMusic()

  const handleSearch = useCallback(async (keyword: string) => {
    setIsLoading(true)

    try {
      const res = await fetch(
        `/api/music/search?q=${encodeURIComponent(keyword)}`,
      )
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
      <div className={nowPlaying ? 'pb-24' : ''}>
        <MusicHero />

        <div className="mx-auto max-w-5xl px-6">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* 搜索前：热门推荐 + 精选歌手 */}
        {!searchHasSearched && (
          <>
            <HotPicks />
            <ArtistChips onSearch={handleSearch} />
            <div className="py-8" />
          </>
        )}

        {/* 搜索后：搜索结果 */}
        {searchHasSearched && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SearchResults
              songs={searchSongs}
              isLoading={isLoading}
              hasSearched={searchHasSearched}
              searchKeyword={searchKeyword}
            />
          </div>
        )}

        {!nowPlaying && !searchHasSearched && <div className="py-16" />}
      </div>

      <NowPlayingBar />
      <SongDetailPanel />
    </PageTransition>
  )
}
