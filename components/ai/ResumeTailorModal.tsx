'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X,
  Sparkles,
  FileText,
  CheckCircle2,
  Download,
  Printer,
  Loader2,
  UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import { buildPersonaResume } from '@/lib/resume/resume-presets'
import type { PersonaId } from '@/lib/content/types'
import { cn } from '@/lib/utils'

interface TailorResult {
  matchScore: number
  roleTitle: string
  tailoredSummary: string
  executivePitch: string
  matchedProjects: string[]
  matchedSkills: string[]
  talkingPoints: string[]
  provider?: string
}

const RESUME_TRACKS: Array<{ id: PersonaId; label: string }> = [
  { id: 'all', label: 'Master 2026–2027' },
  { id: 'recruiter', label: 'Recruiter SWE' },
  { id: 'engineer', label: 'Systems & 3D' },
  { id: 'research', label: 'ODU Edge-AI Lab' },
  { id: 'client', label: 'SaaS Founder' },
]

const SAMPLE_JD =
  'Seeking a Full-Stack AI Engineer skilled in Next.js, React, TypeScript, PostgreSQL/Drizzle ORM, Three.js interactive UI, and Google Gemini LLM integration to build production SaaS products.'

export default function ResumeTailorModal() {
  const { resumeTailorOpen, setResumeTailorOpen, persona } = usePortfolioStore()
  const [selectedTrack, setSelectedTrack] = useState<PersonaId>(persona)
  const [jd, setJd] = useState(SAMPLE_JD)
  const [loading, setLoading] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [result, setResult] = useState<TailorResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSelectedTrack(persona)
  }, [persona])

  useEffect(() => {
    if (!resumeTailorOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setResumeTailorOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [resumeTailorOpen, setResumeTailorOpen])

  const previewResume = buildPersonaResume(
    selectedTrack,
    result
      ? {
          roleTitle: result.roleTitle,
          summary: result.tailoredSummary,
        }
      : undefined
  )

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to tailor resume')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadGeneratedPdf = async () => {
    setDownloadingPdf(true)
    try {
      const res = await fetch('/api/resume/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: selectedTrack,
          overrides: result
            ? {
                roleTitle: result.roleTitle,
                summary: result.tailoredSummary,
              }
            : undefined,
        }),
      })
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Mohamed-Datt-Resume-${selectedTrack}-2026.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Downloaded ResumeForge ${previewResume.personaLabel} PDF`)
    } catch {
      toast.error('Failed to generate custom PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <AnimatePresence>
      {resumeTailorOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setResumeTailorOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="resumeforge-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#E6DEC8]/20 bg-[#181C2E] text-[#F5EFE2] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E06D43]/20 text-[#F2A65A] ring-1 ring-[#E06D43]/40">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 id="resumeforge-modal-title" className="font-display text-base font-bold">
                    ResumeForge 2026 • Persona PDF Studio & AI Job Tailor
                  </h3>
                  <p className="text-xs text-[#B8B2A6]">
                    Switch role track or paste a job description to generate a tailored PDF resume live
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close ResumeForge dialog"
                onClick={() => setResumeTailorOpen(false)}
                className="rounded-full border border-white/10 p-2 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              {/* Persona Track Selector */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#2DD4BF]">
                    <UserCheck className="h-3.5 w-3.5" />
                    Select Visitor Resume Track
                  </span>
                  <button
                    type="button"
                    disabled={downloadingPdf}
                    onClick={() => void handleDownloadGeneratedPdf()}
                    className="flex items-center gap-1.5 rounded-xl bg-[#E06D43] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
                  >
                    {downloadingPdf ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Download {previewResume.personaLabel} PDF
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {RESUME_TRACKS.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        setSelectedTrack(track.id)
                        setResult(null)
                      }}
                      className={cn(
                        'rounded-xl border px-3 py-1.5 font-mono text-[11px] font-semibold transition cursor-pointer',
                        selectedTrack === track.id
                          ? 'border-[#E06D43] bg-[#E06D43] text-white'
                          : 'border-white/15 bg-white/[0.04] text-[#D5CFC2] hover:border-[#E06D43]/50'
                      )}
                    >
                      {track.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live ATS Sheet Preview */}
              <div className="rounded-2xl border border-[#E6DEC8]/15 bg-[#121625] p-5 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h4 className="font-display text-lg font-bold text-[#F5EFE2]">
                      {previewResume.name}
                    </h4>
                    <p className="text-xs font-semibold text-[#F2A65A]">
                      {previewResume.roleTitle}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-[#2DD4BF]">
                    {previewResume.personaLabel}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#D5CFC2]">{previewResume.summary}</p>
                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  <div>
                    <p className="font-mono text-[10px] uppercase text-[#9CA3AF]">
                      Prioritized 2026–2027 Builds
                    </p>
                    <ul className="mt-1 space-y-1">
                      {previewResume.projects.map((p) => (
                        <li key={p.name} className="text-[11px] text-[#F5EFE2]">
                          • <strong>{p.name}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase text-[#9CA3AF]">
                      Highlighted Stack
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {previewResume.skillsGroups
                        .flatMap((g) => g.items)
                        .slice(0, 8)
                        .map((sk) => (
                          <span
                            key={sk}
                            className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-[#5EEAD4]"
                          >
                            {sk}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Job Description AI Fit Scorer */}
              <div className="space-y-2 border-t border-white/10 pt-4">
                <label className="text-xs font-semibold text-[#E6DEC8]">
                  Optional: Paste a Job Description to AI-Tailor This PDF
                </label>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-xs leading-relaxed text-white outline-none focus:border-[#2DD4BF]"
                  placeholder="Paste role requirements here..."
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => void handleAnalyze()}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl border border-[#2DD4BF]/45 bg-[#2DD4BF]/15 px-4 py-2 text-xs font-bold text-[#5EEAD4] transition hover:bg-[#2DD4BF]/25 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    {loading ? 'Tailoring with Gemini...' : 'Tailor Resume & Score Fit'}
                  </button>

                  {result && (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-xs text-slate-200 hover:bg-white/10 cursor-pointer"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print View
                    </button>
                  )}
                </div>

                {error && <p className="text-xs text-rose-400">{error}</p>}
              </div>

              {result && (
                <div className="space-y-3 rounded-2xl border border-[#2DD4BF]/35 bg-[#2DD4BF]/[0.06] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[10px] text-[#2DD4BF]">GEMINI FIT REPORT</p>
                      <p className="font-display text-base font-bold">{result.roleTitle}</p>
                    </div>
                    <div className="rounded-xl border border-[#2DD4BF]/40 bg-[#2DD4BF]/15 px-3 py-1.5 font-mono text-lg font-extrabold text-[#5EEAD4]">
                      {result.matchScore}% FIT
                    </div>
                  </div>
                  <p className="text-xs text-[#D5CFC2]">{result.executivePitch}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedProjects.map((proj) => (
                      <span
                        key={proj}
                        className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] text-[#F2A65A]"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {proj}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
