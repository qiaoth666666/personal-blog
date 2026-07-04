import nodemailer from 'nodemailer'
import { query } from '@/lib/db'
import type { Subscriber } from '@/types/db'
import { SITE_CONFIG } from '@/lib/constants'

// ============================
// SMTP 传输器（惰性初始化）
// ============================
let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '465', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.warn('[mailer] SMTP 未配置，邮件功能不可用。请在 .env 中设置 SMTP_HOST / SMTP_USER / SMTP_PASS')
    return null
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  return transporter
}

// ============================
// 发送单封邮件
// ============================
export async function sendNotificationEmail(to: string, subject: string, html: string) {
  const transport = getTransporter()
  if (!transport) {
    console.warn('[mailer] 跳过发送：SMTP 未配置')
    return { success: false, reason: 'SMTP 未配置' }
  }
  try {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER!
    await transport.sendMail({ from, to, subject, html })
    return { success: true }
  } catch (e) {
    console.error('[mailer] 发送失败:', e)
    return { success: false, reason: String(e) }
  }
}

// ============================
// 向所有已审核订阅者群发通知
// ============================
export async function notifySubscribers(
  type: 'article' | 'software',
  data: {
    title?: string
    slug?: string
    excerpt?: string | null
    name?: string
    description?: string | null
  },
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  let subject = ''
  let html = ''

  if (type === 'article') {
    const articleUrl = `${baseUrl}/articles/${encodeURIComponent(data.slug ?? '')}`
    subject = `📝 新文章发布：${data.title}`
    html = `
      <div style="max-width:600px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">${data.title}</h2>
        ${data.excerpt ? `<p style="color:#555;line-height:1.6;">${data.excerpt}</p>` : ''}
        <a href="${articleUrl}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:0;">
          阅读全文 →
        </a>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e5e5;" />
        <p style="color:#999;font-size:12px;">
          你收到此邮件是因为你订阅了 <strong>${SITE_CONFIG.name}</strong> 的内容更新。
          <br/>如果不想再收到此类邮件，可以
          <a href="{{unsubscribeUrl}}" style="color:#999;">点击此处退订</a>。
        </p>
      </div>
    `
  } else {
    const softwareUrl = `${baseUrl}/software`
    subject = `💿 新软件上传：${data.name}`
    html = `
      <div style="max-width:600px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">${data.name}</h2>
        ${data.description ? `<p style="color:#555;line-height:1.6;">${data.description}</p>` : ''}
        <a href="${softwareUrl}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:0;">
          前往软库查看 →
        </a>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e5e5;" />
        <p style="color:#999;font-size:12px;">
          你收到此邮件是因为你订阅了 <strong>${SITE_CONFIG.name}</strong> 的内容更新。
          <br/>如果不想再收到此类邮件，可以
          <a href="{{unsubscribeUrl}}" style="color:#999;">点击此处退订</a>。
        </p>
      </div>
    `
  }

  // 查询所有已审核通过的订阅者
  const subscribers = await query<Pick<Subscriber, 'id' | 'email' | 'token'> & import('mysql2').RowDataPacket>(
    'SELECT id, email, token FROM `Subscriber` WHERE status = ?',
    ['APPROVED'],
  )

  if (subscribers.length === 0) {
    console.log('[mailer] 无已审核订阅者，跳过发送')
    return { sent: 0, total: 0 }
  }

  // 逐个发送（避免并发过高被封）
  let sent = 0
  for (const sub of subscribers) {
    const personalizedHtml = html.replace(
      '{{unsubscribeUrl}}',
      `${baseUrl}/api/subscribe/unsubscribe?token=${sub.token}`,
    )
    const result = await sendNotificationEmail(sub.email, subject, personalizedHtml)
    if (result.success) sent++
  }

  console.log(`[mailer] 通知发送完成: ${sent}/${subscribers.length}`)
  return { sent, total: subscribers.length }
}
