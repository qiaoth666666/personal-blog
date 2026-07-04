'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { MusicPlaylist } from '@/types/db'
import type { LyricLine, SongResult } from '@/lib/music-api'

// ============================================================
// 模块级 Audio 单例 —— 跨 React 挂载周期存活
// ============================================================
let globalAudio: HTMLAudioElement | null = null
function getAudio(volume: number): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio()
    globalAudio.volume = volume
  }
  return globalAudio
}

// ============================================================
// 模块级 URL 缓存 —— 避免重复请求播放链接
// ============================================================
const urlCache = new Map<string, { url: string; cover: string; duration: number; durationFormat: string }>()

// ============================================================
// 模块级封面缓存 + 并发限制队列
// ============================================================
const coverCache = new Map<string, string>()
let coverFetchInFlight = 0
const MAX_CONCURRENT_COVER_FETCHES = 3
const coverFetchQueue: Array<() => void> = []

function drainCoverQueue() {
  while (coverFetchInFlight < MAX_CONCURRENT_COVER_FETCHES && coverFetchQueue.length > 0) {
    const next = coverFetchQueue.shift()
    if (next) next()
  }
}

async function fetchCoverSingle(msg: string, n: number): Promise<string> {
  const cacheKey = `${msg}|${n}`
  const cached = coverCache.get(cacheKey)
  if (cached !== undefined) return cached

  return new Promise<string>((resolve) => {
    const doFetch = async () => {
      coverFetchInFlight++
      try {
        const res = await fetch(
          `/api/music/url?msg=${encodeURIComponent(msg)}&n=${n}&quality=standard`,
        )
        const data = await res.json()
        const cover = data.cover || ''
        coverCache.set(cacheKey, cover)
        resolve(cover)
      } catch {
        coverCache.set(cacheKey, '')
        resolve('')
      } finally {
        coverFetchInFlight--
        drainCoverQueue()
      }
    }

    if (coverFetchInFlight < MAX_CONCURRENT_COVER_FETCHES) {
      doFetch()
    } else {
      coverFetchQueue.push(doFetch)
    }
  })
}

// ============================================================
// SessionStorage 状态持久化
// ============================================================
const SEARCH_STORAGE_KEY = 'music_search_state'
const NOW_PLAYING_STORAGE_KEY = 'music_now_playing'

function loadSearchState(): { keyword: string; songs: SongResult[] } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SEARCH_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveSearchState(keyword: string, songs: SongResult[]) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify({ keyword, songs }))
  } catch { /* ignore */ }
}

function clearSearchState() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(SEARCH_STORAGE_KEY)
  } catch { /* ignore */ }
}

