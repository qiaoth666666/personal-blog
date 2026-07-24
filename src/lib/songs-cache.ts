/**
 * 歌曲缓存 —— 预扫描 FLAC 目录生成 JSON 缓存
 *
 * 避免每次刷新挨个 parseFile，从 100+ 次 I/O → 1 次
 * 检测文件夹 mtime 变化自动重新生成
 */

import fs from 'fs'
import path from 'path'
import { parseFile } from 'music-metadata'

const SONGS_DIR = path.join(process.cwd(), 'public/songs')
const CACHE_PATH = path.join(SONGS_DIR, 'songs.json')

export interface CachedSong {
  id: string
  name: string
  artist: string
  album: string
  duration: number
  durationFormat: string
  lyrics: string | null
  hasCover: boolean
  coverPath: string | null
  audioPath: string
}

let memoryCache: { songs: CachedSong[]; fingerprint: string } | null = null

function safeEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/'/g, '%27')
}

/** 生成目录指纹：文件名+大小+修改时间的哈希，重命名/增删都会变 */
function getFingerprint(): string {
  try {
    const files = fs.readdirSync(SONGS_DIR)
      .filter(f => f.endsWith('.flac'))
      .sort()
    return files.map(f => {
      const stat = fs.statSync(path.join(SONGS_DIR, f))
      return `${f}|${stat.size}|${stat.mtimeMs}`
    }).join('\n')
  } catch {
    return ''
  }
}

/** 扫描目录生成缓存 */
async function generateCache(): Promise<CachedSong[]> {
  const files = fs.readdirSync(SONGS_DIR).filter(f => f.endsWith('.flac'))

  const songs: CachedSong[] = await Promise.all(
    files.map(async (file) => {
      try {
        const filePath = path.join(SONGS_DIR, file)
        const meta = await parseFile(filePath, { duration: true })

        const name = meta.common.title || file.replace(/\.flac$/i, '')
        const artist = meta.common.artist || '未知艺术家'
        const album = meta.common.album || ''
        const duration = meta.format.duration || 0
        const minutes = Math.floor(duration / 60)
        const seconds = Math.floor(duration % 60)
        const durationFormat = `${minutes}:${seconds.toString().padStart(2, '0')}`
        const hasCover = !!(meta.common.picture && meta.common.picture.length > 0)

        // 提取歌词
        let lyricsRaw = ''
        if (meta.common.lyrics && Array.isArray(meta.common.lyrics) && meta.common.lyrics.length > 0) {
          const lrc = meta.common.lyrics[0]
          if (typeof lrc === 'string') {
            lyricsRaw = lrc
          } else if (lrc && typeof lrc === 'object') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const syncText = (lrc as any).syncText
            if (Array.isArray(syncText) && syncText.length > 0) {
              lyricsRaw = (syncText as Array<{ timestamp: number; text: string }>)
                .map(item => {
                  const ts = item.timestamp || 0
                  const min = Math.floor(ts / 60000)
                  const sec = ((ts % 60000) / 1000).toFixed(2)
                  return `[${String(min).padStart(2, '0')}:${String(sec).padStart(5, '0')}]${item.text || ''}`
                })
                .join('\n')
            }
            if (!lyricsRaw && 'text' in lrc) {
              lyricsRaw = (lrc as { text: string }).text
            }
          }
        }

        return {
          id: file,
          name,
          artist,
          album,
          duration,
          durationFormat,
          lyrics: lyricsRaw || null,
          hasCover,
          coverPath: hasCover ? `/api/music/local/cover?file=${safeEncode(file)}&v=1` : null,
          audioPath: `/songs/${safeEncode(file)}`,
        }
      } catch {
        const name = file.replace(/\.flac$/i, '')
        return {
          id: file,
          name,
          artist: '未知艺术家',
          album: '',
          duration: 0,
          durationFormat: '0:00',
          lyrics: null,
          hasCover: false,
          coverPath: null,
          audioPath: `/songs/${safeEncode(file)}`,
        }
      }
    }),
  )

  songs.sort((a, b) => a.id.localeCompare(b.id, 'zh'))
  return songs
}

/** 获取歌曲列表（内存缓存 → 磁盘缓存 → 生成） */
export async function getSongs(): Promise<CachedSong[]> {
  const fingerprint = getFingerprint()

  // 1. 内存缓存命中
  if (memoryCache && memoryCache.fingerprint === fingerprint) {
    return memoryCache.songs
  }

  // 2. 磁盘缓存（songs.json）
  try {
    if (fs.existsSync(CACHE_PATH)) {
      // 对比 JSON 里记录的文件指纹
      const raw = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'))
      if (raw._fingerprint === fingerprint) {
        const songs = raw.songs || raw
        memoryCache = { songs, fingerprint }
        return songs
      }
    }
  } catch { /* 磁盘缓存损坏，重新生成 */ }

  // 3. 重新扫描生成
  const songs = await generateCache()

  // 写入磁盘缓存，附带指纹
  try {
    const payload = { _fingerprint: fingerprint, songs }
    fs.writeFileSync(CACHE_PATH, JSON.stringify(payload, null, 2), 'utf-8')
    console.log('[songs-cache] 缓存已写入:', CACHE_PATH, songs.length, '首')
  } catch (err) {
    console.warn('[songs-cache] 写入磁盘缓存失败:', err)
  }

  memoryCache = { songs, fingerprint }
  return songs
}
