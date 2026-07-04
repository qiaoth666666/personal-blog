'use client'

import { useLayoutEffect, useRef, useState, useMemo } from 'react'
import Image from 'next/image'
import { Mail, Phone, MapPin, Globe, GraduationCap, Award, Wrench, Briefcase, User } from 'lucide-react'
import Link from 'next/link'
import { renderMarkdown } from '@/lib/markdown'
import { type ResumeStyleConfig, getSectionStyle, getHeaderStyle, getGlobalStyle } from '@/lib/resume-styles'
import type { ResumeProfile, ResumeEducation, ResumeSkill, ResumeProject, ResumeCertificate } from '@/types/db'

interface A4ResumeProps {
  profile: ResumeProfile | null
  education: ResumeEducation[]
  skills: ResumeSkill[]
  projects: ResumeProject[]
  certificates: ResumeCertificate[]
  introContent: string | null
  skillContent?: string | null
  styleConfig?: ResumeStyleConfig | null
}

// A4 常量
const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const PAD_TOP_MM = 14
const PAD_BOTTOM_MM = 14
const PAD_LEFT_MM = 18
const PAD_RIGHT_MM = 18
const HEADER_TO_LINE = '0.5rem'   // 头部到第一条横线的距离，直接改这里
const CONTENT_AREA_MM = A4_HEIGHT_MM - PAD_TOP_MM - PAD_BOTTOM_MM  // 269mm 内容区高度

// 1mm ≈ 3.779527559px (CSS)
const MM_TO_PX = 3.779527559

const PAGE_WIDTH_PX = A4_WIDTH_MM * MM_TO_PX
const PAGE_HEIGHT_PX = A4_HEIGHT_MM * MM_TO_PX
const CONTENT_AREA_PX = CONTENT_AREA_MM * MM_TO_PX

/** 所有页面完全相同的样式 */
const pageStyle: React.CSSProperties = {
  width: `${A4_WIDTH_MM}mm`,
  height: `${A4_HEIGHT_MM}mm`,
  overflow: 'hidden',
  backgroundColor: 'white',
  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.18)',
  padding: `${PAD_TOP_MM}mm ${PAD_RIGHT_MM}mm ${PAD_BOTTOM_MM}mm ${PAD_LEFT_MM}mm`,
  color: '#1a1a18',
  boxSizing: 'border-box',
  flexShrink: 0,
}

/**
 * A4 简历 —— 精确多页分页
 *
 * - 每页固定 210mm × 297mm
 * - 所有页面尺寸、边距、阴影完全一致
 * - 模块间分割线可调节长度/粗细
 */