function loadNowPlaying(): NowPlaying | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(NOW_PLAYING_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveNowPlaying(np: NowPlaying | null) {
  if (typeof window === 'undefined') return
  try {
    if (np) {
      // 不保存会过期的 url，但保存其他元数据
      sessionStorage.setItem(NOW_PLAYING_STORAGE_KEY, JSON.stringify({
        msg: np.msg, n: np.n, name: np.name, singer: np.singer,
        cover: np.cover, duration: np.duration, durationFormat: np.durationFormat,
      }))
    } else {
      sessionStorage.removeItem(NOW_PLAYING_STORAGE_KEY)
    }
  } catch { /* ignore */ }
}

// ============================================================
// 类型
// ============================================================

export interface NowPlaying {
  msg: string
  n: number
  name: string
  singer: string
  cover: string
  duration: number
  durationFormat: string
  url: string | null
}

interface MusicContextType {
  nowPlaying: NowPlaying | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number

  /** 正在加载播放链接的歌曲标识 */
  loadingSong: { n: number; msg: string } | null

  playlist: MusicPlaylist[]
  playlistLoading: boolean

  /** 当前搜索结果的播放队列（用于上下曲切换） */
  playQueue: SongResult[]
  playQueueKeyword: string

  /** 持久化的搜索状态 */
  searchSongs: SongResult[]
  searchHasSearched: boolean
  searchKeyword: string

  play: (song: { msg: string; n: number; name: string; singer: string }) => void
  togglePlay: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
  playNext: () => void
  playPrev: () => void

  setSearchResults: (keyword: string, songs: SongResult[]) => void
  clearSearch: () => void

  /** 歌曲详情面板 */
  showDetailPanel: boolean
  toggleDetailPanel: () => void
  closeDetailPanel: () => void

  /** 导航栏歌词显示 */
  showNavLyrics: boolean
  toggleNavLyrics: () => void
  currentNavLyric: string
  setCurrentNavLyric: (line: string) => void
  /** 解析后的歌词行（可在面板复用） */
  parsedLyrics: LyricLine[]
  setParsedLyrics: (lyrics: LyricLine[]) => void

  /** 按需获取单首歌曲封面（带缓存+并发限制） */
  fetchCover: (msg: string, n: number) => Promise<string>

  addToPlaylist: (song: {
    n: number
    msg: string
    name: string
    singer: string
    album?: string
    cover?: string
    duration?: number
    durationFormat?: string
  }) => Promise<void>
  removeFromPlaylist: (id: number) => Promise<void>
  refreshPlaylist: () => Promise<void>
}

const MusicContext = createContext<MusicContextType | null>(null)

export function MusicProvider({ children }: { children: ReactNode }) {
  // 初始化为空值，避免 SSR hydration 不匹配
  // 真实状态在 useEffect 中从 sessionStorage 恢复
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.75)

  const [loadingSong, setLoadingSong] = useState<{ n: number; msg: string } | null>(null)

  const [playlist, setPlaylist] = useState<MusicPlaylist[]>([])
  const [playlistLoading, setPlaylistLoading] = useState(false)

  const [playQueue, setPlayQueue] = useState<SongResult[]>([])
  const [playQueueKeyword, setPlayQueueKeyword] = useState('')
  const [searchSongs, setSearchSongs] = useState<SongResult[]>([])
  const [searchHasSearched, setSearchHasSearched] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')

  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const toggleDetailPanel = useCallback(() => setShowDetailPanel((v) => !v), [])
  const closeDetailPanel = useCallback(() => setShowDetailPanel(false), [])

  const [showNavLyrics, setShowNavLyrics] = useState(true)
  const [currentNavLyric, setCurrentNavLyric] = useState('')
  const toggleNavLyrics = useCallback(() => setShowNavLyrics((v) => !v), [])
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([])

  // ============================================================
  // 挂载后从 sessionStorage 恢复状态（避免 SSR hydration 不匹配）
  // ============================================================
  useEffect(() => {
    const savedNowPlaying = loadNowPlaying()
    if (savedNowPlaying) {
      setNowPlaying(savedNowPlaying)
      setDuration(savedNowPlaying.duration || 0)
    }

    const savedSearch = loadSearchState()
    if (savedSearch) {
      setPlayQueue(savedSearch.songs || [])
      setPlayQueueKeyword(savedSearch.keyword || '')
      setSearchSongs(savedSearch.songs || [])
      setSearchHasSearched(true)
      setSearchKeyword(savedSearch.keyword || '')
    }

    // 同步 Audio 当前状态
    const audio = getAudio(volume)
    if (!audio.paused && audio.src) {
      setIsPlaying(true)
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration || 0)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================
  // Audio 事件绑定
  // ============================================================
  useEffect(() => {
    const audio = getAudio(volume)

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration || 0)
    const onEnded = () => setIsPlaying(false)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [volume])

  // ============================================================
  // 持久化 nowPlaying 到 sessionStorage
  // ============================================================
  useEffect(() => {
    saveNowPlaying(nowPlaying)
  }, [nowPlaying])

  // ============================================================
  // 根据播放进度实时更新导航栏歌词
  // ============================================================
  useEffect(() => {
    if (parsedLyrics.length === 0 || !nowPlaying) return
    let activeLine = ''
    for (let i = parsedLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= parsedLyrics[i].time) {
        activeLine = parsedLyrics[i].text
        break
      }
    }
    if (activeLine) {
      setCurrentNavLyric(activeLine)
    }
  }, [currentTime, parsedLyrics, nowPlaying])

  // 动画面板：禁止背景滚动（不修改 body/html 样式，不触发偏移）
  useEffect(() => {
    if (showDetailPanel) {
      const prevent = (e: Event) => e.preventDefault()
      window.addEventListener('wheel', prevent, { passive: false })
      window.addEventListener('touchmove', prevent, { passive: false })
      return () => {
        window.removeEventListener('wheel', prevent)
        window.removeEventListener('touchmove', prevent)
      }
    }
  }, [showDetailPanel])

  // ============================================================
  // 搜索状态管理
  // ============================================================
  const setSearchResults = useCallback((keyword: string, songs: SongResult[]) => {
    setSearchKeyword(keyword)
    setSearchSongs(songs)
    setSearchHasSearched(true)
    setPlayQueue(songs)
    setPlayQueueKeyword(keyword)
    saveSearchState(keyword, songs)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchKeyword('')
    setSearchSongs([])
    setSearchHasSearched(false)
    setPlayQueue([])
    setPlayQueueKeyword('')
    clearSearchState()
  }, [])

  // ============================================================
  // 搜索结果预加载 —— 搜索完成后立即在后台预取所有歌曲的播放链接和封面
  // ============================================================
  useEffect(() => {
    if (!searchHasSearched || searchSongs.length === 0) return

    // 用 requestIdleCallback 延迟到浏览器空闲时执行
    const id = requestIdleCallback ? requestIdleCallback(() => {
      let index = 0
      const BATCH_SIZE = 3
      let cancelled = false

      function fetchBatch() {
        if (cancelled || index >= searchSongs.length) return
        const batch = searchSongs.slice(index, index + BATCH_SIZE)
        index += BATCH_SIZE

        Promise.allSettled(
          batch.map((song) =>
            fetch(
              `/api/music/url?msg=${encodeURIComponent(searchKeyword)}&n=${song.n}&quality=standard`,
            ).then((r) => r.json()),
          ),
        ).then((results) => {
          results.forEach((r, i) => {
            const song = batch[i]
            if (r.status === 'fulfilled' && r.value?.playUrl) {
              urlCache.set(`${searchKeyword}|${song.n}`, {
                url: r.value.playUrl,
                cover: r.value.cover || '',
                duration: r.value.duration || 0,
                durationFormat: r.value.durationFormat || '',
              })
            }
          })
          // 下一批
          setTimeout(fetchBatch, 100)
        })
      }

      fetchBatch()
    }) : 0

    return () => {
      if (id && typeof id === 'number') cancelIdleCallback(id)
    }
  }, [searchHasSearched, searchSongs, searchKeyword])

  // ============================================================
  // 播放
  // ============================================================
  const play = useCallback(
    async (song: { msg: string; n: number; name: string; singer: string }) => {
      setLoadingSong({ n: song.n, msg: song.msg })

      const cacheKey = `${song.msg}|${song.n}`

      try {
        // 检查缓存
        let playUrl: string | null = null
        let cover = ''
        let dur = 0
        let durFormat = ''
        let apiName = song.name
        let apiSinger = song.singer

        const cached = urlCache.get(cacheKey)
        if (cached) {
          playUrl = cached.url
          cover = cached.cover
          dur = cached.duration
          durFormat = cached.durationFormat
        } else {
          // 使用 standard 品质加快响应速度
          const res = await fetch(
            `/api/music/url?msg=${encodeURIComponent(song.msg)}&n=${song.n}&quality=standard`,
          )
          const data = await res.json()
          playUrl = data.playUrl || null
          cover = data.cover || ''
          dur = data.duration || 0
          durFormat = data.durationFormat || ''
          apiName = data.name || song.name
          apiSinger = data.singer || song.singer

          if (playUrl) {
            urlCache.set(cacheKey, { url: playUrl, cover, duration: dur, durationFormat: durFormat })
          }
        }

        const np: NowPlaying = {
          msg: song.msg,
          n: song.n,
          name: apiName,
          singer: apiSinger,
          cover,
          duration: dur,
          durationFormat: durFormat,
          url: playUrl,
        }
        setNowPlaying(np)
        setCurrentNavLyric(np.name)
        setCurrentTime(0)
        setDuration(dur)

        const audio = getAudio(volume)
        if (np.url) {
          audio.src = np.url
          audio.play().catch(() => {
            setIsPlaying(false)
          })

          // 后台加载歌词（用于导航栏显示）
          fetch(`/api/music/lyrics?msg=${encodeURIComponent(song.msg)}&n=${song.n}&title=${encodeURIComponent(apiName)}&artist=${encodeURIComponent(apiSinger)}`)
            .then((r) => r.json())
            .then((d) => { if (d.lyrics?.length) setParsedLyrics(d.lyrics) })
            .catch(() => {})

          // 播放成功后预加载前后歌曲
          preloadAdjacent(song.msg, song.n, playQueue, searchKeyword, playlist)
        }
      } catch (err) {
        console.error('播放失败:', err)
      } finally {
        setLoadingSong(null)
      }
    },
    [volume, playQueue, searchKeyword, playlist],
  )

  /** 播放成功后，在后台预加载当前歌曲的前后曲目（仅缓存 URL） */
  async function preloadAdjacent(
    msg: string,
    n: number,
    queue: SongResult[],
    kw: string,
    pl: MusicPlaylist[],
  ) {
    const toPreload: Array<{ msg: string; n: number }> = []

    // 从播放队列中找邻近曲目
    if (queue.length > 0) {
      const idx = queue.findIndex((s) => s.n === n)
      if (idx >= 0) {
        for (const offset of [1, 2]) {
          const nextIdx = (idx + offset) % queue.length
          const next = queue[nextIdx]
          if (next && !urlCache.has(`${kw}|${next.n}`)) {
            toPreload.push({ msg: kw, n: next.n })
          }
        }
        if (idx > 0) {
          const prev = queue[idx - 1]
          if (prev && !urlCache.has(`${kw}|${prev.n}`)) {
            toPreload.push({ msg: kw, n: prev.n })
          }
        }
      }
    }

    // 逐个预加载（非阻塞）
    for (const item of toPreload) {
      fetch(`/api/music/url?msg=${encodeURIComponent(item.msg)}&n=${item.n}&quality=standard`)
        .then((r) => r.json())
        .then((data) => {
          if (data.playUrl) {
            urlCache.set(`${item.msg}|${item.n}`, {
              url: data.playUrl,
              cover: data.cover || '',
              duration: data.duration || 0,
              durationFormat: data.durationFormat || '',
            })
          }
        })
        .catch(() => {})
    }
  }

  const togglePlay = useCallback(() => {
    const audio = getAudio(volume)
    if (!nowPlaying?.url) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
  }, [isPlaying, nowPlaying, volume])

  const seek = useCallback((time: number) => {
    const audio = getAudio(volume)
    audio.currentTime = time
    setCurrentTime(time)
  }, [volume])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    setVolumeState(clamped)
    getAudio(clamped).volume = clamped
  }, [])

  // ============================================================
  // 上下曲切换
  // ============================================================
  const playNext = useCallback(() => {
    if (!nowPlaying) return

    // 优先使用播放队列
    if (playQueue.length > 0) {
      const currentIdx = playQueue.findIndex((s) => s.n === nowPlaying.n)
      if (currentIdx >= 0 && currentIdx < playQueue.length - 1) {
        const next = playQueue[currentIdx + 1]
        play({ msg: searchKeyword, n: next.n, name: next.name, singer: next.singer })
        return
      }
      // 循环到第一首
      if (currentIdx >= 0 && playQueue.length > 0) {
        const first = playQueue[0]
        play({ msg: searchKeyword, n: first.n, name: first.name, singer: first.singer })
        return
      }
    }

    // 回退到播放列表
    if (playlist.length === 0) return
    const currentIdx = playlist.findIndex(
      (s) => s.n === nowPlaying.n && s.searchMsg === nowPlaying.msg,
    )
    if (currentIdx < 0) return
    const nextIdx = (currentIdx + 1) % playlist.length
    const next = playlist[nextIdx]
    if (next) {
      play({
        msg: next.searchMsg || '',
        n: next.n,
        name: next.title,
        singer: next.artist,
      })
    }
  }, [nowPlaying, playQueue, searchKeyword, playlist, play])

  const playPrev = useCallback(() => {
    if (!nowPlaying) return

    // 优先使用播放队列
    if (playQueue.length > 0) {
      const currentIdx = playQueue.findIndex((s) => s.n === nowPlaying.n)
      if (currentIdx > 0) {
        const prev = playQueue[currentIdx - 1]
        play({ msg: searchKeyword, n: prev.n, name: prev.name, singer: prev.singer })
        return
      }
      // 循环到最后一首
      if (currentIdx === 0 && playQueue.length > 0) {
        const last = playQueue[playQueue.length - 1]
        play({ msg: searchKeyword, n: last.n, name: last.name, singer: last.singer })
        return
      }
    }

    // 回退到播放列表
    if (playlist.length === 0) return
    const currentIdx = playlist.findIndex(
      (s) => s.n === nowPlaying.n && s.searchMsg === nowPlaying.msg,
    )
    if (currentIdx < 0) return
    const prevIdx = (currentIdx - 1 + playlist.length) % playlist.length
    const prev = playlist[prevIdx]
    if (prev) {
      play({
        msg: prev.searchMsg || '',
        n: prev.n,
        name: prev.title,
        singer: prev.artist,
      })
    }
  }, [nowPlaying, playQueue, searchKeyword, playlist, play])

  // ============================================================
  // 播放列表 CRUD
  // ============================================================
  const refreshPlaylist = useCallback(async () => {
    setPlaylistLoading(true)
    try {
      const res = await fetch('/api/music/playlist')
      const data = await res.json()
      setPlaylist(data.songs || [])
    } catch {
      // ignore
    } finally {
      setPlaylistLoading(false)
    }
  }, [])

  const addToPlaylist = useCallback(
    async (song: {
      n: number
      msg: string
      name: string
      singer: string
      album?: string
      cover?: string
      duration?: number
      durationFormat?: string
    }) => {
      try {
        const detailRes = await fetch(
          `/api/music/url?msg=${encodeURIComponent(song.msg)}&n=${song.n}&quality=standard`,
        )
        const detail = await detailRes.json()

        await fetch('/api/music/playlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            n: song.n,
            msg: song.msg,
            name: detail.name || song.name,
            singer: detail.singer || song.singer,
            album: detail.album || song.album || '',
            coverUrl: detail.cover || song.cover || '',
            duration: detail.duration || song.duration || 0,
            durationFormat: detail.durationFormat || song.durationFormat || '',
          }),
        })
        await refreshPlaylist()
      } catch {
        // ignore
      }
    },
    [refreshPlaylist],
  )

  const removeFromPlaylist = useCallback(
    async (id: number) => {
      try {
        await fetch(`/api/music/playlist/${id}`, { method: 'DELETE' })
        await refreshPlaylist()
      } catch {
        // ignore
      }
    },
    [refreshPlaylist],
  )

  useEffect(() => {
    refreshPlaylist()
  }, [refreshPlaylist])

  return (
    <MusicContext.Provider
      value={{
        nowPlaying,
        isPlaying,
        currentTime,
        duration,
        volume,
        loadingSong,
        playlist,
        playlistLoading,
        playQueue,
        playQueueKeyword,
        searchSongs,
        searchHasSearched,
        searchKeyword,
        play,
        togglePlay,
        seek,
        setVolume,
        playNext,
        playPrev,
        setSearchResults,
        clearSearch,
        showDetailPanel,
        toggleDetailPanel,
        closeDetailPanel,
        showNavLyrics,
        toggleNavLyrics,
        currentNavLyric,
        setCurrentNavLyric,
        parsedLyrics,
        setParsedLyrics,
        fetchCover: fetchCoverSingle,
        addToPlaylist,
        removeFromPlaylist,
        refreshPlaylist,
      }}
    >
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) {
    throw new Error('useMusic must be used within MusicProvider')
  }
  return ctx
}
