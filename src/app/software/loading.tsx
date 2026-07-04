/**
 * 软库页面加载骨架屏
 */
export default function SoftwareLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* 标题骨架 */}
      <div className="mb-16 text-center">
        <div className="mx-auto mb-5 h-4 w-24 animate-pulse rounded-sm bg-[var(--sp-surface)]" />
        <div className="mx-auto h-12 w-28 animate-pulse rounded-sm bg-[var(--sp-surface)]" />
        <div className="mx-auto mt-4 h-5 w-64 animate-pulse rounded-sm bg-[var(--sp-surface)]" />
      </div>

      {/* 搜索栏骨架 */}
      <div className="mx-auto mb-10 max-w-lg">
        <div className="h-10 w-full animate-pulse rounded-sm bg-[var(--sp-surface)]" />
      </div>

      {/* 分类标签骨架 */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-7 w-20 animate-pulse rounded-sm bg-[var(--sp-surface)]"
          />
        ))}
      </div>

      {/* 网格骨架 */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="flex flex-col border border-[var(--sp-hairline)]/40 bg-[var(--sp-surface)]"
          >
            <div className="h-[120px] animate-pulse bg-[var(--sp-surface-alt)]" />
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="h-3 w-12 animate-pulse rounded-sm bg-[var(--sp-surface-alt)]" />
              <div className="h-4 w-3/4 animate-pulse rounded-sm bg-[var(--sp-surface-alt)]" />
              <div className="h-8 w-full animate-pulse rounded-sm bg-[var(--sp-surface-alt)]" />
              <div className="mt-auto flex gap-2">
                <div className="h-4 w-10 animate-pulse rounded-sm bg-[var(--sp-surface-alt)]" />
                <div className="h-4 w-12 animate-pulse rounded-sm bg-[var(--sp-surface-alt)]" />
              </div>
              <div className="mt-1 h-8 w-full animate-pulse rounded-sm bg-[var(--sp-surface-alt)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
