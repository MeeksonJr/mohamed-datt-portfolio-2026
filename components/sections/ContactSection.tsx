'use client'

import { useState } from 'react'
import { Mail, Github, Linkedin, Download, Sparkles, Send, CheckCircle2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import EditableText from '@/components/studio/EditableText'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import { PERSONAL_PROFILE } from '@/lib/content/default-portfolio-data'

export default function ContactSection() {
  const { persona, setResumeTailorOpen, setAvatarMood } = usePortfolioStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [brief, setBrief] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !brief.trim()) return
    setSent(true)
    setAvatarMood('celebrating')
    void confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } })
    toast.success('Signal prepared! Opening email client or reach Mohamed directly.')
    setTimeout(() => setAvatarMood('idle'), 3000)
  }

  return (
    <section id="section-contact" className="space-y-4">
      <div className="space-y-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] dark:text-[#F2A65A]">
          08 / Direct Signal & Resume Relay
        </span>
        <EditableText
          textKey="contactTitle"
          as="h2"
          className="font-display text-2xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#F5EFE2]"
        />
        <EditableText
          textKey="contactSubtitle"
          as="p"
          multiline
          className="text-xs leading-relaxed text-[#3B312B] dark:text-[#D5CFC2]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`mailto:${PERSONAL_PROFILE.email}`}
          className="flex items-center gap-1.5 rounded-xl border border-[#2C241E]/15 bg-white/50 px-3 py-1.5 text-[11px] font-semibold text-[#1E1A17] hover:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-white/[0.04] dark:text-[#F5EFE2]"
        >
          <Mail className="h-3.5 w-3.5 text-[#E06D43]" />
          {PERSONAL_PROFILE.email}
        </a>
        <a
          href={PERSONAL_PROFILE.github}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-[#2C241E]/15 bg-white/50 px-3 py-1.5 text-[11px] font-semibold text-[#1E1A17] hover:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-white/[0.04] dark:text-[#F5EFE2]"
        >
          <Github className="h-3.5 w-3.5" />
          GitHub
        </a>
        <a
          href={PERSONAL_PROFILE.linkedin}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-[#2C241E]/15 bg-white/50 px-3 py-1.5 text-[11px] font-semibold text-[#1E1A17] hover:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-white/[0.04] dark:text-[#F5EFE2]"
        >
          <Linkedin className="h-3.5 w-3.5 text-[#2DD4BF]" />
          LinkedIn
        </a>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <a
          href={`/api/resume/pdf?persona=${persona}`}
          className="flex items-center gap-1.5 rounded-xl bg-[#E06D43] px-4 py-2 text-xs font-bold text-white hover:brightness-110"
        >
          <Download className="h-3.5 w-3.5" />
          Download {persona === 'all' ? '2026' : persona.toUpperCase()} Resume PDF
        </a>
        <button
          type="button"
          onClick={() => setResumeTailorOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-[#2DD4BF]/45 bg-[#2DD4BF]/15 px-4 py-2 text-xs font-bold text-[#0F766E] hover:bg-[#2DD4BF]/25 dark:text-[#5EEAD4] cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Score Job Fit with Gemini AI
        </button>
      </div>

      {sent ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#2DD4BF]/40 bg-[#2DD4BF]/10 p-5 text-center">
          <CheckCircle2 className="h-8 w-8 text-[#2DD4BF]" />
          <h3 className="mt-2 font-display text-base font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
            Brief Ready for {name}!
          </h3>
          <div className="mt-3 flex gap-2">
            <a
              href={`mailto:${PERSONAL_PROFILE.email}?subject=${encodeURIComponent(
                `2026 Portfolio Inquiry from ${name}`
              )}&body=${encodeURIComponent(`${brief}\n\nReply to: ${email}`)}`}
              className="rounded-xl bg-[#E06D43] px-4 py-1.5 text-xs font-bold text-white"
            >
              Open Email Client
            </a>
            <button
              type="button"
              onClick={() => {
                setSent(false)
                setBrief('')
              }}
              className="rounded-xl border border-current/20 px-4 py-1.5 text-xs font-medium cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <input
              type="text"
              aria-label="Your Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="rounded-xl border border-[#2C241E]/15 bg-white/75 px-3 py-2.5 text-sm text-[#1E1A17] outline-none focus:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-[#121625]/70 dark:text-[#F5EFE2]"
            />
            <input
              type="email"
              aria-label="Your Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="rounded-xl border border-[#2C241E]/15 bg-white/75 px-3 py-2.5 text-sm text-[#1E1A17] outline-none focus:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-[#121625]/70 dark:text-[#F5EFE2]"
            />
          </div>
          <textarea
            rows={3}
            aria-label="Message or role details"
            required
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Tell me about the engineering role, ODU research collaboration, or SaaS build..."
            className="w-full rounded-xl border border-[#2C241E]/15 bg-white/75 p-3 text-sm text-[#1E1A17] outline-none focus:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-[#121625]/70 dark:text-[#F5EFE2]"
          />
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E06D43] to-[#C85A32] py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            Transmit Signal
          </button>
        </form>
      )}
    </section>
  )
}
