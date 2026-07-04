import { queryOne } from '@/lib/db'
import type { MarkdownConfig } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { MARKDOWN_DEFAULTS, MD_VAR_KEYS } from '@/lib/constants'
import type { MarkdownContentType, MarkdownVarMap } from '@/lib/constants'

/** 在根布局中注入 Markdown 排版 CSS 变量
 *
 *  从数据库读取用户自定义值，写入对应 CSS 选择器。
 *  无配置时输出空 —— globals.css 中的默认值生效。
 */
export async function MarkdownFormatStyles() {
  let stored: Record<string, Record<string, string>> | null = null

  try {
    const row = await queryOne<MarkdownConfig & RowDataPacket>(
      'SELECT * FROM `MarkdownConfig` LIMIT 1',
    )
    if (row) stored = JSON.parse(row.config)
  } catch {
    // 数据库不可用时静默降级
  }

  if (!stored) return null

  // 每个内容类型对应一个 CSS 选择器
  const selectorMap: Record<string, string> = {
    article: '.article-content',
    software: '.software-content',
    'resume-web': '.resume-markdown',
    'resume-a4': '.a4-markdown',
    about: '.site-intro-content',
    preview: '.prose-custom',
  }

  // 生成 CSS 规则
  const rules: string[] = []

  for (const [type, selector] of Object.entries(selectorMap)) {
    const vars = stored[type] as MarkdownVarMap | undefined
    if (!vars) continue

    const declarations = MD_VAR_KEYS.filter((k) => vars[k] !== undefined)
      .map((k) => `${k}:${vars[k]}`)
      .join(';')

    if (declarations) {
      rules.push(`${selector}{${declarations}}`)
    }
  }

  if (rules.length === 0) return null

  return <style dangerouslySetInnerHTML={{ __html: rules.join('\n') }} />
}
