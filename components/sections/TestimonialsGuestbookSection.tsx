'use client'

import { useEffect, useState } from 'react'
import { Award, MessageSquarePlus, Send } from 'lucide-react'
import { toast } from 'sonner'
import SpotlightCard from '@/components/ui/SpotlightCard'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import { TESTIMONIALS } from '@/lib/content/default-portfolio-data'
import { cn } from '@/lib/utils'

interface GuestbookEntry {
  id: string
  authorName: string
  roleOrCompany: string
  message: string
  accentColor: string
}

export default function TestimonialsGuestbookSection() {
  const { selectedPlanetNode, setSelectedPlanetNode } = usePortfolioStore()
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [authorName, setAuthorName] = useState('')
  const [roleOrCompany, setRoleOrCompany] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/guestbook')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.entries)) setEntries(data.entries)
      })
      .catch(() => {})
  }, [])

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorName.trim() || !message.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, roleOrCompany, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not post note')
      setEntries((prev) => [data.entry, ...prev])
      setAuthorName('')
      setRoleOrCompany('')
      setMessage('')
      toast.success('Signed the 2026–2027 guestbook!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="section-testimonials" className="space-y-4">
      <div className="space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] dark:text-[#F2A65A]">
          07 / Recognition & Visitor Wall
        </span>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#F5EFE2]">
          Awards, Acquisitions & Guestbook Beacons
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <SpotlightCard
            key={t.id}
            className={cn(
              'p-3.5 transition',
              selectedPlanetNode === t.id && 'ring-2 ring-[#F59E0B]'
            )}
            spotlightColor="rgba(242, 166, 90, 0.14)"
          >
            <button
              type="button"
              onClick={() => setSelectedPlanetNode(t.id)}
              className="w-full text-left cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 shrink-0 text-[#E06D43]" />
                <span className="truncate font-display text-xs font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
                  {t.name}
                </span>
              </div>
              <span className="mt-1 inline-block rounded-full bg-[#E06D43]/15 px-2 py-0.5 font-mono text-[9px] font-semibold text-[#A94422] dark:text-[#F2A65A]">
                {t.tag}
              </span>
              <p className="mt-2 text-[11px] leading-relaxed text-[#3B312B] dark:text-[#D5CFC2]">
                “{t.quote}”
              </p>
            </button>
          </SpotlightCard>
        ))}
      </div>

      <SpotlightCard className="p-4">
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4 text-[#0F766E] dark:text-[#2DD4BF]" />
          <h3 className="font-display text-sm font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
            Sign the 2026–2027 Guestbook
          </h3>
        </div>

        <form onSubmit={handlePost} className="mt-3 space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="text"
              aria-label="Your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              required
              className="rounded-xl border border-[#2C241E]/15 bg-white/75 px-3 py-2 text-sm text-[#1E1A17] outline-none focus:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-[#121625]/70 dark:text-[#F5EFE2]"
            />
            <input
              type="text"
              aria-label="Role or Company"
              value={roleOrCompany}
              onChange={(e) => setRoleOrCompany(e.target.value)}
              placeholder="Role or Company (optional)"
              className="rounded-xl border border-[#2C241E]/15 bg-white/75 px-3 py-2 text-sm text-[#1E1A17] outline-none focus:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-[#121625]/70 dark:text-[#F5EFE2]"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              aria-label="Guestbook note"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a note on Echo Constellation..."
              required
              className="flex-1 rounded-xl border border-[#2C241E]/15 bg-white/75 px-3 py-2 text-sm text-[#1E1A17] outline-none focus:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-[#121625]/70 dark:text-[#F5EFE2]"
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1 rounded-xl bg-[#E06D43] px-3.5 py-1.5 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              Post
            </button>
          </div>
        </form>

        <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-[#2C241E]/10 bg-white/40 p-2.5 dark:border-[#E6DEC8]/10 dark:bg-white/[0.03]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
                  {entry.authorName}
                </span>
                <span className="font-mono text-[10px] text-[#5A4F46] dark:text-[#A39E93]">
                  {entry.roleOrCompany}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-[#3B312B] dark:text-[#D5CFC2]">{entry.message}</p>
            </div>
          ))}
        </div>
      </SpotlightCard>
    </section>
  )
}
