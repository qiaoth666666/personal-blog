/**
 * 全局路由加载状态
 *
 * 路由切换时在页面内容区域显示骨架屏，
 * Header/Footer 由 layout.tsx 保证始终可见。
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      {/* 标题骨架 */}
      <div className="mb-8">
        <div className="mx-auto h-10 w-40 animate-pulse rounded bg-[var(--sp-surface)]" />
      </div>

      {/* 内容骨架 */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-5 w-full animate-pulse rounded bg-[var(--sp-surface)]" />
            <div
              className="h-5 animate-pulse rounded bg-[var(--sp-surface)]"
              style={{ width: `${85 - i * 15}%` }}
            />
          </div>
        ))}
      </div>

      <p className="mt-12 text-sm text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-serif)' }}>
        正在加载...
      </p>
    </div>
  )
}
