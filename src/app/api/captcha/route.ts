import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET 环境变量未设置')
  return new TextEncoder().encode(secret)
}

/** 生成随机数学题 { question, answer } */
function generateMath() {
  const ops = [
    { sign: '+', fn: (a: number, b: number) => a + b },
    { sign: '−', fn: (a: number, b: number) => a - b },
    { sign: '×', fn: (a: number, b: number) => a * b },
  ]
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a: number, b: number

  if (op.sign === '+') {
    a = Math.floor(Math.random() * 15) + 1  // 1~15
    b = Math.floor(Math.random() * 15) + 1  // 1~15
  } else if (op.sign === '−') {
    a = Math.floor(Math.random() * 15) + 6  // 6~20
    b = Math.floor(Math.random() * a) + 1   // 1~a, 保证正数
  } else {
    a = Math.floor(Math.random() * 9) + 1   // 1~9
    b = Math.floor(Math.random() * 9) + 1   // 1~9
  }

  return {
    question: `${a} ${op.sign} ${b} = ?`,
    answer: op.fn(a, b),
  }
}

/** 生成带扰动的 SVG CAPTCHA 图片 */
function renderSvg(question: string): string {
  const w = 140
  const h = 48

  // 背景干扰线
  const lines: string[] = []
  for (let i = 0; i < 3; i++) {
    const y = 8 + Math.floor(Math.random() * (h - 16))
    lines.push(
      `<line x1="0" y1="${y}" x2="${w}" y2="${y + (Math.random() - 0.5) * 10}" stroke="#d4cebb" stroke-width="0.8" opacity="0.6" />`,
    )
  }

  // 随机噪点
  const dots: string[] = []
  for (let i = 0; i < 25; i++) {
    const cx = Math.floor(Math.random() * w)
    const cy = Math.floor(Math.random() * h)
    dots.push(`<circle cx="${cx}" cy="${cy}" r="1" fill="#b8b0a0" opacity="${0.15 + Math.random() * 0.25}" />`)
  }

  // 文字位置微调，模拟手工感
  const letters = question.split('')
  const textSpans = letters
    .map((ch, i) => {
      const x = 12 + i * 12 + (Math.random() - 0.5) * 2
      const y = 32 + (Math.random() - 0.5) * 3
      const rotate = (Math.random() - 0.5) * 5
      return `<text x="${x}" y="${y}" transform="rotate(${rotate}, ${x}, ${y})" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="#1c1c1a" opacity="0.85">${ch}</text>`
    })
    .join('')

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `<rect width="${w}" height="${h}" rx="4" fill="#faf7f2" stroke="#d4cebb" stroke-width="1" />`,
    ...lines,
    ...dots,
    textSpans,
    `</svg>`,
  ].join('')
}

export async function GET() {
  const { question, answer } = generateMath()

  // 将答案签名到 JWT cookie，5 分钟有效
  const secret = getSecret()
  const token = await new SignJWT({ answer })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('5m')
    .setIssuedAt()
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set('captcha_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 300, // 5 min
  })

  const svg = renderSvg(question)

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