export function A4Resume({ profile, education, skills, projects, certificates, introContent, skillContent, styleConfig }: A4ResumeProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [pages, setPages] = useState(1)

  // 测内容总高度 → 算页数
  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el) return

    // 用 requestAnimationFrame 等 DOM 完全渲染
    requestAnimationFrame(() => {
      // 克隆整个内容到离屏容器，overflow:visible 测得真实高度
      const clone = el.cloneNode(true) as HTMLElement
      clone.style.cssText = `
        position:fixed; left:-9999px; top:0;
        width:${PAGE_WIDTH_PX - (PAD_LEFT_MM + PAD_RIGHT_MM) * MM_TO_PX}px;
        visibility:hidden; pointer-events:none;
      `
      document.body.appendChild(clone)
      const totalH = clone.scrollHeight
      document.body.removeChild(clone)

      const count = Math.max(1, Math.ceil(totalH / CONTENT_AREA_PX))
      setPages(count)
    })
  }, [profile, education, skills, projects, certificates, introContent, skillContent, JSON.stringify(styleConfig)])

  // 共享内容 —— 所有页面用相同的 A4Content，通过 CSS clip 切分
  const content = useMemo(() => (
    <A4Content
      profile={profile}
      education={education}
      skills={skills}
      projects={projects}
      certificates={certificates}
      introContent={introContent}
      skillContent={skillContent}
      styleConfig={styleConfig}
    />
  ), [profile, education, skills, projects, certificates, introContent, skillContent, JSON.stringify(styleConfig)])

  // 如果只有 1 页，直接渲染
  if (pages <= 1) {
    return (
      <div className="flex justify-center a4-resume-outer" style={{ padding: '12px 0 96px 0' }}>
        <div className="a4-resume-page" style={pageStyle}>
          <div ref={contentRef}>{content}</div>
        </div>
      </div>
    )
  }

  // 多页：每个页面用 mm 单位精确裁剪，避免 px 换算误差导致内容重复
  return (
    <div className="flex flex-col items-center a4-resume-outer" style={{ gap: '48px', padding: '12px 0 96px 0' }}>
      {Array.from({ length: pages }, (_, i) => (
        <div key={i} className="a4-resume-page" style={pageStyle}>
          {/* 内层裁剪容器：高度=内容区，overflow 精确裁剪 */}
          <div style={{ height: `${CONTENT_AREA_MM}mm`, overflow: 'hidden' }}>
            <div
              ref={i === 0 ? contentRef : undefined}
              style={{
                transform: `translateY(-${i * CONTENT_AREA_MM}mm)`,
              }}
            >
              {content}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ===================== 内容（纯展示） =====================

const A4Content = function A4Content({
  profile, education, skills, projects, certificates, introContent, skillContent, styleConfig,
}: {
  profile: ResumeProfile | null
  education: ResumeEducation[]
  skills: ResumeSkill[]
  projects: ResumeProject[]
  certificates: ResumeCertificate[]
  introContent: string | null | undefined
  skillContent: string | null | undefined
  styleConfig: ResumeStyleConfig | null | undefined
}) {
  const global = getGlobalStyle(styleConfig)
  const lineH = global.dividerThickness || '1px'

  return (
    <>
      <A4Header profile={profile} styleConfig={styleConfig} />

      {education.length > 0 && (
        <>
          <DividerLine global={global} />
          <A4Section>
            <SectionTitle styleConfig={styleConfig} section="education" lineH={lineH}>
              <GraduationCap size={16} />教育背景
            </SectionTitle>
            {education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '0.5em' }}>
                {/* 第一行：学校 · 学位 · 专业  |  时间 */}
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-[#1a1a18]"
                      style={{ fontSize: getSectionStyle(styleConfig, 'education').bodyFontSize }}>
                      {edu.school}
                    </span>
                    <span className="ml-2 text-[#1a1a18]"
                      style={{ fontSize: getSectionStyle(styleConfig, 'education').bodyFontSize }}>
                      {edu.degree}{edu.major && ` · ${edu.major}`}
                    </span>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-[#888]" style={{ fontSize: '0.75rem' }}>
                    {formatDate(edu.startDate)} — {edu.endDate ? formatDate(edu.endDate) : '至今'}
                  </span>
                </div>
                {/* 第二行：简介 */}
                {edu.description && (
                  <div className="a4-markdown"
                    style={{ fontSize: getSectionStyle(styleConfig, 'education').bodyFontSize, lineHeight: 1.5, color: '#1a1a18', marginTop: '0rem' }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(edu.description) }} />
                )}
              </div>
            ))}
          </A4Section>
        </>
      )}

      {(skillContent || skills.length > 0) && (
        <A4Section>
          <SectionTitle styleConfig={styleConfig} section="skills" lineH={lineH}>
            <Wrench size={16} />专业技能
          </SectionTitle>
          {skillContent ? (
            <div className="a4-markdown"
              style={{ fontSize: getSectionStyle(styleConfig, 'skills').bodyFontSize, lineHeight: 1.5, color: '#1a1a18' }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(skillContent) }} />
          ) : (
            Object.entries(groupByCategory(skills)).map(([category, items]) => (
              <div key={category} className="flex gap-2" style={{ marginBottom: '0.25rem' }}>
                <span className="shrink-0 font-bold text-[#555]"
                  style={{ fontSize: getSectionStyle(styleConfig, 'skills').bodyFontSize, minWidth: '5rem' }}>
                  {category}
                </span>
                <span className="text-[#333]"
                  style={{ fontSize: getSectionStyle(styleConfig, 'skills').bodyFontSize }}>
                  {items.map((s) => s.name).join('、')}
                </span>
              </div>
            ))
          )}
        </A4Section>
      )}

      {projects.length > 0 && (
        <A4Section>
          <SectionTitle styleConfig={styleConfig} section="projects" lineH={lineH}>
            <Briefcase size={16} />项目经历
          </SectionTitle>
          {projects.map((project) => {
            const s = getSectionStyle(styleConfig, 'projects')
            return (
              <div key={project.id} style={{ marginBottom: '0.2rem' }}>
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-[#1a1a18]" style={{ fontSize: s.bodyFontSize }}>
                      {project.name}
                    </span>
                    {project.role && <span className="italic text-[#888]" style={{ fontSize: '0.75rem' }}>{project.role}</span>}
                  </div>
                  <span className="shrink-0 text-[#888]" style={{ fontSize: '0.75rem' }}>
                    {project.startDate ? new Date(project.startDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' }) : ''}
                    {project.endDate ? ` — ${new Date(project.endDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })}` : project.startDate ? ' — 至今' : ''}
                  </span>
                </div>
                {project.description && (
                  <div className="a4-markdown"
                    style={{ fontSize: s.bodyFontSize, lineHeight: 1.5, color: '#1a1a18', marginBottom: '0.125rem' }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(project.description) }} />
                )}
                {project.techStack && (
                  <p className="text-[#888]" style={{ fontSize: '0.75rem', marginTop: '-0.25rem', marginBottom: 0 }}>
                    {project.techStack.split(',').map((t) => t.trim()).join(' · ')}
                  </p>
                )}
              </div>
            )
          })}
        </A4Section>
      )}

      {certificates.length > 0 && (
        <A4Section>
          <SectionTitle styleConfig={styleConfig} section="certificates" lineH={lineH}>
            <Award size={16} />技能证书
          </SectionTitle>
          {certificates.map((cert) => {
            const s = getSectionStyle(styleConfig, 'certificates')
            return (
              <div key={cert.id} style={{ marginBottom: '0.5em' }}>
                <span className="text-[#333]" style={{ fontSize: s.bodyFontSize }}>
                  {cert.name}
                  {cert.issuer && <span className="text-[#888]"> — {cert.issuer}</span>}
                  {cert.issueDate && <span className="text-[#aaa]"> ({new Date(cert.issueDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })})</span>}
                </span>
                {cert.description && (
                  <div className="a4-markdown mt-0.5"
                    style={{ fontSize: s.bodyFontSize, lineHeight: 1.5, color: '#1a1a18' }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(cert.description) }} />
                )}
              </div>
            )
          })}
        </A4Section>
      )}

      {introContent && (
        <A4Section>
          <SectionTitle styleConfig={styleConfig} section="intro" lineH={lineH}>
            <User size={16} />自我介绍
          </SectionTitle>
          <div className="a4-markdown"
            style={{ fontSize: getSectionStyle(styleConfig, 'intro').bodyFontSize, lineHeight: 1.5, color: '#1a1a18' }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(introContent) }} />
        </A4Section>
      )}
    </>
  )
}

