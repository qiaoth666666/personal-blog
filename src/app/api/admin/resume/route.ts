import { NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'
import type {
  ResumeProfile, ResumeEducation, ResumeSkill, ResumeSkillContent,
  ResumeProject, ResumeCertificate, ResumeIntro, SiteIntro, ResumeStyle,
} from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function GET() {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  try {
    const [profile, education, skills, projects, certificates, intro, siteIntro, style, skillContent] = await Promise.all([
      queryOne<ResumeProfile & RowDataPacket>('SELECT * FROM `ResumeProfile` LIMIT 1'),
      query<ResumeEducation & RowDataPacket>('SELECT * FROM `ResumeEducation` ORDER BY sortOrder ASC'),
      query<ResumeSkill & RowDataPacket>('SELECT * FROM `ResumeSkill` ORDER BY sortOrder ASC'),
      query<ResumeProject & RowDataPacket>('SELECT * FROM `ResumeProject` ORDER BY sortOrder ASC'),
      query<ResumeCertificate & RowDataPacket>('SELECT * FROM `ResumeCertificate` ORDER BY sortOrder ASC'),
      queryOne<ResumeIntro & RowDataPacket>('SELECT * FROM `ResumeIntro` LIMIT 1'),
      queryOne<SiteIntro & RowDataPacket>('SELECT * FROM `SiteIntro` LIMIT 1'),
      queryOne<ResumeStyle & RowDataPacket>('SELECT * FROM `ResumeStyle` LIMIT 1'),
      queryOne<ResumeSkillContent & RowDataPacket>('SELECT * FROM `ResumeSkillContent` LIMIT 1'),
    ])
    return NextResponse.json({ profile, education, skills, projects, certificates, intro, siteIntro, style, skillContent })
  } catch {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
