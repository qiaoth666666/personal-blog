'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Check, AlertCircle, Loader2, Link2, Mail, FileText, Globe } from 'lucide-react'
import { toast } from 'sonner'

/**
 * 友链申请表单
 *
 * 用户在前台提交友链申请，状态为 PENDING，等待管理员审核。
 * 使用项目设计 token，风格与留言板表单一致。
 */
export function FriendApplyForm() {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: '',
    url: '',
    description: '',
    iconUrl: '',
    email: '',
    message: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = '请填写站点名称'
    if (!form.url.trim()) errs.url = '请填写站点链接'
    else if (!/^https?:\/\//i.test(form.url.trim()) && !/^[\w.-]+\.[a-z]{2,}/i.test(form.url.trim())) {
      errs.url = '链接格式不正确'
    }
    if (!form.email.trim()) errs.email = '请填写联系邮箱'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = '邮箱格式不正确'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/friends/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          url: form.url.trim(),
          description: form.description.trim() || null,
          iconUrl: form.iconUrl.trim() || null,
          email: form.email.trim(),
          message: form.message.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || '提交失败')
        return
      }

      setSuccess(true)
      toast.success('友链申请已提交，请等待审核')
    } catch {
      toast.error('网络错误，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setForm({ name: '', url: '', description: '', iconUrl: '', email: '', message: '' })
    setErrors({})
    setSuccess(false)
    setOpen(false)
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* 触发按钮 */}
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          className="mx-auto flex items-center gap-2.5 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-6 py-3 text-sm font-medium text-[var(--sp-ground)] transition-all duration-300 hover:bg-transparent hover:text-[var(--sp-ink)] cursor-pointer"
          style={{ fontFamily: 'var(--font-sans)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link2 size={16} strokeWidth={1.5} />
          申请加入友链
        </motion.button>
      )}

      {/* 表单面板 */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="overflow-hidden border border-[var(--sp-hairline)] bg-[var(--sp-surface)]"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="p-6 sm:p-8">
              {success ? (
                /* 成功状态 */
                <motion.div
                  className="py-8 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--sp-accent-teal)]">
                    <Check size={28} className="text-[var(--sp-accent-teal)]" strokeWidth={1.5} />
                  </div>
                  <h3
                    className="font-display text-lg font-bold text-[var(--sp-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    申请已提交
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed text-[var(--sp-muted)]"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    感谢你的申请！我会尽快审核并通过邮件通知你。
                    <br />
                    审核通过后，你的站点将出现在友链列表中。
                  </p>
                  <button
                    onClick={reset}
                    className="mt-6 text-sm text-[var(--sp-accent-teal)] hover:opacity-70 transition-opacity cursor-pointer"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    关闭
                  </button>
                </motion.div>
              ) : (
                /* 表单 */
                <form onSubmit={handleSubmit}>
                  <h3
                    className="mb-6 font-display text-lg font-bold text-[var(--sp-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    申请友链
                  </h3>

                  <div className="space-y-5">
                    {/* 站点名称 */}
                    <div>
                      <label
                        className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        <Globe size={12} className="mr-1.5 inline-block" strokeWidth={1.5} />
                        站点名称 *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: '' })) }}
                        placeholder="你的博客 / 站点名"
                        className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-2.5 text-sm text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-accent-teal)] placeholder:text-[var(--sp-muted)]/50"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-[var(--sp-accent-sienna)]" style={{ fontFamily: 'var(--font-sans)' }}>
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* 站点链接 */}
                    <div>
                      <label
                        className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        <Link2 size={12} className="mr-1.5 inline-block" strokeWidth={1.5} />
                        站点链接 *
                      </label>
                      <input
                        type="text"
                        value={form.url}
                        onChange={(e) => { setForm((p) => ({ ...p, url: e.target.value })); setErrors((p) => ({ ...p, url: '' })) }}
                        placeholder="https://your-site.com"
                        className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-2.5 text-sm text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-accent-teal)] placeholder:text-[var(--sp-muted)]/50"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      />
                      {errors.url && (
                        <p className="mt-1 text-xs text-[var(--sp-accent-sienna)]" style={{ fontFamily: 'var(--font-sans)' }}>
                          {errors.url}
                        </p>
                      )}
                    </div>

                    {/* 联系邮箱 */}
                    <div>
                      <label
                        className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        <Mail size={12} className="mr-1.5 inline-block" strokeWidth={1.5} />
                        联系邮箱 *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: '' })) }}
                        placeholder="your@email.com"
                        className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-2.5 text-sm text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-accent-teal)] placeholder:text-[var(--sp-muted)]/50"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-[var(--sp-accent-sienna)]" style={{ fontFamily: 'var(--font-sans)' }}>
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* 站点简介 */}
                    <div>
                      <label
                        className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        <FileText size={12} className="mr-1.5 inline-block" strokeWidth={1.5} />
                        站点简介（可选）
                      </label>
                      <input
                        type="text"
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        placeholder="一句话介绍你的站点"
                        className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-2.5 text-sm text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-accent-teal)] placeholder:text-[var(--sp-muted)]/50"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      />
                    </div>

                    {/* 头像/图标 URL */}
                    <div>
                      <label
                        className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        站点图标 URL（可选）
                      </label>
                      <input
                        type="text"
                        value={form.iconUrl}
                        onChange={(e) => setForm((p) => ({ ...p, iconUrl: e.target.value }))}
                        placeholder="https://your-site.com/favicon.ico"
                        className="w-full border-b border-[var(--sp-hairline)] bg-transparent py-2.5 text-sm text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-accent-teal)] placeholder:text-[var(--sp-muted)]/50"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      />
                    </div>

                    {/* 申请留言 */}
                    <div>
                      <label
                        className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--sp-muted)]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        <Send size={12} className="mr-1.5 inline-block" strokeWidth={1.5} />
                        申请留言（可选）
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                        placeholder="想对站长说的话…"
                        rows={3}
                        className="w-full resize-none border-b border-[var(--sp-hairline)] bg-transparent py-2.5 text-sm text-[var(--sp-ink)] outline-none transition-colors focus:border-[var(--sp-accent-teal)] placeholder:text-[var(--sp-muted)]/50"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      />
                    </div>
                  </div>

                  {/* 按钮区 */}
                  <div className="mt-7 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 border-2 border-[var(--sp-ink)] bg-[var(--sp-ink)] px-5 py-2.5 text-sm font-medium text-[var(--sp-ground)] transition-all duration-300 hover:bg-transparent hover:text-[var(--sp-ink)] disabled:opacity-50 cursor-pointer"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {submitting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} strokeWidth={1.5} />
                      )}
                      {submitting ? '提交中...' : '提交申请'}
                    </button>
                    <button
                      type="button"
                      onClick={reset}
                      className="text-sm text-[var(--sp-muted)] hover:text-[var(--sp-ink)] transition-colors cursor-pointer"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      取消
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
