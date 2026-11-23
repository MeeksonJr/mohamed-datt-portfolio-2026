'use client'

import { useState } from 'react'
import {
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Briefcase,
  Cpu,
  Layers,
  Sparkles,
  UserCheck,
  Printer,
} from 'lucide-react'
import { toast } from 'sonner'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import { buildPersonaResume } from '@/lib/resume/resume-presets'
import type { PersonaId } from '@/lib/content/types'
import { cn } from '@/lib/utils'

type ResumePartKey = 'all-parts' | 'summary' | 'skills' | 'experience' | 'projects' | 'education'

const TRACK_OPTIONS: Array<{ id: PersonaId; label: string; badge: string }> = [
  { id: 'all', label: 'Master 2026–2027', badge: 'Full Overview' },
  { id: 'recruiter', label: 'Recruiter / SWE', badge: 'High-Impact ATS' },
  { id: 'engineer', label: 'Systems & 3D', badge: 'C++ / WebGL' },
  { id: 'research', label: 'ODU Edge-AI Lab', badge: 'NIH / NSF R1' },
  { id: 'client', label: 'SaaS Founder', badge: 'Commercial Builds' },
]

const PART_OPTIONS: Array<{
  key: ResumePartKey
  code: string
  label: string
  icon: typeof FileText
  description: string
}> = [
  {
    key: 'all-parts',
    code: 'ALL',
    label: 'Full 1-Page Sheet',
    icon: FileText,
    description: 'Complete recruiter-ready resume across all 5 parts',
  },
  {
    key: 'summary',
    code: '01',
    label: 'Executive Summary',
    icon: UserCheck,
    description: 'Role positioning, GPA, competition win & acquisition proof',
  },
  {
    key: 'skills',
    code: '02',
    label: 'Technical Stack',
    icon: Layers,
    description: 'Languages, frameworks, databases & AI/ML systems',
  },
  {
    key: 'experience',
    code: '03',
    label: 'Experience & Lab',
    icon: Briefcase,
    description: 'ODU Hands-On Lab, Freelance SaaS sales & Internship win',
  },
  {
    key: 'projects',
    code: '04',
    label: 'Selected Projects',
    icon: Cpu,
    description: 'Priority flagship builds tailored to your selected track',
  },
  {
    key: 'education',
    code: '05',
    label: 'Education & Honors',
    icon: GraduationCap,
    description: 'Old Dominion University B.S. CS & Tidewater CC 3.8 GPA',
  },
]

