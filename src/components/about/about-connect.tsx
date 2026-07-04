import Link from 'next/link'
import { Mail, MapPin, Globe } from 'lucide-react'

interface ConnectData {
  email: string | null
  location: string | null
  website: string | null
  github: string | null
  qq: string | null
  twitter: string | null
  bilibili: string | null
}

/**
 * 联系方式区 —— 图标列表 + 社交图标行
 * 数据来源于 AboutConfig
 */
export function AboutConnect({ config }: { config: ConnectData }) {
  const items: Array<{ icon: React.ReactNode; label: string; href?: string }> = []

  if (config.email) {
    items.push({
      icon: <Mail size={18} />,
      label: config.email,
      href: `mailto:${config.email}`,
    })
  }
  if (config.location) {
    items.push({
      icon: <MapPin size={18} />,
      label: config.location,
    })
  }
  if (config.website) {
    items.push({
      icon: <Globe size={18} />,
      label: config.website.replace(/^https?:\/\//, ''),
      href: config.website,
    })
  }

  const hasSocial = config.github || config.qq || config.twitter || config.bilibili

  if (items.length === 0 && !hasSocial) return null

  return (
    <div className="border-t border-[var(--sp-hairline)] pt-12">
      <h2
        className="mb-8 text-center font-display text-2xl font-bold text-[var(--sp-ink)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        与我联系
      </h2>

      {/* 文字联系方式 */}
      {items.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {items.map((item) => (
            <div key={item.label} style={{ fontFamily: 'var(--font-sans)' }}>
              {item.href ? (
                <Link
                  href={item.href}
                  target={item.href.startsWith('mailto') ? undefined : '_blank'}
                  className="inline-flex items-center gap-2 text-sm text-[var(--sp-muted)] no-underline transition-colors hover:text-[var(--sp-accent-teal)]"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm text-[var(--sp-muted)]">
                  {item.icon}
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 社交图标行 */}
      {hasSocial && (
        <div className="mt-6 flex justify-center gap-5">
          {config.github && (
            <Link
              href={config.github}
              target="_blank"
              className="text-[var(--sp-muted)] transition-colors hover:text-[var(--sp-ink)]"
              aria-label="GitHub"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </Link>
          )}
          {config.qq && (
            <Link
              href={`tencent://message/?uin=${config.qq}`}
              className="text-[var(--sp-muted)] transition-colors hover:text-[var(--sp-accent-teal)]"
              aria-label="QQ"
              title={`QQ: ${config.qq}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c4.5 0 8-3.5 8-8 0-3.5-2-6-4.5-7.2.2-.6.5-1.8.5-2.8 0-2-1.5-3-2-3s-2 1-2 3c0 1 .3 2.2.5 2.8C10 8 8 10.5 8 14c0 4.5 3.5 8 8 8z" />
                <path d="M7.5 14c-1.5.5-3 2-3 3.5 0 1 .5 2 1 2.5" />
                <path d="M16.5 14c1.5.5 3 2 3 3.5 0 1-.5 2-1 2.5" />
              </svg>
            </Link>
          )}
          {config.twitter && (
            <Link
              href={config.twitter}
              target="_blank"
              className="text-[var(--sp-muted)] transition-colors hover:text-[var(--sp-accent-teal)]"
              aria-label="Twitter"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </Link>
          )}
          {config.bilibili && (
            <Link
              href={config.bilibili}
              target="_blank"
              className="text-[var(--sp-muted)] transition-colors hover:text-[var(--sp-accent-teal)]"
              aria-label="Bilibili"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.5 3.5l-3 3-3-3-3 3-3-3" />
                <path d="M4 8h16v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                <path d="M9 12v4" />
                <path d="M12 12v4" />
                <path d="M15 12v4" />
              </svg>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
