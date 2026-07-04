/**
 * 简历样式配置类型定义
 *
 * 以每条横线为定位基准：
 * - 标题距离横线 = 标题文字到其下方横线的间距
 * - 正文距离横线 = 横线到正文内容的间距
 * - 头部距离横线 = 头部内容到底部到第 1 条横线的间距
 */

export interface SectionStyle {
  /** 标题字号 */
  headingFontSize?: string
  /** 标题距离其下方横线的间距（h2 的 padding-bottom） */
  headingToLine?: string
  /** 正文字号 */
  bodyFontSize?: string
  /** 正文距离其上方横线的间距（h2 的 margin-bottom） */
  bodyToLine?: string
}

export interface HeaderStyle {
  /** 姓名字号 */
  nameFontSize?: string
  /** 职位/头衔字号 */
  titleFontSize?: string
  /** 联系方式字号 */
  contactFontSize?: string
  /** 头部底部距离第 1 条横线的间距 */
  headerToLine?: string
  /** 头像距离第 1 条横线的间距 */
  avatarToLine?: string
}

export interface GlobalStyle {
  /** 横线粗细，如 '1px' / '2px' */
  dividerThickness?: string
  /** 横线长度，如 '100%' / '75%' */
  dividerWidth?: string
}

export interface ResumeStyleConfig {
  header?: HeaderStyle
  global?: GlobalStyle
  overrides?: {
    education?: Partial<SectionStyle>
    skills?: Partial<SectionStyle>
    projects?: Partial<SectionStyle>
    certificates?: Partial<SectionStyle>
    intro?: Partial<SectionStyle>
  }
}

// ===================== 默认值 =====================

export const HEADER_DEFAULTS: HeaderStyle = {
  nameFontSize: '1.75rem',
  titleFontSize: '0.875rem',
  contactFontSize: '0.875rem',
  headerToLine: '1rem',
  avatarToLine: '1rem',
}

export const SECTION_DEFAULTS: SectionStyle = {
  headingFontSize: '1rem',
  headingToLine: '0.2rem',
  bodyFontSize: '0.875rem',
  bodyToLine: '0.35rem',
}

export const GLOBAL_DEFAULTS: GlobalStyle = {
  dividerThickness: '1px',
  dividerWidth: '100%',
}

// ===================== 选项 =====================

export const HEADING_FONT_SIZE_OPTIONS = [
  { value: '0.875rem', label: '极小' },
  { value: '1rem', label: '小' },
  { value: '1.125rem', label: '中' },
  { value: '1.375rem', label: '大' },
  { value: '1.625rem', label: '超大' },
] as const

export const HEADING_TO_LINE_OPTIONS = [
  { value: '0.125rem', label: '极近' },
  { value: '0.25rem', label: '近' },
  { value: '0.5rem', label: '适中' },
  { value: '0.75rem', label: '远' },
  { value: '1rem', label: '极远' },
] as const

export const BODY_FONT_SIZE_OPTIONS = [
  { value: '0.75rem', label: '极小' },
  { value: '0.875rem', label: '小' },
  { value: '1rem', label: '中' },
  { value: '1.125rem', label: '大' },
  { value: '1.25rem', label: '超大' },
] as const

export const BODY_TO_LINE_OPTIONS = [
  { value: '0.25rem', label: '极近' },
  { value: '0.5rem', label: '近' },
  { value: '0.75rem', label: '适中' },
  { value: '1rem', label: '远' },
  { value: '1.5rem', label: '极远' },
] as const

export const NAME_FONT_SIZE_OPTIONS = [
  { value: '1.25rem', label: '小' },
  { value: '1.5rem', label: '中' },
  { value: '1.75rem', label: '大' },
  { value: '2rem', label: '超大' },
  { value: '2.5rem', label: '极大' },
] as const

export const TITLE_FONT_SIZE_OPTIONS = [
  { value: '0.75rem', label: '极小' },
  { value: '0.875rem', label: '小' },
  { value: '1rem', label: '中' },
  { value: '1.125rem', label: '大' },
  { value: '1.25rem', label: '超大' },
] as const

export const CONTACT_FONT_SIZE_OPTIONS = [
  { value: '0.75rem', label: '极小' },
  { value: '0.875rem', label: '小' },
  { value: '1rem', label: '中' },
  { value: '1.125rem', label: '大' },
] as const

export const AVATAR_TO_LINE_OPTIONS = [
  { value: '0.5rem', label: '近' },
  { value: '0.75rem', label: '适中' },
  { value: '1rem', label: '标准' },
  { value: '1.5rem', label: '远' },
  { value: '2rem', label: '极远' },
] as const

export const HEADER_TO_LINE_OPTIONS = [
  { value: '0.5rem', label: '近' },
  { value: '0.75rem', label: '适中' },
  { value: '1rem', label: '标准' },
  { value: '1.5rem', label: '远' },
  { value: '2rem', label: '极远' },
] as const

export const DIVIDER_THICKNESS_OPTIONS = [
  { value: '0.5px', label: '极细' },
  { value: '1px', label: '细' },
  { value: '2px', label: '中' },
  { value: '3px', label: '粗' },
] as const

export const DIVIDER_WIDTH_OPTIONS = [
  { value: '100%', label: '全宽' },
  { value: '75%', label: '3/4' },
  { value: '50%', label: '1/2' },
  { value: '33%', label: '1/3' },
  { value: '25%', label: '1/4' },
] as const

// ===================== Section keys =====================

export const SECTION_KEYS = [
  { key: 'education', label: '教育背景' },
  { key: 'skills', label: '专业技能' },
  { key: 'projects', label: '项目经历' },
  { key: 'certificates', label: '技能证书' },
  { key: 'intro', label: '自我介绍' },
] as const

// ===================== 工具函数 =====================

/** 获取头部样式 */
export function getHeaderStyle(config: ResumeStyleConfig | null | undefined): HeaderStyle {
  return { ...HEADER_DEFAULTS, ...(config?.header ?? {}) }
}

/** 获取全局样式 */
export function getGlobalStyle(config: ResumeStyleConfig | null | undefined): GlobalStyle {
  return { ...GLOBAL_DEFAULTS, ...(config?.global ?? {}) }
}

/** 获取某个 section 的最终样式 */
export function getSectionStyle(
  config: ResumeStyleConfig | null | undefined,
  section: string
): SectionStyle {
  const overrides = config?.overrides?.[section as keyof typeof config.overrides]
  if (overrides && Object.keys(overrides).length > 0) {
    return { ...SECTION_DEFAULTS, ...(overrides as Partial<SectionStyle>) }
  }
  return { ...SECTION_DEFAULTS }
}
