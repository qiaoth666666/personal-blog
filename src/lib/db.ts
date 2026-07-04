import mysql, { type Pool, type RowDataPacket, type ResultSetHeader } from 'mysql2/promise'

// ============================================================
// MySQL 连接池 —— 替代 PrismaClient
//
// 使用 globalThis 单例避免 Next.js 开发模式 HMR 热更新时
// 重复创建连接池导致 "Too many connections" 错误。
// ============================================================

const globalForPool = globalThis as unknown as { __dbPool?: Pool }

function parseDatabaseUrl(url: string) {
  // 格式: mysql://user:password@host:port/database
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '3306', 10),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace('/', ''),
  }
}

function createPool(): Pool {
  const dbUrl = process.env.DATABASE_URL

  if (!dbUrl) {
    throw new Error('DATABASE_URL 环境变量未设置')
  }

  const { host, port, user, password, database } = parseDatabaseUrl(dbUrl)

  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 5000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  })
}

const pool: Pool = globalForPool.__dbPool ?? createPool()

// 开发模式下挂到 globalThis，避免 HMR 重复创建
if (process.env.NODE_ENV !== 'production') {
  globalForPool.__dbPool = pool
}

// ============================================================
// 类型安全的查询辅助函数
// ============================================================

type QueryParams = (string | number | boolean | null | Date)[]

/** 执行查询并返回多行结果（SELECT） */
export async function query<T extends RowDataPacket>(
  sql: string,
  params?: QueryParams,
): Promise<T[]> {
  const [rows] = await pool.query<RowDataPacket[]>(sql, params)
  return rows as T[]
}

/** 执行查询并返回单行结果，无结果返回 null */
export async function queryOne<T extends RowDataPacket>(
  sql: string,
  params?: QueryParams,
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return (rows[0] as T) ?? null
}

/** 执行写操作（INSERT/UPDATE/DELETE），返回 affectedRows 和 insertId */
export async function execute(
  sql: string,
  params?: QueryParams,
): Promise<{ affectedRows: number; insertId: number }> {
  const [result] = await pool.execute<ResultSetHeader>(
    sql,
    params as Parameters<typeof pool.execute>[1],
  )
  return { affectedRows: result.affectedRows, insertId: result.insertId }
}

/** 执行 COUNT 查询并返回数量 */
export async function count(
  table: string,
  where?: string,
  params?: QueryParams,
): Promise<number> {
  const w = where ? `WHERE ${where}` : ''
  const sql = `SELECT COUNT(*) AS cnt FROM \`${table}\` ${w}`
  const row = await queryOne<RowDataPacket & { cnt: number }>(sql, params)
  return row?.cnt ?? 0
}

/** 在事务中执行操作。回调接收事务化的 query/queryOne/execute，失败自动回滚 */
export async function transaction<T>(
  fn: (tx: {
    query: <R extends RowDataPacket>(sql: string, params?: QueryParams) => Promise<R[]>
    queryOne: <R extends RowDataPacket>(sql: string, params?: QueryParams) => Promise<R | null>
    execute: (sql: string, params?: QueryParams) => Promise<{ affectedRows: number; insertId: number }>
  }) => Promise<T>,
): Promise<T> {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const txQuery = async <R extends RowDataPacket>(
      sql: string,
      params?: QueryParams,
    ): Promise<R[]> => {
      const [rows] = await conn.query<R[]>(sql, params)
      return rows
    }
    const txQueryOne = async <R extends RowDataPacket>(
      sql: string,
      params?: QueryParams,
    ): Promise<R | null> => {
      const rows = await txQuery<R>(sql, params)
      return (rows[0] as R) ?? null
    }
    const txExecute = async (
      sql: string,
      params?: QueryParams,
    ): Promise<{ affectedRows: number; insertId: number }> => {
      const [result] = await conn.execute<ResultSetHeader>(
        sql,
        params as Parameters<typeof pool.execute>[1],
      )
      return { affectedRows: result.affectedRows, insertId: result.insertId }
    }

    const result = await fn({ query: txQuery, queryOne: txQueryOne, execute: txExecute })
    await conn.commit()
    return result
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}

/** 预热连接池 — instrumentation 调用 */
export async function warmup(): Promise<void> {
  await pool.execute('SELECT 1')
}

export default pool
