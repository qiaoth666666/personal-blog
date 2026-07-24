/**
 * Next.js Instrumentation Hook
 *
 * 在服务启动时预热 DB 连接池，避免首次请求支付建连成本。
 * 仅在 Node.js 运行时执行（Edge/Middleware 环境跳过）。
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { warmup } = await import('@/lib/db')
      await warmup()
      console.log('[instrumentation] DB connection pool warmed')
    } catch (err) {
      console.warn('[instrumentation] DB warm-up failed (non-fatal):', (err as Error).message)
    }
  }
}
