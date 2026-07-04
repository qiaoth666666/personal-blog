/**
 * 音乐 API 抽象层 —— 妖狐酷狗 API
 *
 * 接口: https://api.yaohud.cn/api/music/kg
 * 文档: https://api.yaohud.cn/doc/83
 */

// ============================================================
// 类型定义
// ============================================================

export interface LyricLine {
  /** 时间戳（秒） */
  time: number
  /** 歌词文本 */
  text: string
}

export interface SongResult {
  /** 搜索结果的序号 n（从1开始），用于获取播放链接 */
  n: number
  name: string
  singer: string
  album: string
  cover: string
  qualities: string[]
}

export interface SongDetail extends SongResult {
  cover: string
  playUrl: string
  duration: number
  durationFormat: string
  hash: Record<string, string>
  selectedQuality: string
  fileSizeFormat: string
  extName: string
  /** 原始 LRC 歌词文本 */
  lyricsRaw: string
  /** 解析后的歌词行 */
  lyrics: LyricLine[]
}

export interface SearchResponse {
  songs: SongResult[]
  text: string
  simplify: string
}

// ============================================================
// 歌词解析
// ============================================================

/** 解析 LRC 歌词文本为结构化数组 */
export function parseLrc(lrc: string): LyricLine[] {
  if (!lrc) return []
  const lines: LyricLine[] = []
  const timeRegex = /\[(\d{2}):(\d{2})(?:[.:](\d{2,3}))?\]/g

  for (const raw of lrc.split('\n')) {
    const text = raw.replace(/\[.*?\]/g, '').trim()
    if (!text) continue

    let match: RegExpExecArray | null
    timeRegex.lastIndex = 0
    while ((match = timeRegex.exec(raw)) !== null) {
      const min = parseInt(match[1], 10)
      const sec = parseInt(match[2], 10)
      let ms = 0
      if (match[3]) {
        ms = match[3].length === 2 ? parseInt(match[3], 10) * 10 : parseInt(match[3], 10)
      }
      lines.push({ time: min * 60 + sec + ms / 1000, text })
    }
  }

  lines.sort((a, b) => a.time - b.time)
  return lines
}

// ============================================================
// 配置
// ============================================================

const API_BASE = 'https://api.yaohud.cn/api/music/kg'

function apiKey(): string {
  return process.env.YAOHUD_API_KEY || ''
}

// ============================================================
// HTTP 工具
// ============================================================

async function fetchApi<T>(
  params: Record<string, string | number>,
  retries: number = 2,
): Promise<T> {
  const url = new URL(API_BASE)
  url.searchParams.set('key', apiKey())
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v))
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      // 指数退避 + 随机抖动
      const delay = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 500, 4000)
      await new Promise((r) => setTimeout(r, delay))
    }

    try {
      const res = await fetch(url.toString(), {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(12000),
      })

      if (!res.ok) {
        // 503 可重试，其他 HTTP 错误直接抛出
        if (res.status === 503 && attempt < retries) {
          const body = await res.text().catch(() => '')
          console.warn(`[music-api] 503 第${attempt + 1}次请求失败，即将重试:`, body.slice(0, 200))
          lastError = new Error(`HTTP ${res.status}`)
          continue
        }
        throw new Error(`HTTP ${res.status}`)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return res.json() as Promise<T>
    } catch (err) {
      // 网络超时或连接错误，尝试重试
      if (attempt < retries && (err instanceof TypeError || (err instanceof Error && err.message?.includes('timeout')))) {
        console.warn(`[music-api] 网络错误 第${attempt + 1}次请求失败，即将重试:`, err)
        lastError = err instanceof Error ? err : new Error(String(err))
        continue
      }
      throw err
    }
  }

  throw lastError || new Error(`请求失败 (已重试${retries}次)`)
}

// ============================================================
// 搜索（不传 n，返回歌曲列表）
// ============================================================

