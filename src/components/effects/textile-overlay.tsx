import { cn } from '@/lib/utils'

interface TextileOverlayProps {
  className?: string
  /** Opacity of the textile pattern, default 0.4 */
  opacity?: number
}

/**
 * 布纹纹理叠加 — 模拟精装书布面纹理
 * 用于 Section 分隔处，营造触感
 */
export function TextileOverlay({ className, opacity = 0.4 }: TextileOverlayProps) {
  return (
    <div
      className={cn('textile-overlay pointer-events-none absolute inset-0', className)}
      style={{ opacity }}
      aria-hidden="true"
    />
  )
}

/**
 * 带布纹纹理的 Section 容器
 */
export function TextileSection({
  className,
  children,
  opacity = 0.4,
}: {
  className?: string
  children: React.ReactNode
  opacity?: number
}) {
  return (
    <section className={cn('relative overflow-hidden bg-[var(--sp-ground)]', className)}>
      <TextileOverlay opacity={opacity} />
      <div className="relative z-10">{children}</div>
    </section>
  )
}