// ===================== 标题（含横线） =====================

function SectionTitle({ children, styleConfig, section, lineH }: {
  children: React.ReactNode
  styleConfig: ResumeStyleConfig | null | undefined
  section: string
  lineH: string
}) {
  const s = getSectionStyle(styleConfig, section)
  return (
    <h2 className="font-display font-bold uppercase tracking-wider text-[#1a1a18]"
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: s.headingFontSize,
        paddingBottom: s.headingToLine || '0.25rem',
        borderBottom: `${lineH} solid #000`,
        marginBottom: s.bodyToLine || '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
      {children}
    </h2>
  )
}

// ===================== 分割线（仅教育背景上方使用） =====================

function DividerLine({ global }: { global: ReturnType<typeof getGlobalStyle> }) {
  const thickness = global.dividerThickness || '1px'
  const width = global.dividerWidth || '100%'
  return (
    <div style={{ width, margin: '0 auto 0.5rem auto', borderBottom: `${thickness} solid #000` }} />
  )
}

// ===================== Section 包装器 =====================

function A4Section({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '0.1rem' }}>
      {children}
    </section>
  )
}

// ===================== 头部 =====================

function A4Header({ profile, styleConfig }: {
  profile: ResumeProfile | null
  styleConfig: ResumeStyleConfig | null | undefined
}) {
  const h = getHeaderStyle(styleConfig)

  // 收集联系方式
  const contactItems: React.ReactNode[] = []
  if (profile?.email) contactItems.push(<span key="email" className="inline-flex items-center gap-1"><Mail size={13} />{profile.email}</span>)
  if (profile?.phone) contactItems.push(<span key="phone" className="inline-flex items-center gap-1"><Phone size={13} />{profile.phone}</span>)
  if (profile?.location) contactItems.push(<span key="location" className="inline-flex items-center gap-1"><MapPin size={13} />{profile.location}</span>)
  if (profile?.website) {
    contactItems.push(
      <Link key="website" href={profile.website} target="_blank" className="inline-flex items-center gap-1 text-[#1b4b5a] no-underline print:text-[#1a1a18]">
        <Globe size={13} />个人网站
      </Link>
    )
  }
  if (profile?.github) {
    contactItems.push(
      <Link key="github" href={profile.github} target="_blank" className="inline-flex items-center gap-1 text-[#1b4b5a] no-underline print:text-[#1a1a18]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>GitHub
      </Link>
    )
  }
  if (profile?.linkedin) {
    contactItems.push(
      <Link key="linkedin" href={profile.linkedin} target="_blank" className="inline-flex items-center gap-1 text-[#1b4b5a] no-underline print:text-[#1a1a18]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>LinkedIn
      </Link>
    )
  }

  return (
    <header style={{ marginBottom: HEADER_TO_LINE }}>
      <div className="flex items-end justify-between gap-4">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {/* 第 1 行：姓名 */}
          <h1 className="font-display font-bold tracking-tight text-[#1a1a18] leading-tight"
            style={{ fontFamily: 'var(--font-display)', fontSize: h.nameFontSize || '1.75rem' }}>
            {profile?.name || '姓名'}
          </h1>

          {/* 第 2 行：职位头衔 */}
          {profile?.title && (
            <p className="text-[#555] leading-tight"
              style={{ fontSize: h.titleFontSize || '0.875rem', marginBottom: 0 }}>
              {profile.title}
            </p>
          )}

          {/* 第 3 行：联系方式 */}
          {contactItems.length > 0 && (
            <div className="flex gap-x-5 text-[#555] leading-tight"
              style={{ fontSize: h.contactFontSize || '0.875rem' }}>
              {contactItems}
            </div>
          )}
        </div>

        {/* 头像——底部与文字底部对齐，独立控制距横线 */}
        {profile?.avatarUrl && (
          <div
            className="relative shrink-0 overflow-hidden"
            style={{
              width: '5rem',
              aspectRatio: '3 / 4',
              marginBottom: avatarMargin(h.headerToLine || '1rem', h.avatarToLine || '1rem'),
            }}
          >
            <Image src={profile.avatarUrl} alt={profile.name || '头像'} fill className="object-cover" sizes="128px" />
          </div>
        )}
      </div>
    </header>
  )
}

// ===================== 工具函数 =====================

function groupByCategory(skills: ResumeSkill[]): Record<string, ResumeSkill[]> {
  return skills.reduce((acc, skill) => {
    const cat = skill.category || '其他'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {} as Record<string, ResumeSkill[]>)
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
}

/** 计算头像的 margin-bottom：正值=头像比文字高（更远离横线），负值=头像比文字低（更靠近横线） */
function avatarMargin(headerToLine: string, avatarToLine: string): string {
  const h = parseFloat(headerToLine)
  const a = parseFloat(avatarToLine)
  return `${a - h}rem`
}