export async function searchMusic(
  keyword: string,
  count: number = 20,
): Promise<SearchResponse> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await fetchApi<any>({ msg: keyword, g: count })

    if (data.code !== 200 || !data.data?.songs) {
      console.warn('[music-api] 搜索失败:', data.code, data.msg)
      return { songs: [], text: '', simplify: '' }
    }

    return {
      songs: data.data.songs.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (s: any) => ({
          n: s.n,
          name: s.name,
          singer: s.singer,
          album: s.album || '',
          cover: s.cover || s.img || s.pic || s.image || s.album_img || s.album_pic || s.thumb || s.thumbnail || '',
          qualities: s.qualities || [],
        }),
      ),
      text: data.data.text || '',
      simplify: data.data.simplify || '',
    }
  } catch (err) {
    console.error('[music-api] 搜索异常:', err)
    return { songs: [], text: '', simplify: '' }
  }
}

// ============================================================
// 获取单曲详情 + 播放链接（传 n 和 msg）
// ============================================================

export async function getSongDetail(
  msg: string,
  n: number,
  quality: string = 'flac',
): Promise<SongDetail | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await fetchApi<any>({ msg, n, quality })

    if (data.code !== 200 || !data.data) {
      console.warn('[music-api] 获取歌曲失败:', data.code, data.msg)
      return null
    }

    const d = data.data
    // 尝试多种字段名获取歌词文本
    let lyricsRaw: string = d.lyrics || d.lrc || d.lyric || d.lrcContent || d.lyrics_content || d.lrc_content || ''
    // 如果是 URL（如 lrcUrl），则拉取实际内容
    if (!lyricsRaw && (d.lrcUrl || d.lyricUrl)) {
      try {
        const lrcUrl = d.lrcUrl || d.lyricUrl
        const lrcRes = await fetch(lrcUrl, { signal: AbortSignal.timeout(5000) })
        lyricsRaw = await lrcRes.text()
      } catch { /* ignore */ }
    }
    return {
      n: Number(d.n),
      name: d.name,
      singer: d.singer,
      album: d.album || '',
      qualities: [],
      cover: d.cover || '',
      playUrl: d.play_url || '',
      duration: d.duration || 0,
      durationFormat: d.duration_format || '',
      hash: d.hash || {},
      selectedQuality: d.selected_quality || quality,
      fileSizeFormat: d.file_size_format || '',
      extName: d.ext_name || '',
      lyricsRaw,
      lyrics: parseLrc(lyricsRaw),
    }
  } catch (err) {
    console.error('[music-api] 获取歌曲异常:', err)
    return null
  }
}

// ============================================================
// 获取歌词
// ============================================================

export async function getLyrics(
  msg: string,
  n: number,
): Promise<{ lyricsRaw: string; lyrics: LyricLine[] } | null> {
  // 1. 从详情接口获取（标准品质，包含歌词数据）
  try {
    const detail = await getSongDetail(msg, n, 'standard')
    if (detail && detail.lyricsRaw) {
      return { lyricsRaw: detail.lyricsRaw, lyrics: detail.lyrics }
    }
  } catch { /* continue */ }

  // 2. 尝试独立的 lrc 端点
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await fetchApi<any>({ msg, n, type: 'lrc' })
    if (data.code === 200) {
      const d = data.data || data
      const lyricsRaw = d.lyrics || d.lrc || d.lyric || d.lrcContent || d.lyrics_content || d.lrc_content || d.text || ''
      if (lyricsRaw) return { lyricsRaw, lyrics: parseLrc(lyricsRaw) }
    }
  } catch { /* ignore */ }

  // 3. 尝试 type=lyric
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await fetchApi<any>({ msg, n, type: 'lyric' })
    if (data.code === 200) {
      const d = data.data || data
      const lyricsRaw = d.lyrics || d.lrc || d.lyric || d.lrcContent || d.lyrics_content || d.lrc_content || d.text || d.content || ''
      if (lyricsRaw) return { lyricsRaw, lyrics: parseLrc(lyricsRaw) }
    }
  } catch { /* ignore */ }

  return null
}

// ============================================================
// 便捷方法: 获取播放 URL
// ============================================================

export async function getSongUrl(
  msg: string,
  n: number,
  quality: string = 'flac',
): Promise<string | null> {
  const detail = await getSongDetail(msg, n, quality)
  return detail?.playUrl || null
}
