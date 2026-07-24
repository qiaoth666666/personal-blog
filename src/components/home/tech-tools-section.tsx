'use client'

import { FallingText } from '@/components/effects/falling-text'

/**
 * 技术工具展示区 —— 横贯全宽的技术词汇墙
 *
 * 点击后触发物理落差效果，文字散落至页脚分割线。
 */
const TECH_TEXT =
  'Java Python JavaScript TypeScript React Vue Angular Next.js Node.js Deno Bun Docker Git Linux Nginx MySQL PostgreSQL MongoDB Redis Elasticsearch WebSocket Tailwind Webpack Vite Rust Go Swift Spring Boot Flask'

const HIGHLIGHT_WORDS = [
  'Java', 'Python', 'JavaScript', 'TypeScript',
  'React', 'Vue', 'Next.js', 'Node.js', 
  'Spring Boot', 'Flask', 'Rust', 'Go', 'Swift', 
  'Docker', 'Git', 'Nginx', 'Linux','Terraform', 
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch','WebSocket',
  'Tailwind', 'Webpack', 'Vite',
]

export function TechToolsSection() {
  return (
    <section className="relative bg-[var(--sp-ground)]">
      <div className="mx-auto max-w-5xl px-6 pt-10 pb-0 text-center">
        <p
          className="text-sm text-[var(--sp-muted)]/50"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          ✦ 点击下面文字试试看 ✦
        </p>
      </div>
      <FallingText
        text={TECH_TEXT}
        highlightWords={HIGHLIGHT_WORDS}
        trigger="click"
        backgroundColor="transparent"
        gravity={0.56}
        fontSize="1.15rem"
        mouseConstraintStiffness={0.9}
      />
    </section>
  )
}
