'use client'

import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import {
  type ResumeStyleConfig,
  type SectionStyle,
  type HeaderStyle,
  type GlobalStyle,
  HEADER_DEFAULTS,
  SECTION_DEFAULTS,
  GLOBAL_DEFAULTS,
  HEADING_FONT_SIZE_OPTIONS,
  HEADING_TO_LINE_OPTIONS,
  BODY_FONT_SIZE_OPTIONS,
  BODY_TO_LINE_OPTIONS,
  NAME_FONT_SIZE_OPTIONS,
  TITLE_FONT_SIZE_OPTIONS,
  CONTACT_FONT_SIZE_OPTIONS,
  HEADER_TO_LINE_OPTIONS,
  AVATAR_TO_LINE_OPTIONS,
  DIVIDER_THICKNESS_OPTIONS,
  DIVIDER_WIDTH_OPTIONS,
  SECTION_KEYS,
} from '@/lib/resume-styles'

interface ResumeStyleEditorProps {
  initialConfig?: string | null
  saving: boolean
  onSave: (config: ResumeStyleConfig) => void
}

/**
 * A4 简历样式设置 —— 以横线为定位基准
 *
 * 头部：姓名/职位/联系方式字号 + 头部到第 1 条横线的距离
 * 全局：横线粗细 + 横线长度（统一所有横线）
 * 每个模块：标题大小 + 标题距横线 + 正文大小 + 正文距横线
 */
