export const SITE_CONFIG = {
  name: '个人博客',
  description: '温润、人文、有温度的私人数字花园。',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  author: '站长',
  social: {
    github: '',
    email: '',
    twitter: '',
  },
} as const

export const PAGINATION = {
  articlesPerPage: 10,
  guestbookPerPage: 20,
  softwarePerPage: 24,
} as const

export const SITE_INTRO = {
  content: `
## 关于这个博客

这里是**个人博客** —— 一座温润、人文、有温度的私人数字花园。

记录技术思考、生活杂感和创作实验。不求日更，但求真诚。

> 写作是通往理解的道路。每一篇文章都是一次对话 —— 与过去的自己、与未来的读者。
`,
} as const

export const TECH_STACK = [
  { name: 'Next.js', url: 'https://nextjs.org' },
  { name: 'React', url: 'https://react.dev' },
  { name: 'TypeScript', url: 'https://www.typescriptlang.org' },
  { name: 'MySQL', url: 'https://www.mysql.com' },
  { name: 'Framer Motion', url: 'https://www.framer.com/motion' },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
  { name: 'Vercel', url: 'https://vercel.com' },
] as const

export const NAV_LINKS = [
  { href: '/', label: '首页' },
  { href: '/resume', label: '简历' },
  { href: '/music', label: '拾曲' },
  { href: '/software', label: '软库' },
  { href: '/articles', label: '文章' },
  { href: '/guestbook', label: '留言' },
  { href: '/friends', label: '友链' },
  { href: '/about', label: '关于' },
] as const

// ============================
// Markdown 排版默认值
// ============================
export type MarkdownContentType =
  | 'article'
  | 'software'
  | 'resume-web'
  | 'resume-a4'
  | 'about'
  | 'preview'

export type MarkdownVarMap = Record<string, string>

/** 所有 CSS 变量名 */
export const MD_VAR_KEYS = [
  '--md-h1-mt', '--md-h1-mb', '--md-h1-font-size',
  '--md-h2-mt', '--md-h2-mb', '--md-h2-font-size',
  '--md-h3-mt', '--md-h3-mb', '--md-h3-font-size',
  '--md-p-mb', '--md-p-leading', '--md-p-font-size',
  '--md-li-ml', '--md-li-mb', '--md-li-font-size',
  '--md-ul-pl', '--md-ul-mb',
  '--md-ol-pl', '--md-ol-mb',
  '--md-blockquote-my', '--md-blockquote-font-size',
  '--md-hr-my',
  '--md-pre-p', '--md-pre-my',
  '--md-img-my',
  '--md-code-px', '--md-code-py',
] as const

/** 变量中文说明 */
export const MD_VAR_LABELS: Record<string, string> = {
  '--md-h1-mt': '一级标题上边距',
  '--md-h1-mb': '一级标题下边距',
  '--md-h1-font-size': '一级标题字号 (如 2rem)',
  '--md-h2-mt': '二级标题上边距',
  '--md-h2-mb': '二级标题下边距',
  '--md-h2-font-size': '二级标题字号 (如 1.5rem)',
  '--md-h3-mt': '三级标题上边距',
  '--md-h3-mb': '三级标题下边距',
  '--md-h3-font-size': '三级标题字号 (如 1.25rem)',
  '--md-p-mb': '段落之间间距',
  '--md-p-leading': '段落行高',
  '--md-p-font-size': '段落字号 (如 1.125rem)',
  '--md-li-ml': '列表项左缩进',
  '--md-li-mb': '列表项之间间距',
  '--md-li-font-size': '列表项字号 (如 1rem / inherit)',
  '--md-ul-pl': '无序列表(圆点)整体缩进',
  '--md-ul-mb': '无序列表与下文间距',
  '--md-ol-pl': '有序列表(数字)整体缩进',
  '--md-ol-mb': '有序列表与下文间距',
  '--md-blockquote-my': '引用块上下间距',
  '--md-blockquote-font-size': '引用块字号 (如 1rem)',
  '--md-hr-my': '分隔线上下间距',
  '--md-pre-p': '代码块内边距',
  '--md-pre-my': '代码块上下间距',
  '--md-img-my': '图片上下间距',
  '--md-code-px': '行内代码左右内边距',
  '--md-code-py': '行内代码上下内边距',
}

