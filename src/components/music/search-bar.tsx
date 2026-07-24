'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchBarProps {
  onSearch: (keyword: string) => void
  isLoading: boolean
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = query.trim()
      if (trimmed) onSearch(trimmed)
    },
    [query, onSearch],
  )

  // 键盘快捷键: / 聚焦搜索
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="relative mx-auto w-full max-w-xl"
    >
      <div
        className={`
          group relative flex items-center overflow-hidden
          border-2 transition-all duration-500
          border-[var(--sp-accent-sienna)] shadow-[0_0_16px_rgba(184,85,58,0.08)]
        `}
        style={{ borderRadius: '16px' }}
      >
        {/* 复古纹理叠加 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />

        {/* 搜索图标 */}
        <div className="pl-5">
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-[var(--sp-muted)]" />
          ) : (
            <Search size={18} className="text-[var(--sp-muted)] transition-colors group-focus-within:text-[var(--sp-accent-sienna)]" />
          )}
        </div>

        {/* 输入框 */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="搜索歌曲、艺术家、专辑..."
          className="
            flex-1 bg-transparent px-4 py-4 text-base
            text-[var(--sp-ink)] placeholder:text-[var(--sp-muted)]/50
            outline-none font-sans
          "
          style={{ fontFamily: 'var(--font-sans)' }}
        />

        {/* 快捷键提示 */}
        {!focused && !query && (
          <kbd
            className="
              mr-4 hidden sm:inline-flex items-center gap-0.5
              rounded-md border border-[var(--sp-hairline)]/60
              px-2 py-0.5 text-[10px] text-[var(--sp-muted)]/50
              font-mono
            "
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            /
          </kbd>
        )}

        {/* 搜索按钮 */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          disabled={isLoading || !query.trim()}
          className="
            mr-2 rounded-xl px-5 py-2 text-sm font-medium
            bg-[var(--sp-accent-sienna)] text-white
            hover:opacity-90 transition-opacity
            disabled:opacity-40 disabled:cursor-not-allowed
            cursor-pointer font-sans
          "
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          搜索
        </motion.button>
      </div>

      {/* 热门搜索提示 */}
      <AnimatePresence>
        {focused && !query && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-[var(--sp-hairline)]/30 bg-[var(--sp-surface)] p-4 shadow-lg backdrop-blur-xl z-20"
          >
            <p className="mb-3 text-xs font-medium tracking-widest uppercase text-[var(--sp-muted)]/60"
              style={{ fontFamily: 'var(--font-sans)' }}>
              热门搜索
            </p>
            <div className="flex flex-wrap gap-2">
              {['周杰伦', '告五人', 'Taylor Swift', '坂本龍一', '毛不易', '陈奕迅'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setQuery(tag)
                    onSearch(tag)
                  }}
                  className="rounded-lg border border-[var(--sp-hairline)]/30 px-3 py-1.5 text-xs
                    text-[var(--sp-muted)] hover:text-[var(--sp-ink)] hover:border-[var(--sp-hairline)]
                    transition-colors cursor-pointer font-sans"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  )
}
