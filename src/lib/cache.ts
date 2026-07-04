/**
 * 简易内存缓存 —— 避免相同数据反复查 DB
 *
 * 缓存策略:
 *   - 首页/简历/软库 → 60 秒（变化频率低）
 *   - 文章列表 → 30 秒
 *   - 留言 → 不缓存（实时性要求高）
 *
 * 去重:
 *   - 同一 key 的并发请求复用同一个 Promise，避免惊群效应
 *
 * 注意: 使用 globalThis 存储缓存以确保跨模块（API 路由 / 页面）共享，
 * 避免 Turbopack 模块隔离导致 invalidate 不生效。
 */

const globalCache = (
  (globalThis as any).__memory_cache || (
    (globalThis as any).__memory_cache = {
      store: new Map<string, { data: unknown; expiresAt: number }>(),
      pending: new Map<string, Promise<unknown>>(),
      cleanupTimer: null as ReturnType<typeof setInterval> | null,
    }
  )
) as {
  store: Map<string, { data: unknown; expiresAt: number }>
  pending: Map<string, Promise<unknown>>
  cleanupTimer: ReturnType<typeof setInterval> | null
}

const store = globalCache.store
const pending = globalCache.pending

// 每 5 分钟清理一次过期缓存（确保只注册一次定时器）
if (typeof setInterval !== 'undefined' && !globalCache.cleanupTimer) {
  globalCache.cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.expiresAt < now) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

export function cache<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  const cached = store.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.data as T)
  }

  // 复用正在执行的 Promise，避免并发请求重复查询 DB
  const inflight = pending.get(key)
  if (inflight) return inflight as Promise<T>

  const promise = fn()
    .then((data) => {
      store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 })
      return data
    })
    .finally(() => {
      pending.delete(key)
    })

  pending.set(key, promise)
  return promise
}

/** 清除指定 key 的缓存（数据变更后调用） */
export function invalidate(key: string) {
  store.delete(key)
}

/** 清除某个前缀的所有缓存 */
export function invalidatePrefix(prefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}
