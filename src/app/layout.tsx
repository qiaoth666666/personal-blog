import type { Metadata } from 'next'
import { Playfair_Display, Source_Serif_4, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { LayoutShell } from '@/components/layout/layout-shell'
import { SiteConfigProvider } from '@/components/layout/site-config-provider'
import { MarkdownFormatStyles } from '@/components/layout/markdown-format-styles'
import { MusicProvider } from '@/components/music/music-context'
import { getAboutConfigCached } from '@/lib/about-config'
import './globals.css'

const playfairDisplay = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const sourceSerif4 = Source_Serif_4({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const config = await getAboutConfigCached()
  return {
    title: {
      default: config.siteName || '个人博客',
      template: `%s | ${config.siteName || '个人博客'}`,
    },
    description: config.siteDescription || '温润、人文、有温度的私人数字花园。',
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      siteName: config.siteName || '个人博客',
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${playfairDisplay.variable} ${sourceSerif4.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MusicProvider>
            <SiteConfigProvider>
              <MarkdownFormatStyles />
              <LayoutShell>{children}</LayoutShell>
            </SiteConfigProvider>
          </MusicProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
