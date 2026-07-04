/**
 * 简历 Section 标题 —— 统一的分隔标题样式
 *
 * 视觉: 居中分隔线 + 小号大写英文副标题
 */
export function SectionHeading({
  children,
  subtitle,
}: {
  children: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className="mb-8 text-center">
      {/* 顶部分隔线 */}
      <div className="mx-auto mb-4 h-px w-16 bg-[var(--sp-hairline)]" />

      <h2
        className="font-display text-2xl font-bold text-[var(--sp-ink)] md:text-3xl"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {children}
      </h2>

      {subtitle && (
        <p
          className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--sp-muted)]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
