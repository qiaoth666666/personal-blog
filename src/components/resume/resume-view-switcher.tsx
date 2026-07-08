'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ViewToggle, type ResumeView } from './view-toggle'
import { A4Resume } from './a4-resume'
import { AvatarCard } from './avatar-card'
import { EducationTimeline } from './education-timeline'
import { SkillsGrid } from './skills-grid'
import { ProjectShowcase } from './project-showcase'
import { CertificatesGrid } from './certificates-grid'
import { PersonalIntro } from './personal-intro'
import type { ResumeStyleConfig } from '@/lib/resume-styles'
import type { ResumeProfile, ResumeEducation, ResumeSkill, ResumeProject, ResumeCertificate } from '@/types/db'

interface ResumeViewSwitcherProps {
  profile: ResumeProfile | null
  education: ResumeEducation[]
  skills: ResumeSkill[]
  projects: ResumeProject[]
  certificates: ResumeCertificate[]
  introContent: string | null
  styleConfig?: ResumeStyleConfig | null
  skillContent?: string | null
}

const STORAGE_KEY = 'resume-view-preference'

export function ResumeViewSwitcher({
  profile,
  education,
  skills,
  projects,
  certificates,
  introContent,
  styleConfig,
  skillContent,
}: ResumeViewSwitcherProps) {
  const [view, setView] = useState<ResumeView>('a4')
  const [mounted, setMounted] = useState(false)
  const printingRef = useRef(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'a4' || saved === 'web') setView(saved)
    } catch {}
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleAfterPrint = () => {
      if (printingRef.current) {
        printingRef.current = false
        setView('web')
        try { localStorage.setItem(STORAGE_KEY, 'web') } catch {}
      }
    }
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

  const handleChange = useCallback((v: ResumeView) => {
    setView(v)
    try { localStorage.setItem(STORAGE_KEY, v) } catch {}
  }, [])

  const handlePrintPdf = useCallback(() => {
    if (view === 'a4') {
      window.print()
    } else {
      printingRef.current = true
      setView('a4')
      try { localStorage.setItem(STORAGE_KEY, 'a4') } catch {}
      setTimeout(() => { window.print() }, 500)
    }
  }, [view])

  if (!mounted) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-32 text-center">
        <div className="font-serif text-lg text-[var(--sp-muted)]" style={{ fontFamily: 'var(--font-serif)' }}>
          加载中...
        </div>
      </div>
    )
  }

  return (
    <>
      <ViewToggle view={view} onChange={handleChange} onPrintPdf={handlePrintPdf} />

      <AnimatePresence mode="wait">
        {view === 'a4' ? (
          <motion.div
            key="a4"
            initial={{ opacity: 0, filter: 'blur(6px)', y: 8 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, filter: 'blur(6px)', y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <A4Resume
              profile={profile}
              education={education}
              skills={skills}
              projects={projects}
              certificates={certificates}
              introContent={introContent}
              skillContent={skillContent}
              styleConfig={styleConfig}
            />
          </motion.div>
        ) : (
          <motion.div
            key="web"
            initial={{ opacity: 0, filter: 'blur(6px)', y: 8 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, filter: 'blur(6px)', y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {profile && <AvatarCard profile={profile} />}
            {education.length > 0 && <EducationTimeline items={education} />}
            {skills.length > 0 && <SkillsGrid skills={skills} skillContent={skillContent} />}
            {projects.length > 0 && <ProjectShowcase projects={projects} />}
            {certificates.length > 0 && <CertificatesGrid certificates={certificates} />}
            {introContent && <PersonalIntro content={introContent} />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
