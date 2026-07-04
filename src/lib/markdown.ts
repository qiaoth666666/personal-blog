/** 简易 Markdown → HTML 渲染
 *
 *  所有间距通过 CSS 自定义属性控制，容器可通过设置这些变量来调节排版：
 *  --md-h1-mt / --md-h1-mb      标题间距
 *  --md-h2-mt / --md-h2-mb
 *  --md-h3-mt / --md-h3-mb
 *  --md-p-mb / --md-p-leading   段落间距与行高
 *  --md-li-ml / --md-li-mb      列表项间距
 *  --md-li-font-size            列表项字号
 *  --md-ul-pl / --md-ul-mb      无序列表
 *  --md-ol-pl / --md-ol-mb      有序列表
 *  --md-blockquote-my           引用块间距
 *  --md-hr-my                  水平线间距
 *  --md-pre-p / --md-pre-my    代码块内边距与间距
 *  --md-img-my                 图片间距
 *  --md-code-px / --md-code-py 行内代码内边距
 */
export function renderMarkdown(content: string): string {
  // ── 预处理：列表块 ──
  // 必须在其他规则之前处理，确保连续列表项被包裹在 <ul>/<ol> 中
  let processed = content

  // 无序列表块：匹配一行或多行连续的 "- item"
  processed = processed.replace(/^- [^\n]+(?:\n- [^\n]+)*/gm, (block) => {
    const items = block
      .split('\n')
      .map(
        (line) =>
          '<li style="margin-left:var(--md-li-ml,1rem);margin-bottom:var(--md-li-mb,0.25rem);font-size:var(--md-li-font-size,inherit)">' +
          line.slice(2) +
          '</li>',
      )
    return (
      '<ul class="list-disc" style="padding-left:var(--md-ul-pl,1.5rem);margin-bottom:var(--md-ul-mb,1.25rem)">' +
      items.join('') +
      '</ul>'
    )
  })

  // 有序列表块：匹配一行或多行连续的 "N. item"
  processed = processed.replace(/^\d+\.[^\n]+(?:\n\d+\.[^\n]+)*/gm, (block) => {
    const items = block
      .split('\n')
      .map(
        (line) =>
          '<li style="margin-left:var(--md-li-ml,1rem);margin-bottom:var(--md-li-mb,0.25rem);font-size:var(--md-li-font-size,inherit)">' +
          line.replace(/^\d+\. /, '') +
          '</li>',
      )
    return (
      '<ol class="list-decimal" style="padding-left:var(--md-ol-pl,1.5rem);margin-bottom:var(--md-ol-mb,1.25rem)">' +
      items.join('') +
      '</ol>'
    )
  })

  // ── 段落样式字符串 ──
  const P_OPEN =
    '<p style="margin-bottom:var(--md-p-mb,1.25rem);line-height:var(--md-p-leading,1.625);font-size:var(--md-p-font-size,inherit)">'

  return (
    processed
      // 标题（保留字体/字重/颜色的 className，间距改为 CSS 变量）
      .replace(
        /^### (.+)$/gm,
        '<h3 id="$1" class="font-display text-xl font-bold text-[var(--sp-ink)]" style="margin-top:var(--md-h3-mt,2rem);margin-bottom:var(--md-h3-mb,1rem);font-size:var(--md-h3-font-size,inherit)">$1</h3>',
      )
      .replace(
        /^## (.+)$/gm,
        '<h2 id="$1" class="font-display text-2xl font-bold text-[var(--sp-ink)]" style="margin-top:var(--md-h2-mt,2.5rem);margin-bottom:var(--md-h2-mb,1.25rem);font-size:var(--md-h2-font-size,inherit)">$1</h2>',
      )
      .replace(
        /^# (.+)$/gm,
        '<h1 class="font-display text-3xl font-bold text-[var(--sp-ink)]" style="margin-top:var(--md-h1-mt,3rem);margin-bottom:var(--md-h1-mb,1.5rem);font-size:var(--md-h1-font-size,inherit)">$1</h1>',
      )
      // Pull Quote（特殊样式，间距改用变量）
      .replace(
        /^> "(.+)"$/gm,
        '<blockquote class="pull-quote" style="margin-top:var(--md-blockquote-my,1rem);margin-bottom:var(--md-blockquote-my,1rem)">$1</blockquote>',
      )
      // 普通引用（保留视觉样式，间距改用变量）
      .replace(
        /^> (.+)$/gm,
        '<blockquote class="border-l-2 border-[var(--sp-accent-teal)] pl-4 italic text-[var(--sp-muted)]" style="margin-top:var(--md-blockquote-my,1rem);margin-bottom:var(--md-blockquote-my,1rem);font-size:var(--md-blockquote-font-size,inherit)">$1</blockquote>',
      )
      // 粗体/斜体
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // 行内代码（保留字体/颜色/背景，间距改用变量）
      .replace(
        /`([^`]+)`/g,
        '<code class="font-mono text-sm bg-[var(--sp-surface)] text-[var(--sp-accent-sienna)]" style="padding-left:var(--md-code-px,0.375rem);padding-right:var(--md-code-px,0.375rem);padding-top:var(--md-code-py,0.125rem);padding-bottom:var(--md-code-py,0.125rem)">$1</code>',
      )
      // 代码块（保留字体/边框/背景，间距改用变量）
      .replace(
        /```(\w*)\n([\s\S]*?)```/g,
        '<pre class="bg-[var(--sp-surface)] overflow-x-auto text-sm font-mono border border-[var(--sp-hairline)] max-w-full" style="padding:var(--md-pre-p,1rem);margin-top:var(--md-pre-my,1rem);margin-bottom:var(--md-pre-my,1rem)"><code class="whitespace-pre">$2</code></pre>',
      )
      // 水平线（保留颜色，间距改用变量）
      .replace(
        /^---$/gm,
        '<hr class="border-[var(--sp-hairline)]" style="margin-top:var(--md-hr-my,3rem);margin-bottom:var(--md-hr-my,3rem)" />',
      )
      // 链接
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--sp-accent-teal)] underline underline-offset-2 hover:text-[var(--sp-ink)]">$1</a>',
      )
      // 图片（保留边框/尺寸，间距改用变量）
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" class="max-w-full border border-[var(--sp-hairline)]" style="margin-top:var(--md-img-my,1rem);margin-bottom:var(--md-img-my,1rem)" />',
      )
      // 管道表格分隔行
      .replace(/^\|[-| :]+$/gm, '')
      // 管道表格行
      .replace(/^\|(.+)\|$/gm, '<div class="table-row text-sm">$1</div>')
      // 段落：双换行 → 关闭再打开
      .replace(/\n\n/g, '</p>' + P_OPEN)
      // 包裹首尾
      .replace(/^/, P_OPEN)
      .replace(/$/, '</p>')
      // 清理无效空段落
      .replace(/<p style="margin-bottom[^"]*"><\/p>/g, '')
  )
}