/** 变量分组（用于后台 UI 展示） */
export const MD_VAR_GROUPS = [
  {
    label: '标题间距',
    keys: ['--md-h1-mt', '--md-h1-mb', '--md-h2-mt', '--md-h2-mb', '--md-h3-mt', '--md-h3-mb'] as const,
  },
  {
    label: '段落',
    keys: ['--md-p-mb', '--md-p-leading'] as const,
  },
  {
    label: '列表',
    keys: ['--md-li-ml', '--md-li-mb', '--md-ul-pl', '--md-ul-mb', '--md-ol-pl', '--md-ol-mb'] as const,
  },
  {
    label: '其他元素',
    keys: ['--md-blockquote-my', '--md-hr-my', '--md-pre-p', '--md-pre-my', '--md-img-my', '--md-code-px', '--md-code-py'] as const,
  },
  {
    label: '字号',
    keys: ['--md-h1-font-size', '--md-h2-font-size', '--md-h3-font-size', '--md-p-font-size', '--md-li-font-size', '--md-blockquote-font-size'] as const,
  },
] as const

/** 各内容类型的默认值（与 globals.css 一致） */
export const MARKDOWN_DEFAULTS: Record<MarkdownContentType, MarkdownVarMap> = {
  article: {
    '--md-h1-mt': '3rem', '--md-h1-mb': '1.5rem', '--md-h1-font-size': 'inherit',
    '--md-h2-mt': '2.5rem', '--md-h2-mb': '1.25rem', '--md-h2-font-size': 'inherit',
    '--md-h3-mt': '2rem', '--md-h3-mb': '1rem', '--md-h3-font-size': 'inherit',
    '--md-p-mb': '1.25rem', '--md-p-leading': '1.625', '--md-p-font-size': 'inherit',
    '--md-li-ml': '1rem', '--md-li-mb': '0.25rem', '--md-li-font-size': 'inherit',
    '--md-ul-pl': '1.5rem', '--md-ul-mb': '1.25rem',
    '--md-ol-pl': '1.5rem', '--md-ol-mb': '1.25rem',
    '--md-blockquote-my': '1rem', '--md-blockquote-font-size': 'inherit',
    '--md-hr-my': '3rem',
    '--md-pre-p': '1rem', '--md-pre-my': '1rem',
    '--md-img-my': '1rem',
    '--md-code-px': '0.375rem', '--md-code-py': '0.125rem',
  },
  software: {
    '--md-h1-mt': '3rem', '--md-h1-mb': '1.5rem', '--md-h1-font-size': 'inherit',
    '--md-h2-mt': '2.5rem', '--md-h2-mb': '1.25rem', '--md-h2-font-size': 'inherit',
    '--md-h3-mt': '2rem', '--md-h3-mb': '1rem', '--md-h3-font-size': 'inherit',
    '--md-p-mb': '1.25rem', '--md-p-leading': '1.625', '--md-p-font-size': 'inherit',
    '--md-li-ml': '1rem', '--md-li-mb': '0.25rem', '--md-li-font-size': 'inherit',
    '--md-ul-pl': '1.5rem', '--md-ul-mb': '1.25rem',
    '--md-ol-pl': '1.5rem', '--md-ol-mb': '1.25rem',
    '--md-blockquote-my': '1rem', '--md-blockquote-font-size': 'inherit',
    '--md-hr-my': '3rem',
    '--md-pre-p': '1rem', '--md-pre-my': '1rem',
    '--md-img-my': '1rem',
    '--md-code-px': '0.375rem', '--md-code-py': '0.125rem',
  },
  'resume-web': {
    '--md-h1-mt': '3rem', '--md-h1-mb': '1.5rem', '--md-h1-font-size': 'inherit',
    '--md-h2-mt': '2.5rem', '--md-h2-mb': '1.25rem', '--md-h2-font-size': 'inherit',
    '--md-h3-mt': '1.5em', '--md-h3-mb': '0.5em', '--md-h3-font-size': 'inherit',
    '--md-p-mb': '1em', '--md-p-leading': '1.75', '--md-p-font-size': '1.125rem',
    '--md-li-ml': '1rem', '--md-li-mb': '0.25rem', '--md-li-font-size': '1.125rem',
    '--md-ul-pl': '1.5rem', '--md-ul-mb': '1em',
    '--md-ol-pl': '1.5rem', '--md-ol-mb': '1em',
    '--md-blockquote-my': '1em', '--md-blockquote-font-size': 'inherit',
    '--md-hr-my': '1.5rem',
    '--md-pre-p': '1rem', '--md-pre-my': '1em',
    '--md-img-my': '1em',
    '--md-code-px': '0.375rem', '--md-code-py': '0.125rem',
  },
  'resume-a4': {
    '--md-h1-mt': '3rem', '--md-h1-mb': '1.5rem', '--md-h1-font-size': 'inherit',
    '--md-h2-mt': '2.5rem', '--md-h2-mb': '1.25rem', '--md-h2-font-size': 'inherit',
    '--md-h3-mt': '2rem', '--md-h3-mb': '1rem', '--md-h3-font-size': 'inherit',
    '--md-p-mb': '0.5em', '--md-p-leading': '1.5', '--md-p-font-size': '0.875rem',
    '--md-li-ml': '1rem', '--md-li-mb': '0.15rem', '--md-li-font-size': '0.875rem',
    '--md-ul-pl': '1.2rem', '--md-ul-mb': '0.5em',
    '--md-ol-pl': '1.2rem', '--md-ol-mb': '0.5em',
    '--md-blockquote-my': '1rem', '--md-blockquote-font-size': 'inherit',
    '--md-hr-my': '3rem',
    '--md-pre-p': '0.75rem', '--md-pre-my': '0.5em',
    '--md-img-my': '1rem',
    '--md-code-px': '0.375rem', '--md-code-py': '0.125rem',
  },
  about: {
    '--md-h1-mt': '3rem', '--md-h1-mb': '1.5rem', '--md-h1-font-size': 'inherit',
    '--md-h2-mt': '2.5rem', '--md-h2-mb': '1.25rem', '--md-h2-font-size': 'inherit',
    '--md-h3-mt': '2rem', '--md-h3-mb': '1rem', '--md-h3-font-size': 'inherit',
    '--md-p-mb': '1.25rem', '--md-p-leading': '1.75', '--md-p-font-size': '1.125rem',
    '--md-li-ml': '1rem', '--md-li-mb': '0.25rem', '--md-li-font-size': '1.125rem',
    '--md-ul-pl': '1.5rem', '--md-ul-mb': '1.25rem',
    '--md-ol-pl': '1.5rem', '--md-ol-mb': '1.25rem',
    '--md-blockquote-my': '1rem', '--md-blockquote-font-size': 'inherit',
    '--md-hr-my': '2rem',
    '--md-pre-p': '1rem', '--md-pre-my': '1rem',
    '--md-img-my': '1rem',
    '--md-code-px': '0.375rem', '--md-code-py': '0.125rem',
  },
  preview: {
    '--md-h1-mt': '3rem', '--md-h1-mb': '1.5rem', '--md-h1-font-size': 'inherit',
    '--md-h2-mt': '2.5rem', '--md-h2-mb': '1.25rem', '--md-h2-font-size': 'inherit',
    '--md-h3-mt': '2rem', '--md-h3-mb': '1rem', '--md-h3-font-size': 'inherit',
    '--md-p-mb': '1.25rem', '--md-p-leading': '1.625', '--md-p-font-size': 'inherit',
    '--md-li-ml': '1rem', '--md-li-mb': '0.25rem', '--md-li-font-size': 'inherit',
    '--md-ul-pl': '1.5rem', '--md-ul-mb': '1.25rem',
    '--md-ol-pl': '1.5rem', '--md-ol-mb': '1.25rem',
    '--md-blockquote-my': '1rem', '--md-blockquote-font-size': 'inherit',
    '--md-hr-my': '3rem',
    '--md-pre-p': '1rem', '--md-pre-my': '1rem',
    '--md-img-my': '1rem',
    '--md-code-px': '0.375rem', '--md-code-py': '0.125rem',
  },
}

/** 内容类型中文标签 */
export const MD_TYPE_LABELS: Record<MarkdownContentType, string> = {
  article: '文章',
  software: '软件',
  'resume-web': '网页简历',
  'resume-a4': 'A4简历',
  about: '关于页',
  preview: '后台预览',
}