export default function InteractiveResumePreviewSection() {
  const { persona, setPersona, setResumeTailorOpen } = usePortfolioStore()
  const [activePart, setActivePart] = useState<ResumePartKey>('all-parts')
  const [viewMode, setViewMode] = useState<'interactive' | 'pdf'>('interactive')
  const [copiedAts, setCopiedAts] = useState(false)

  const resume = buildPersonaResume(persona)
  const pdfDownloadUrl = `/api/resume/pdf?persona=${persona}`
  const pdfInlineUrl = `/api/resume/pdf?persona=${persona}&disposition=inline`

  const handleCopyPlainText = async () => {
    const plainText = [
      `${resume.name.toUpperCase()} — ${resume.roleTitle}`,
      `${resume.location} | ${resume.email} | ${resume.phone} | ${resume.github}`,
      '',
      `SUMMARY (${resume.personaLabel})`,
      resume.summary,
      '',
      'TECHNICAL STACK',
      ...resume.skillsGroups.map((g) => `${g.label}: ${g.items.join(', ')}`),
      '',
      'EXPERIENCE & RESEARCH',
      ...resume.experience.flatMap((e) => [
        `${e.role} — ${e.company} (${e.period})`,
        ...e.bullets.map((b) => `  • ${b}`),
      ]),
      '',
      'SELECTED PROJECTS',
      ...resume.projects.flatMap((p) => [
        `${p.name} [${p.stack}]`,
        ...p.bullets.map((b) => `  • ${b}`),
      ]),
      '',
      'EDUCATION',
      ...resume.education.map((ed) => `${ed.degree} — ${ed.school} (${ed.period}) | ${ed.details}`),
    ].join('\n')

    try {
      await navigator.clipboard.writeText(plainText)
      setCopiedAts(true)
      toast.success(`Copied ${resume.personaLabel} ATS plain-text resume!`)
      setTimeout(() => setCopiedAts(false), 2500)
    } catch {
      toast.error('Unable to copy automatically — please use Download PDF.')
    }
  }

  const showPart = (key: Exclude<ResumePartKey, 'all-parts'>) =>
    activePart === 'all-parts' || activePart === key

  return (
    <section
      id="section-resume"
      aria-labelledby="resume-preview-heading"
      className="space-y-6 rounded-[2rem] border border-[#2C241E]/20 bg-[#F4EFE4] p-6 text-[#1E1A17] shadow-xl sm:p-8 dark:border-[#E6DEC8]/15 dark:bg-[#141726] dark:text-[#F5EFE2]"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2C241E]/15 pb-5 dark:border-[#E6DEC8]/15">
        <div className="space-y-1.5">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#B84A24] dark:text-[#F2A65A]">
            RESUMEFORGE ENGINE // PER-TRACK & PER-PART PREVIEWS
          </span>
          <h2
            id="resume-preview-heading"
            className="font-display text-3xl font-extrabold tracking-tight text-[#1E1A17] sm:text-4xl dark:text-[#F5EFE2]"
          >
            Inspect Resume by{' '}
            <span className="font-serif font-normal italic text-[#E06D43] dark:text-[#F2A65A]">
              Part & Role Track.
            </span>
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-[#3B312B] dark:text-[#D5CFC2]">
            Switch between all 5 tailored visitor tracks and inspect individual resume sections side-by-side, or switch directly to the live rendered PDF sheet.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Resume preview display mode"
            className="flex items-center rounded-xl border border-[#2C241E]/15 bg-white/70 p-1 dark:border-[#E6DEC8]/15 dark:bg-[#0D101B]"
          >
            <button
              type="button"
              onClick={() => setViewMode('interactive')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition cursor-pointer',
                viewMode === 'interactive'
                  ? 'bg-[#1E1A17] text-white dark:bg-[#F5EFE2] dark:text-[#111827]'
                  : 'text-[#4A3F37] hover:text-[#1E1A17] dark:text-[#B8B2A6] dark:hover:text-white'
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              Interactive Part Sheet
            </button>
            <button
              type="button"
              onClick={() => setViewMode('pdf')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition cursor-pointer',
                viewMode === 'pdf'
                  ? 'bg-[#E06D43] text-white'
                  : 'text-[#4A3F37] hover:text-[#1E1A17] dark:text-[#B8B2A6] dark:hover:text-white'
              )}
            >
              <Printer className="h-3.5 w-3.5" />
              Live PDF Frame
            </button>
          </div>

          <button
            type="button"
            onClick={() => void handleCopyPlainText()}
            className="flex items-center gap-1.5 rounded-xl border border-[#2C241E]/20 bg-white/80 px-3.5 py-2 font-mono text-xs font-bold text-[#1E1A17] transition hover:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-white/[0.06] dark:text-[#F5EFE2] cursor-pointer"
          >
            {copiedAts ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedAts ? 'Copied ATS' : 'Copy ATS Text'}
          </button>

          <a
            href={pdfDownloadUrl}
            className="flex items-center gap-1.5 rounded-xl bg-[#E06D43] px-4 py-2 font-mono text-xs font-bold text-white shadow-md transition hover:brightness-110"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF ({persona.toUpperCase()})
          </a>
        </div>
      </div>

      {/* Role Track Tabs */}
      <div
        role="tablist"
        aria-label="Resume visitor role track"
        className="flex flex-wrap items-center gap-2"
      >
        {TRACK_OPTIONS.map((track) => {
          const active = persona === track.id
          return (
            <button
              key={track.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPersona(track.id)}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3.5 py-2 text-left transition cursor-pointer',
                active
                  ? 'border-[#E06D43] bg-[#E06D43] text-white shadow-sm'
                  : 'border-[#2C241E]/15 bg-white/75 text-[#1E1A17] hover:border-[#E06D43]/60 dark:border-[#E6DEC8]/15 dark:bg-white/[0.04] dark:text-[#F5EFE2]'
              )}
            >
              <span className="font-display text-xs font-extrabold">{track.label}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-mono text-[10px] font-bold',
                  active
                    ? 'bg-black/20 text-white'
                    : 'bg-[#2C241E]/10 text-[#4A3F37] dark:bg-white/10 dark:text-[#D5CFC2]'
                )}
              >
                {track.badge}
              </span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => setResumeTailorOpen(true)}
          className="ml-auto flex items-center gap-1.5 rounded-xl border border-[#0F766E]/40 bg-[#2DD4BF]/15 px-3.5 py-2 font-mono text-xs font-bold text-[#0F766E] transition hover:bg-[#2DD4BF]/25 dark:text-[#5EEAD4] cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI-Tailor to My Job Description
        </button>
      </div>

      {/* Interactive Part Navigator + Live Sheet */}
      {viewMode === 'pdf' ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#2C241E]/15 bg-white/75 px-4 py-2.5 dark:border-[#E6DEC8]/15 dark:bg-[#0D101B]">
            <span className="font-mono text-xs font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
              Live Rendered PDF: Mohamed-Datt-Resume-{persona}-2026.pdf
            </span>
            <a
              href={pdfInlineUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs font-bold text-[#B84A24] underline dark:text-[#F2A65A]"
            >
              Open Full-Screen PDF Tab ↗
            </a>
          </div>
          <iframe
            key={pdfInlineUrl}
            src={pdfInlineUrl}
            title={`Live PDF preview for ${resume.personaLabel}`}
            className="h-[680px] w-full rounded-2xl border border-[#2C241E]/20 bg-white shadow-inner"
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Rail: Part-by-Part Preview Selector */}
          <nav
            aria-label="Resume section preview selector"
            className="space-y-2 lg:col-span-4"
          >
            {PART_OPTIONS.map((part) => {
              const Icon = part.icon
              const selected = activePart === part.key
              return (
                <button
                  key={part.key}
                  type="button"
                  onClick={() => setActivePart(part.key)}
                  aria-current={selected ? 'true' : undefined}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition cursor-pointer',
                    selected
                      ? 'border-[#E06D43] bg-[#E06D43]/12 shadow-sm dark:bg-[#E06D43]/18'
                      : 'border-[#2C241E]/12 bg-white/70 hover:border-[#E06D43]/50 dark:border-[#E6DEC8]/10 dark:bg-white/[0.03]'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold',
                      selected
                        ? 'bg-[#E06D43] text-white'
                        : 'bg-[#2C241E]/10 text-[#3B312B] dark:bg-white/10 dark:text-[#E6DEC8]'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#B84A24] dark:text-[#F2A65A]">
                        {part.code}
                      </span>
                      <span className="font-display text-sm font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
                        {part.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-snug text-[#4A3F37] dark:text-[#C8C1B4]">
                      {part.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Right Panel: Crisp Printable ATS Paper Preview */}
          <div className="rounded-2xl border border-[#2C241E]/20 bg-white p-6 text-[#1E1A17] shadow-lg sm:p-8 lg:col-span-8">
            {/* Resume Header */}
            <header className="border-b-2 border-[#C85A32] pb-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-2xl font-extrabold text-[#141726]">
                  {resume.name}
                </h3>
                <span className="rounded-full bg-[#141726] px-3 py-0.5 font-mono text-[11px] font-bold text-[#F2A65A]">
                  {resume.personaLabel}
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-[#C85A32]">{resume.roleTitle}</p>
              <p className="mt-1.5 font-mono text-xs text-[#4B5563]">
                {resume.location} • {resume.email} • {resume.phone} • github.com/MeeksonJr
              </p>
            </header>

            <div className="mt-5 space-y-5">
              {/* Part 01: Executive Summary */}
              {showPart('summary') && (
                <div>
                  <h4 className="border-b border-gray-200 pb-1 font-mono text-xs font-extrabold uppercase tracking-wider text-[#141726]">
                    01 / Executive Summary
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-[#262626]">{resume.summary}</p>
                </div>
              )}

              {/* Part 02: Technical Stack */}
              {showPart('skills') && (
                <div>
                  <h4 className="border-b border-gray-200 pb-1 font-mono text-xs font-extrabold uppercase tracking-wider text-[#141726]">
                    02 / Technical Stack & Systems
                  </h4>
                  <div className="mt-2.5 space-y-2">
                    {resume.skillsGroups.map((grp) => (
                      <div key={grp.label} className="flex flex-col gap-1 sm:flex-row sm:items-baseline">
                        <span className="w-36 shrink-0 text-xs font-extrabold text-[#141726]">
                          {grp.label}:
                        </span>
                        <span className="text-sm text-[#374151]">{grp.items.join(' • ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Part 03: Experience & Research */}
              {showPart('experience') && (
                <div>
                  <h4 className="border-b border-gray-200 pb-1 font-mono text-xs font-extrabold uppercase tracking-wider text-[#141726]">
                    03 / Experience & R1 Research
                  </h4>
                  <div className="mt-3 space-y-3.5">
                    {resume.experience.map((exp) => (
                      <div key={exp.role}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h5 className="text-sm font-bold text-[#111827]">{exp.role}</h5>
                          <span className="font-mono text-xs font-semibold text-[#4B5563]">
                            {exp.period}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#0F766E]">{exp.company}</p>
                        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#374151]">
                          {exp.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Part 04: Selected Flagship Projects & Acquisitions */}
              {showPart('projects') && (
                <div>
                  <h4 className="border-b border-gray-200 pb-1 font-mono text-xs font-extrabold uppercase tracking-wider text-[#141726]">
                    04 / Selected Builds & Commercial Acquisitions
                  </h4>
                  <div className="mt-3 space-y-3">
                    {resume.projects.map((proj) => (
                      <div key={proj.name}>
                        <h5 className="text-sm font-bold text-[#111827]">{proj.name}</h5>
                        <p className="font-mono text-xs font-medium text-[#0F766E]">{proj.stack}</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#374151]">
                          {proj.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Part 05: Education & Honors */}
              {showPart('education') && (
                <div>
                  <h4 className="border-b border-gray-200 pb-1 font-mono text-xs font-extrabold uppercase tracking-wider text-[#141726]">
                    05 / Education & Honors
                  </h4>
                  <div className="mt-3 space-y-2.5">
                    {resume.education.map((edu) => (
                      <div key={edu.degree}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h5 className="text-sm font-bold text-[#111827]">
                            {edu.degree} — {edu.school}
                          </h5>
                          <span className="font-mono text-xs text-[#4B5563]">{edu.period}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-[#374151]">{edu.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
