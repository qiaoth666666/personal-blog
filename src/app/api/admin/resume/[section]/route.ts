import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { queryOne, execute, transaction } from '@/lib/db'
import type { RowDataPacket } from 'mysql2/promise'
import { invalidateResume, invalidateHome } from '@/lib/cache-keys'
import { verifyAdminApi } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function PUT(request: Request, { params }: { params: Promise<{ section: string }> }) {
  const _authErr = await verifyAdminApi(); if (_authErr) return _authErr;
  const { section } = await params
  const body = await request.json()

  try {
    let result: unknown = { ok: true }

    switch (section) {
      case 'profile': {
        const existing = await queryOne<RowDataPacket & { id: number }>(
          'SELECT id FROM `ResumeProfile` LIMIT 1',
        )
        if (!existing && !body.name) {
          return NextResponse.json({ error: '姓名为必填项' }, { status: 400 })
        }
        if (existing) {
          const fields = Object.keys(body)
          const setClauses = fields.map((f) => `\`${f}\` = ?`).join(', ')
          const values = fields.map((f) => body[f])
          await execute(
            `UPDATE \`ResumeProfile\` SET ${setClauses} WHERE id = ?`,
            [...values, existing.id],
          )
          result = await queryOne('SELECT * FROM `ResumeProfile` WHERE id = ?', [existing.id])
        } else {
          const fields = Object.keys(body)
          const columns = fields.map((f) => `\`${f}\``).join(', ')
          const placeholders = fields.map(() => '?').join(', ')
          const values = fields.map((f) => body[f])
          const insertResult = await execute(
            `INSERT INTO \`ResumeProfile\` (${columns}) VALUES (${placeholders})`,
            values,
          )
          result = await queryOne('SELECT * FROM `ResumeProfile` WHERE id = ?', [insertResult.insertId])
        }
        invalidateResume()
        invalidateHome()
        break
      }
      case 'education': {
        const items = Array.isArray(body) ? body : []
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (!item.school || !item.degree || !item.startDate) {
            return NextResponse.json({ error: `第 ${i + 1} 条教育经历缺少必填项（学校/学位/开始时间）` }, { status: 400 })
          }
        }
        await transaction(async (tx) => {
          await tx.execute('DELETE FROM `ResumeEducation`')
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const fields = Object.keys(item)
            fields.push('sortOrder')
            const columns = fields.map((f) => `\`${f}\``).join(', ')
            const placeholders = fields.map(() => '?').join(', ')
            const values = [...fields.map((f) => f === 'sortOrder' ? i : item[f] ?? null)]
            await tx.execute(
              `INSERT INTO \`ResumeEducation\` (${columns}) VALUES (${placeholders})`,
              values,
            )
          }
        })
        invalidateResume()
        break
      }
      case 'skills': {
        const items = Array.isArray(body) ? body : []
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (!item.name || !item.category) {
            return NextResponse.json({ error: `第 ${i + 1} 条技能缺少必填项（名称/类别）` }, { status: 400 })
          }
        }
        await transaction(async (tx) => {
          await tx.execute('DELETE FROM `ResumeSkill`')
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const fields = Object.keys(item)
            fields.push('sortOrder')
            const columns = fields.map((f) => `\`${f}\``).join(', ')
            const placeholders = fields.map(() => '?').join(', ')
            const values = [...fields.map((f) => f === 'sortOrder' ? i : item[f] ?? null)]
            await tx.execute(
              `INSERT INTO \`ResumeSkill\` (${columns}) VALUES (${placeholders})`,
              values,
            )
          }
        })
        invalidateResume()
        break
      }
      case 'projects': {
        const items = Array.isArray(body) ? body : []
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (!item.name || !item.description) {
            return NextResponse.json({ error: `第 ${i + 1} 条项目缺少必填项（名称/描述）` }, { status: 400 })
          }
        }
        await transaction(async (tx) => {
          await tx.execute('DELETE FROM `ResumeProject`')
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const fields = Object.keys(item)
            fields.push('sortOrder')
            const columns = fields.map((f) => `\`${f}\``).join(', ')
            const placeholders = fields.map(() => '?').join(', ')
            const values = [...fields.map((f) => f === 'sortOrder' ? i : item[f] ?? null)]
            await tx.execute(
              `INSERT INTO \`ResumeProject\` (${columns}) VALUES (${placeholders})`,
              values,
            )
          }
        })
        invalidateResume()
        break
      }
      case 'certificates': {
        const items = Array.isArray(body) ? body : []
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (!item.name) {
            return NextResponse.json({ error: `第 ${i + 1} 条证书缺少必填项（名称）` }, { status: 400 })
          }
        }
        await transaction(async (tx) => {
          await tx.execute('DELETE FROM `ResumeCertificate`')
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const fields = Object.keys(item)
            fields.push('sortOrder')
            const columns = fields.map((f) => `\`${f}\``).join(', ')
            const placeholders = fields.map(() => '?').join(', ')
            const values = [...fields.map((f) => f === 'sortOrder' ? i : item[f] ?? null)]
            await tx.execute(
              `INSERT INTO \`ResumeCertificate\` (${columns}) VALUES (${placeholders})`,
              values,
            )
          }
        })
        invalidateResume()
        break
      }
      case 'intro': {
        const existing = await queryOne<RowDataPacket & { id: number }>(
          'SELECT id FROM `ResumeIntro` LIMIT 1',
        )
        if (existing) {
          await execute('UPDATE `ResumeIntro` SET content = ? WHERE id = ?', [body.content, existing.id])
          result = await queryOne('SELECT * FROM `ResumeIntro` WHERE id = ?', [existing.id])
        } else {
          const insertResult = await execute('INSERT INTO `ResumeIntro` (content) VALUES (?)', [body.content])
          result = await queryOne('SELECT * FROM `ResumeIntro` WHERE id = ?', [insertResult.insertId])
        }
        invalidateResume()
        break
      }
      case 'skill-content': {
        const existing = await queryOne<RowDataPacket & { id: number }>(
          'SELECT id FROM `ResumeSkillContent` LIMIT 1',
        )
        if (existing) {
          await execute('UPDATE `ResumeSkillContent` SET content = ? WHERE id = ?', [body.content, existing.id])
          result = await queryOne('SELECT * FROM `ResumeSkillContent` WHERE id = ?', [existing.id])
        } else {
          const insertResult = await execute('INSERT INTO `ResumeSkillContent` (content) VALUES (?)', [body.content])
          result = await queryOne('SELECT * FROM `ResumeSkillContent` WHERE id = ?', [insertResult.insertId])
        }
        invalidateResume()
        break
      }
      case 'site-intro': {
        const existing = await queryOne<RowDataPacket & { id: number }>(
          'SELECT id FROM `SiteIntro` LIMIT 1',
        )
        if (existing) {
          await execute('UPDATE `SiteIntro` SET content = ? WHERE id = ?', [body.content, existing.id])
          result = await queryOne('SELECT * FROM `SiteIntro` WHERE id = ?', [existing.id])
        } else {
          const insertResult = await execute('INSERT INTO `SiteIntro` (content) VALUES (?)', [body.content])
          result = await queryOne('SELECT * FROM `SiteIntro` WHERE id = ?', [insertResult.insertId])
        }
        invalidateResume()
        break
      }
      default:
        return NextResponse.json({ error: 'Unknown section' }, { status: 404 })
    }

    // 生产环境：清除 Next.js 页面缓存
    revalidatePath('/resume')

    return NextResponse.json(result)
  } catch (e) {
    console.error('[resume] PUT error:', (e as Error)?.message || e)
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }
}