export function ResumeStyleEditor({ initialConfig, saving, onSave }: ResumeStyleEditorProps) {
  const parsed = initialConfig ? tryParseConfig(initialConfig) : {}
  const [config, setConfig] = useState<ResumeStyleConfig>(parsed)

  function updateHeader(key: keyof HeaderStyle, value: unknown) {
    setConfig((prev) => ({
      ...prev,
      header: { ...(prev.header ?? {}), [key]: value === undefined || value === '' ? undefined : value },
    }))
  }

  function updateGlobal(key: keyof GlobalStyle, value: unknown) {
    setConfig((prev) => ({
      ...prev,
      global: { ...(prev.global ?? {}), [key]: value === undefined || value === '' ? undefined : value },
    }))
  }

  function updateSectionOverride(section: string, key: keyof SectionStyle, value: unknown) {
    setConfig((prev) => {
      const overrides = { ...prev.overrides }
      if (!overrides[section as keyof typeof overrides]) {
        overrides[section as keyof typeof overrides] = {}
      }
      const cleaned: Partial<SectionStyle> = {
        ...overrides[section as keyof typeof overrides],
        [key]: value === undefined || value === '' ? undefined : value,
      }
      // 删除 undefined 的 key
      for (const k of Object.keys(cleaned)) {
        if (cleaned[k as keyof SectionStyle] === undefined) {
          delete cleaned[k as keyof SectionStyle]
        }
      }
      if (Object.keys(cleaned).length === 0) {
        delete overrides[section as keyof typeof overrides]
      } else {
        overrides[section as keyof typeof overrides] = cleaned
      }
      return { ...prev, overrides }
    })
  }

  function resetHeader() {
    setConfig((prev) => ({ ...prev, header: undefined }))
    toast.success('头部已恢复默认')
  }

  function resetGlobal() {
    setConfig((prev) => ({ ...prev, global: undefined }))
    toast.success('全局横线已恢复默认')
  }

  function resetSection(section: string) {
    setConfig((prev) => {
      const overrides = { ...prev.overrides }
      delete overrides[section as keyof typeof overrides]
      return { ...prev, overrides }
    })
    toast.success('已恢复默认')
  }

  function resetAll() {
    setConfig({})
    toast.success('已全部重置为默认')
  }

  function handleSave() {
    onSave(config)
  }

  const header = { ...HEADER_DEFAULTS, ...(config.header ?? {}) }
  const global = { ...GLOBAL_DEFAULTS, ...(config.global ?? {}) }

  return (
    <div className="max-w-2xl space-y-8" style={{ fontFamily: 'var(--font-sans)' }}>
      <div>
        <h2 className="text-lg font-display font-bold text-[var(--sp-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
          A4 简历样式设置
        </h2>
        <p className="mt-2 text-sm text-[var(--sp-muted)]">
          以每条横线为定位基准。未设置的模块使用默认值。
        </p>
      </div>

      {/* 默认值参考 */}
      <div className="border border-[var(--sp-hairline)] bg-[var(--sp-surface-alt)] p-4 text-xs text-[var(--sp-muted)]">
        <span className="font-semibold text-[var(--sp-ink)]">出厂默认：</span>
        姓名 {HEADER_DEFAULTS.nameFontSize} · 头衔 {HEADER_DEFAULTS.titleFontSize} · 联系方式 {HEADER_DEFAULTS.contactFontSize} · 头部距线 {HEADER_DEFAULTS.headerToLine} · 头像距线 {HEADER_DEFAULTS.avatarToLine} · 标题 {SECTION_DEFAULTS.headingFontSize} · 正文 {SECTION_DEFAULTS.bodyFontSize} · 横线 {GLOBAL_DEFAULTS.dividerThickness}
      </div>

      {/* ===== 头部区域 ===== */}
      <section className="border border-[var(--sp-hairline)] px-4 py-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--sp-ink)]">头部区域</h3>
          {config.header && (
            <button type="button" onClick={resetHeader}
              className="text-xs text-[var(--sp-muted)] underline hover:text-[var(--sp-accent-sienna)] cursor-pointer">
              恢复默认
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--sp-muted)] -mt-3">第 1 行姓名、第 2 行职位、第 3 行联系方式，以及头部到第 1 条横线的距离。</p>

        <SliderGroup
          label={`姓名字号 · ${header.nameFontSize}`}
          value={header.nameFontSize}
          options={NAME_FONT_SIZE_OPTIONS}
          onChange={(v) => updateHeader('nameFontSize', v)}
        />
        <SliderGroup
          label={`职位/头衔字号 · ${header.titleFontSize}`}
          value={header.titleFontSize}
          options={TITLE_FONT_SIZE_OPTIONS}
          onChange={(v) => updateHeader('titleFontSize', v)}
        />
        <SliderGroup
          label={`联系方式字号 · ${header.contactFontSize}`}
          value={header.contactFontSize}
          options={CONTACT_FONT_SIZE_OPTIONS}
          onChange={(v) => updateHeader('contactFontSize', v)}
        />
        <SliderGroup
          label={`头部到第 1 条横线 · ${header.headerToLine}`}
          value={header.headerToLine}
          options={HEADER_TO_LINE_OPTIONS}
          onChange={(v) => updateHeader('headerToLine', v)}
        />
        <SliderGroup
          label={`头像距横线 · ${header.avatarToLine}`}
          value={header.avatarToLine}
          options={AVATAR_TO_LINE_OPTIONS}
          onChange={(v) => updateHeader('avatarToLine', v)}
        />
      </section>

      {/* ===== 全局横线设置 ===== */}
      <section className="border border-[var(--sp-hairline)] px-4 py-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--sp-ink)]">全局横线</h3>
          {config.global && (
            <button type="button" onClick={resetGlobal}
              className="text-xs text-[var(--sp-muted)] underline hover:text-[var(--sp-accent-sienna)] cursor-pointer">
              恢复默认
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--sp-muted)] -mt-3">统一控制所有横线的粗细和长度。</p>

        <SliderGroup
          label={`横线粗细 · ${global.dividerThickness}`}
          value={global.dividerThickness}
          options={DIVIDER_THICKNESS_OPTIONS}
          onChange={(v) => updateGlobal('dividerThickness', v)}
        />
        <SliderGroup
          label={`横线长度 · ${global.dividerWidth}`}
          value={global.dividerWidth}
          options={DIVIDER_WIDTH_OPTIONS}
          onChange={(v) => updateGlobal('dividerWidth', v)}
        />
      </section>

      {/* ===== 各内容模块 ===== */}
      <section>
        <h3 className="mb-3 text-sm font-bold text-[var(--sp-ink)]">内容模块</h3>
        <p className="mb-3 text-xs text-[var(--sp-muted)]">
          每个模块：标题 ⇣横线⇣ 正文。「标题距横线」= 标题文字到下方横线的间距，「正文距横线」= 横线到正文的间距。
        </p>
        <div className="space-y-3">
          {SECTION_KEYS.map(({ key, label }) => {
            const override = config.overrides?.[key as keyof typeof config.overrides]
            const s = { ...SECTION_DEFAULTS, ...(override ?? {}) }
            const hasOverride = override && Object.keys(override).length > 0

            return (
              <div key={key} className="border border-[var(--sp-hairline)] px-4 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[var(--sp-ink)]">{label}</h4>
                  {hasOverride && (
                    <button type="button" onClick={() => resetSection(key)}
                      className="text-xs text-[var(--sp-muted)] underline hover:text-[var(--sp-accent-sienna)] cursor-pointer">
                      恢复默认
                    </button>
                  )}
                </div>

                <SliderGroup
                  label={`标题大小 · ${s.headingFontSize}`}
                  value={s.headingFontSize}
                  options={HEADING_FONT_SIZE_OPTIONS}
                  onChange={(v) => updateSectionOverride(key, 'headingFontSize', v)}
                />
                <SliderGroup
                  label={`标题距横线 · ${s.headingToLine}`}
                  value={s.headingToLine}
                  options={HEADING_TO_LINE_OPTIONS}
                  onChange={(v) => updateSectionOverride(key, 'headingToLine', v)}
                />
                <SliderGroup
                  label={`正文大小 · ${s.bodyFontSize}`}
                  value={s.bodyFontSize}
                  options={BODY_FONT_SIZE_OPTIONS}
                  onChange={(v) => updateSectionOverride(key, 'bodyFontSize', v)}
                />
                <SliderGroup
                  label={`正文距横线 · ${s.bodyToLine}`}
                  value={s.bodyToLine}
                  options={BODY_TO_LINE_OPTIONS}
                  onChange={(v) => updateSectionOverride(key, 'bodyToLine', v)}
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center gap-2 border border-[var(--sp-hairline)] px-4 py-2 text-sm text-[var(--sp-muted)] transition-colors hover:text-[var(--sp-ink)] cursor-pointer"
        >
          <RotateCcw size={14} /> 全部重置
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-6 py-2 text-sm font-medium text-[var(--sp-ground)] transition-colors hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer"
        >
          <Save size={14} /> {saving ? '保存中...' : '保存样式配置'}
        </button>
      </div>
    </div>
  )
}

// ===================== 子组件 =====================

function SliderGroup({
  label, value, options, onChange,
}: {
  label: string
  value: string | number | undefined
  options: readonly { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  const val = String(value ?? '')
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-2.5 py-1 text-xs transition-colors cursor-pointer ${
              opt.value === val
                ? 'bg-[var(--sp-ink)] text-[var(--sp-ground)]'
                : 'border border-[var(--sp-hairline)] text-[var(--sp-muted)] hover:border-[var(--sp-ink)] hover:text-[var(--sp-ink)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function tryParseConfig(raw: string): ResumeStyleConfig {
  try {
    return JSON.parse(raw) as ResumeStyleConfig
  } catch {
    return {}
  }
}
