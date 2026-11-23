'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Rocket,
  Download,
  Sparkles,
  Mic,
  Github,
  Linkedin,
  Mail,
  Lock,
  ArrowUpRight,
  Cpu,
  Layers,
  X,
  Trophy,
  ChevronRight,
  CheckCircle2,
  Copy,
  Check,
  FileText,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import FloatingIslandNav from '@/components/layout/FloatingIslandNav'
import EditorialPortraitStudio from '@/components/home/EditorialPortraitStudio'
import InteractiveResumePreviewSection from '@/components/resume/InteractiveResumePreviewSection'
import ResearchLabSection from '@/components/sections/ResearchLabSection'
import SkillsAndGitHubSection from '@/components/sections/SkillsAndGitHubSection'
import ServicesEstimatorSection from '@/components/sections/ServicesEstimatorSection'
import TestimonialsGuestbookSection from '@/components/sections/TestimonialsGuestbookSection'
import ContactSection from '@/components/sections/ContactSection'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import { DEFAULT_TEXTS, PERSONAL_PROFILE } from '@/lib/content/default-portfolio-data'
import type { ProjectItem } from '@/lib/content/types'
import { cn } from '@/lib/utils'

const EDITORIAL_INDEX = [
  { href: '#top', label: '01 / HERO & ANGLES', active: true },
  { href: '#section-story', label: '02 / ORIGIN TRIPTYCH' },
  { href: '#section-projects', label: '03 / SELECTED WORKS' },
  { href: '#section-resume', label: '04 / RESUME PREVIEW' },
  { href: '#section-research', label: '05 / ODU R1 EDGE LAB' },
  { href: '#section-skills', label: '06 / STACK & GITHUB' },
  { href: '#section-services', label: '07 / STUDIO & STRIPE' },
  { href: '#section-testimonials', label: '08 / AWARDS & WALL' },
  { href: '#section-contact', label: '09 / DIRECT SIGNAL' },
]

const CATEGORIES = ['All', 'AI & SaaS', 'ODU Research', 'Mobile & Systems', 'Sold & Client']

const AWARDS_TABLE = [
  {
    code: 'AWD-01',
    title: '1st Place / 13 Teams — Product Manager Accelerator',
    context: 'Full-stack AI & engineering lead on EduSphere AI',
    year: '2024',
  },
  {
    code: 'ACQ-02',
    title: 'Commercial SaaS Acquisition — InterviewPrep AI',
    context: 'Voice mock interview SaaS bought by private client',
    year: '2025',
  },
  {
    code: 'ACA-03',
    title: '3.8 GPA & Dean’s List — Tidewater CC -> ODU CS',
    context: 'B.S. Computer Science Honors Trajectory',
    year: '2024–2026',
  },
  {
    code: 'RES-04',
    title: 'ODU Hands-On Lab & Brock Health Edge-AI Lead',
    context: '10 Federal Grant Proposals (NeuroShield-ADRD, VocalPulse)',
    year: '2026–2027',
  },
]

const TICKER_ITEMS = [
  '1ST PLACE / 13 ENGINEERING TEAMS',
  '2 COMMERCIAL SAAS ACQUISITIONS',
  '3.8 GPA ODU COMPUTER SCIENCE',
  '50+ POLYGLOT GITHUB REPOS',
  'NIH & NSF CLINICAL EDGE-AI LAB',
  'LIVE STRIPE CHECKOUT STUDIO',
  'RESUMEFORGE DYNAMIC PDF',
]

export default function TerrestrialHome() {
  const {
    snapshot,
    persona,
    projectFilter,
    setProjectFilter,
    launchToSpace,
    setVoiceDrawerOpen,
    setResumeTailorOpen,
  } = usePortfolioStore()

  const [selectedChapter, setSelectedChapter] = useState(snapshot.milestones.length - 1)
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null)
  const [copiedEmail, setCopiedEmail] = useState(false)

  useEffect(() => {
    if (!activeProject) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveProject(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeProject])

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PERSONAL_PROFILE.email)
      setCopiedEmail(true)
      toast.success(`Copied email: ${PERSONAL_PROFILE.email}`)
      setTimeout(() => setCopiedEmail(false), 2500)
    } catch {
      toast.error('Unable to copy email to clipboard')
    }
  }

  const dynamicPdfUrl = `/api/resume/pdf?persona=${persona}`
  const hasCustomHeadline = snapshot.texts.heroHeadline !== DEFAULT_TEXTS.heroHeadline

  const filteredProjects =
    projectFilter === 'All'
      ? snapshot.projects
      : snapshot.projects.filter((p) => p.category === projectFilter)

  const currentMilestone = snapshot.milestones[selectedChapter] || snapshot.milestones[0]
  const isSectionVisible = (key: string) =>
    snapshot.sections.find((s) => s.sectionKey === key)?.visible !== false

  return (
    <div
      id="top"
      className="observatory-grid relative min-h-screen overflow-x-clip bg-[#EAE2D0] pb-24 text-[#1E1A17] transition-colors duration-500 dark:bg-[#0E111B] dark:text-[#F5EFE2]"
    >
      <FloatingIslandNav />

      {/* SECTION 01: NOIRBYTE x NEXA WEAR x SYNCROWS EDITORIAL HERO */}
      <section className="relative w-full max-w-none px-4 pb-12 pt-6 sm:px-6 lg:px-10 lg:pt-8 2xl:px-14">
        {/* Giant Edge-to-Edge Background Watermark Display Type (NEXA WEAR Influence) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none overflow-hidden text-center"
        >
          <p className="whitespace-nowrap font-display text-[13vw] font-extrabold uppercase leading-none tracking-tighter text-[#1E1A17]/[0.045] dark:text-[#F5EFE2]/[0.045]">
            MOHAMED DATT
          </p>
        </div>

        <div className="relative grid items-center gap-8 lg:grid-cols-12">
          {/* Left Editorial Typography Stack */}
          <div className="min-w-0 space-y-5 lg:col-span-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#2C241E]/15 bg-white/75 px-4 py-1.5 backdrop-blur-md dark:border-[#E6DEC8]/15 dark:bg-white/[0.06]">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#3B312B] dark:text-[#E6DEC8]">
                  {snapshot.texts.heroEyebrow}
                </span>
              </div>

              {/* Recruiter 6-Second Clarity Role Bar */}
              <p className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#B84A24] dark:text-[#F2A65A]">
                FULL-STACK AI &amp; SOFTWARE ENGINEER • NEXT.JS 16 / TYPESCRIPT / PYTHON / C++ • B.S. CS @ ODU (3.8 GPA)
              </p>
            </div>

            {hasCustomHeadline ? (
              <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-[#1E1A17] sm:text-5xl dark:text-[#F5EFE2]">
                {snapshot.texts.heroHeadline}
              </h1>
            ) : (
              <h1 className="font-display text-[2.1rem] font-extrabold uppercase leading-[0.96] tracking-[-0.03em] text-[#1E1A17] sm:text-[2.65rem] xl:text-[3.05rem] 2xl:text-[3.6rem] dark:text-[#F5EFE2]">
                <span className="block">WHERE CREATIVE</span>
                <span className="block">ENGINEERING</span>
                <span className="flex flex-wrap items-center gap-2.5">
                  <span>MEETS</span>
                  {/* Sculptural 3D Metallic Asterisk Accent (NOIRBYTE Influence) */}
                  <span
                    aria-hidden="true"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E06D43]/40 bg-gradient-to-br from-[#F2A65A] via-[#E06D43] to-[#7A2E14] text-white shadow-lg shadow-[#E06D43]/30 animate-spin-slow sm:h-11 sm:w-11"
                  >
                    <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current">
                      <path d="M14.2 3h3.6v9.4l8.1-4.7 1.8 3.1-8.1 4.7 8.1 4.7-1.8 3.1-8.1-4.7V28h-3.6v-9.4l-8.1 4.7-1.8-3.1 8.1-4.7-8.1-4.7 1.8-3.1 8.1 4.7V3z" />
                    </svg>
                  </span>
                </span>
                <span className="mt-1 flex flex-wrap items-baseline gap-2.5">
                  <span className="font-serif text-[1.15em] font-normal italic lowercase text-[#E06D43] dark:text-[#F2A65A]">
                    real-world
                  </span>
                  <span>RESULT.</span>
                </span>
              </h1>
            )}

            <p className="max-w-xl text-base leading-relaxed text-[#3B312B] sm:text-lg dark:text-[#C8C1B4]">
              {snapshot.texts.heroSubheadline}
            </p>

            {/* Primary CTA Cluster */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="#section-resume"
                className="flex items-center gap-2 rounded-full bg-[#141726] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#E06D43] dark:bg-[#F5EFE2] dark:text-[#111827] dark:hover:bg-[#E06D43] dark:hover:text-white"
              >
                <FileText className="h-4 w-4 text-[#E06D43] dark:text-[#B84A24]" />
                <span>Inspect Live Resume</span>
              </a>

              <button
                type="button"
                onClick={launchToSpace}
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E06D43] via-[#D97736] to-[#B84A24] px-5 py-3 text-sm font-bold text-white shadow-xl shadow-[#E06D43]/30 transition hover:scale-[1.02] hover:brightness-110 cursor-pointer"
              >
                <Rocket className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                <span>Launch 3D Space</span>
              </button>

              <button
                type="button"
                onClick={() => void handleCopyEmail()}
                className="flex items-center gap-1.5 rounded-full border border-[#2C241E]/20 bg-white/75 px-4 py-3 font-mono text-xs font-bold text-[#1E1A17] transition hover:border-[#E06D43] dark:border-[#E6DEC8]/20 dark:bg-white/[0.06] dark:text-[#F5EFE2] cursor-pointer"
              >
                {copiedEmail ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#E06D43]" />
                )}
                {copiedEmail ? 'Email Copied!' : PERSONAL_PROFILE.email}
              </button>

              <a
                href={dynamicPdfUrl}
                className="flex items-center gap-1.5 rounded-full border border-[#2C241E]/15 bg-white/60 px-4 py-3 font-mono text-xs font-bold text-[#1E1A17] transition hover:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-white/[0.05] dark:text-[#F5EFE2]"
              >
                <Download className="h-3.5 w-3.5 text-[#E06D43]" />
                {persona === 'all' ? '2026 PDF' : `${persona.toUpperCase()} PDF`}
              </a>

              <button
                type="button"
                onClick={() => setResumeTailorOpen(true)}
                className="group flex items-center gap-1.5 rounded-full border border-[#0F766E]/35 bg-[#2DD4BF]/15 px-4 py-3 text-xs font-bold text-[#0F766E] transition hover:bg-[#2DD4BF]/25 dark:text-[#5EEAD4] cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Job Tailor</span>
              </button>

              <button
                type="button"
                onClick={() => setVoiceDrawerOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-[#2C241E]/15 bg-white/60 px-4 py-3 font-mono text-xs font-bold text-[#1E1A17] transition hover:border-[#2DD4BF] dark:border-[#E6DEC8]/15 dark:bg-white/[0.05] dark:text-[#F5EFE2] cursor-pointer"
              >
                <Mic className="h-3.5 w-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
                Voice AI
              </button>
            </div>

            {/* Bottom-Left Corner-Bracketed Architectural Card + Burnt Orange Accent (NOIRBYTE Influence) */}
            <div className="grid gap-4 pt-4 sm:grid-cols-12">
              <div className="corner-bracket-card border border-[#2C241E]/15 bg-white/55 p-4 backdrop-blur-md sm:col-span-6 dark:border-[#E6DEC8]/15 dark:bg-[#16192B]/85">
                <div className="flex items-center justify-between font-mono text-[10px] font-bold text-[#E06D43]">
                  <span>SCALABLE SYSTEMS</span>
                  <span>[01]</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#3B312B] dark:text-[#D5CFC2]">
                  From multi-tenant Next.js SaaS with live Stripe billing to real-time 10Hz biomedical telemetry at ODU Hands-On Lab.
                </p>
                <a
                  href="#section-projects"
                  className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#1E1A17] underline decoration-[#E06D43] underline-offset-4 dark:text-[#F5EFE2]"
                >
                  SEE PROJECTS <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-[#E06D43]/40 bg-gradient-to-br from-[#E06D43]/18 via-[#E06D43]/10 to-transparent p-4 sm:col-span-6">
                <p className="font-mono text-xs font-extrabold uppercase tracking-wide text-[#B84A24] dark:text-[#F2A65A]">
                  FULL-STACK & EDGE AI ARCHITECT
                </p>
                <p className="mt-1.5 text-xs text-[#3B312B] dark:text-[#D5CFC2]">
                  Next.js 16 • Three.js WebGL • Gemini Multimodal • Drizzle Postgres • Flutter
                </p>
              </div>
            </div>
          </div>

          {/* Center Column: Interactive Multi-Angle Portrait Studio */}
          <div className="lg:col-span-4">
            <EditorialPortraitStudio />
          </div>

          {/* Right Vertical Editorial Index Rail (NOIRBYTE Exact Detail) */}
          <aside className="hidden flex-col items-end justify-between space-y-8 lg:col-span-2 lg:flex">
            <div className="space-y-2.5 text-right">
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#E06D43]">
                SYSTEM INDEX
              </p>
              <nav aria-label="Editorial section index" className="flex flex-col space-y-2">
                {EDITORIAL_INDEX.map((item, idx) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'font-mono text-[10px] tracking-wider transition hover:text-[#E06D43]',
                      idx === 0
                        ? 'font-bold text-[#1E1A17] underline decoration-[#E06D43] underline-offset-4 dark:text-white'
                        : 'text-[#5A4F46] dark:text-[#9CA3AF]'
                    )}
                  >
                    {idx === 0 ? `▸ ${item.label}` : item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="rounded-2xl border border-[#2C241E]/15 bg-white/50 p-3.5 text-right dark:border-[#E6DEC8]/15 dark:bg-white/[0.04]">
              <p className="font-mono text-[9px] uppercase tracking-wider text-[#0F766E] dark:text-[#2DD4BF]">
                ORIGIN COORDINATES
              </p>
              <p className="mt-1 font-display text-xs font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
                Guinea → NYC → Norfolk
              </p>
              <p className="font-mono text-[10px] text-[#5A4F46] dark:text-[#A39E93]">
                B.S. CS @ ODU • 3.8 GPA
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* EDGE-TO-EDGE TICKER TAPE (NEXA WEAR Proof Strip) */}
      <div className="overflow-hidden border-y border-[#2C241E]/15 bg-[#141726] py-3.5 text-[#F5EFE2] dark:border-[#E6DEC8]/15">
        <div className="animate-marquee-x items-center gap-10">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="flex shrink-0 items-center gap-4 font-mono text-xs font-bold tracking-widest text-[#E6DEC8]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#E06D43]" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* MAIN EDITORIAL CHAPTERS */}
      <main id="main-content" className="w-full max-w-none space-y-24 px-4 pt-20 sm:px-6 lg:px-10 2xl:px-14">
        {/* SECTION 02: STICKY PERSONAL ID CARD (Rayen) + BEHIND THE ARCHITECTURE TRIPTYCH (Folioblox) */}
        {isSectionVisible('story') && (
        <section id="section-story" className="grid items-start gap-8 lg:grid-cols-12">
          {/* Left Sticky Personal ID Card */}
          <div className="lg:sticky lg:top-24 lg:col-span-4">
            <div className="rounded-[2rem] border border-[#2C241E]/20 bg-[#141726] p-6 text-[#F5EFE2] shadow-2xl dark:border-[#E6DEC8]/15">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F2A65A]">
                  CREATOR ID // 02
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Working on 2 AI Builds
                </span>
              </div>

              <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-[#1B2034]">
                <img
                  src={PERSONAL_PROFILE.avatarImage}
                  alt="Mohamed Datt Portrait"
                  className="h-full w-full object-cover object-top"
                />
                {/* Handwritten Signature Overlay (Rayen Influence) */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0D101B]/95 via-[#0D101B]/40 to-transparent p-4">
                  <p className="font-serif text-3xl italic tracking-wide text-white drop-shadow">
                    Mohamed Datt
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleCopyEmail()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 font-mono text-xs text-[#E6DEC8] transition hover:border-[#E06D43] cursor-pointer"
                >
                  {copiedEmail ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-[#F2A65A]" />}
                  {PERSONAL_PROFILE.email}
                </button>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2">
                <a
                  href={PERSONAL_PROFILE.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white hover:border-[#E06D43] hover:text-[#F2A65A]"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href={PERSONAL_PROFILE.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white hover:border-[#E06D43] hover:text-[#F2A65A]"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href={`mailto:${PERSONAL_PROFILE.email}`}
                  aria-label="Email"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white hover:border-[#E06D43] hover:text-[#F2A65A]"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>

              {/* Quick Telemetry Metrics */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                {PERSONAL_PROFILE.quickStats.map((stat) => (
                  <div
                    key={stat.id}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5"
                  >
                    <p className="font-display text-lg font-extrabold text-white">{stat.value}</p>
                    <p className="text-[10px] font-semibold text-[#F2A65A]">{stat.label}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={launchToSpace}
                className="mt-5 flex w-full items-center justify-between rounded-full bg-white/10 pl-4 pr-1.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#E06D43] cursor-pointer"
              >
                <span>Board 3D Space Ship</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#141726]">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </button>
            </div>
          </div>

          {/* Right Origin Narrative & 3-Photo Triptych */}
          <div className="space-y-8 lg:col-span-8">
            <div className="space-y-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#C85A32] dark:text-[#F2A65A]">
                02 / BEHIND THE ARCHITECTURE — {PERSONAL_PROFILE.origin.toUpperCase()}
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#1E1A17] sm:text-5xl dark:text-[#F5EFE2]">
                {snapshot.texts.aboutTitle}{' '}
                <span className="font-serif font-normal italic text-[#E06D43] dark:text-[#F2A65A]">
                  at scale.
                </span>
              </h2>
              <p className="text-base leading-relaxed text-[#3B312B] dark:text-[#D5CFC2]">
                {snapshot.texts.aboutBio}
              </p>
            </div>

            {/* 3-Photo Horizontal Triptych (Folioblox Influence) */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  src: '/images/Photo.jpg',
                  tag: 'CHAPTER 01',
                  title: 'Norfolk & Studio Craft',
                  grade: 'portrait-cyber',
                },
                {
                  src: '/images/standing-shot.jpg',
                  tag: 'CHAPTER 02',
                  title: 'ODU Campus Field',
                  grade: 'portrait-amber',
                },
                {
                  src: '/images/sitting-shot.jpg',
                  tag: 'CHAPTER 03',
                  title: 'Late-Night Systems Lab',
                  grade: 'portrait-noir',
                },
              ].map((card) => (
                <div
                  key={card.tag}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#2C241E]/15 bg-[#141726] dark:border-[#E6DEC8]/15"
                >
                  <img
                    src={card.src}
                    alt={card.title}
                    className={cn(
                      'h-full w-full object-cover object-top transition duration-700 group-hover:scale-105',
                      card.grade
                    )}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3.5 text-white">
                    <span className="font-mono text-[9px] font-bold text-[#F2A65A]">
                      {card.tag}
                    </span>
                    <p className="font-display text-sm font-bold">{card.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Active Chapter Highlight & 6-Step Selector */}
            <div className="corner-bracket-card rounded-2xl border border-[#2C241E]/15 bg-white/65 p-5 dark:border-[#E6DEC8]/15 dark:bg-[#16192B]/80">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
                  {currentMilestone.title}
                </h3>
                <span className="rounded-full bg-[#E06D43]/15 px-3 py-0.5 font-mono text-[10px] font-bold text-[#B84A24] dark:text-[#F2A65A]">
                  {currentMilestone.year} • {currentMilestone.location}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#3B312B] dark:text-[#D5CFC2]">
                {currentMilestone.summary}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#2DD4BF]/15 px-3 py-1 font-mono text-[10px] font-bold text-[#0F766E] dark:text-[#5EEAD4]">
                <ChevronRight className="h-3.5 w-3.5" />
                {currentMilestone.highlight}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {snapshot.milestones.map((ms, idx) => (
                  <button
                    key={ms.id}
                    type="button"
                    onClick={() => setSelectedChapter(idx)}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-left transition cursor-pointer',
                      selectedChapter === idx
                        ? 'border-[#E06D43] bg-[#E06D43]/15 text-[#1E1A17] dark:text-white'
                        : 'border-[#2C241E]/10 bg-white/40 text-[#5A4F46] hover:border-[#E06D43]/50 dark:border-[#E6DEC8]/10 dark:bg-white/[0.03] dark:text-[#A39E93]'
                    )}
                  >
                    <span className="font-mono text-[9px] font-bold text-[#E06D43]">{ms.year}</span>
                    <p className="truncate font-display text-xs font-bold">{ms.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* SECTION 03: SELECTED WORK // PROJECTS (Folioblox + SyncRows Showcase) */}
        {isSectionVisible('projects') && (
        <section id="section-projects" className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2C241E]/15 pb-6 dark:border-[#E6DEC8]/15">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#C85A32] dark:text-[#F2A65A]">
                03 / DEPLOYED MISSIONS & COMMERCIAL ACQUISITIONS
              </span>
              <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-[#1E1A17] sm:text-5xl dark:text-[#F5EFE2]">
                Selected Work{' '}
                <span className="font-serif font-normal italic text-[#E06D43] dark:text-[#F2A65A]">
                  / Projects ({filteredProjects.length})
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setProjectFilter(cat)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-bold transition cursor-pointer',
                    projectFilter === cat
                      ? 'border-[#E06D43] bg-[#E06D43] text-white'
                      : 'border-[#2C241E]/15 bg-white/60 text-[#2C241E] hover:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-white/[0.04] dark:text-[#E6DEC8]'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {filteredProjects.map((project, idx) => (
              <article
                key={project.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#2C241E]/15 bg-white/70 p-6 transition hover:-translate-y-1 hover:border-[#E06D43]/60 hover:shadow-2xl dark:border-[#E6DEC8]/15 dark:bg-[#141828]/85"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-[#E06D43]">
                      [0{idx + 1}] // {project.category.toUpperCase()}
                    </span>
                    <span className="rounded-full border border-[#E06D43]/35 bg-[#E06D43]/12 px-3 py-0.5 font-mono text-[10px] font-bold text-[#B84A24] dark:text-[#F2A65A]">
                      {project.saleBadge || project.status.toUpperCase()}
                    </span>
                  </div>

                  {project.imageUrl ? (
                    <div className="relative h-52 overflow-hidden rounded-2xl border border-[#2C241E]/15 bg-[#0E101A]">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-[#1B2034] via-[#241B29] to-[#111524] p-5 text-[#F5EFE2]">
                      <Cpu className="h-6 w-6 text-[#E06D43]" />
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-[#2DD4BF]">
                          {project.techStack.slice(0, 3).join(' • ')}
                        </p>
                        <p className="mt-1 font-serif text-xl italic text-[#F5EFE2]">
                          {project.tagline}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-display text-xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#F5EFE2]">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#3B312B] dark:text-[#D5CFC2]">
                      {project.description}
                    </p>
                  </div>

                  <div className="space-y-1">
                    {project.metrics.map((metric) => (
                      <div
                        key={metric}
                        className="flex items-center gap-2 text-xs text-[#3B312B] dark:text-[#D5CFC2]"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0F766E] dark:text-[#2DD4BF]" />
                        <span>{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#2C241E]/10 pt-4 dark:border-[#E6DEC8]/10">
                  <button
                    type="button"
                    onClick={() => setActiveProject(project)}
                    className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#0F766E] hover:underline dark:text-[#2DD4BF] cursor-pointer"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Architecture Teardown
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-full border border-[#2C241E]/15 px-3 py-1.5 font-mono text-[11px] font-bold hover:border-[#E06D43] dark:border-[#E6DEC8]/15"
                    >
                      <Github className="h-3.5 w-3.5" />
                      Code
                    </a>
                    {(project.liveUrl || project.githubUrl) && (
                      <a
                        href={project.liveUrl || project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${project.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E06D43] text-white transition hover:scale-105 hover:brightness-110"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        )}

        {/* SECTION 03.5: MULTI-TRACK & PER-PART INTERACTIVE RESUME PREVIEW HUB */}
        <InteractiveResumePreviewSection />

        {/* SECTION 04: ODU R1 EDGE-AI OBSERVATORY */}
        {isSectionVisible('research') && (
        <div className="rounded-[2rem] border border-[#2C241E]/15 bg-[#EFE8D8]/70 p-6 sm:p-8 dark:border-[#E6DEC8]/15 dark:bg-[#141726]/85">
          <ResearchLabSection />
        </div>
        )}

        {/* SECTION 05: SKILLS & OPEN-SOURCE MATRIX */}
        {isSectionVisible('skills') && <SkillsAndGitHubSection />}

        {/* SECTION 06: SIMPLE PACKAGES & LIVE STRIPE STUDIO */}
        {isSectionVisible('services') && <ServicesEstimatorSection />}

        {/* SECTION 07: PROUD MOMENTS, SHARED SUCCESS AWARDS TABLE + GUESTBOOK (Folioblox Influence) */}
        {isSectionVisible('testimonials') && (
        <section className="space-y-8">
          <div className="rounded-3xl border border-[#2C241E]/15 bg-[#141726] p-6 text-[#F5EFE2] sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-5">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F2A65A]">
                  MILESTONES // RECOGNITION
                </span>
                <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-4xl">
                  Proud Moments,{' '}
                  <span className="font-serif font-normal italic text-[#F2A65A]">
                    Shared Success.
                  </span>
                </h2>
              </div>
              <Trophy className="h-6 w-6 text-[#E06D43]" />
            </div>

            <div className="divide-y divide-white/10">
              {AWARDS_TABLE.map((row) => (
                <div
                  key={row.code}
                  className="grid items-center gap-2 py-4 sm:grid-cols-12"
                >
                  <span className="font-mono text-xs font-bold text-[#E06D43] sm:col-span-2">
                    {row.code}
                  </span>
                  <div className="sm:col-span-8">
                    <p className="font-display text-sm font-bold text-white">{row.title}</p>
                    <p className="text-xs text-[#A39E93]">{row.context}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#2DD4BF] sm:col-span-2 sm:text-right">
                    {row.year}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <TestimonialsGuestbookSection />
        </section>
        )}

        {/* SECTION 08: SYNCROWS FINALE CONTACT + 3D ROCKET LAUNCHPAD BANNER */}
        {isSectionVisible('contact') && (
        <section className="space-y-10">
          <div className="rounded-[2rem] border border-[#E06D43]/40 bg-gradient-to-br from-[#181C2E] via-[#221A24] to-[#2C1B18] p-8 text-white shadow-2xl sm:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-8">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#F2A65A]">
                  DUAL-UNIVERSE EXPERIENCE // READY FOR LIFTOFF
                </span>
                <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
                  Explore All 8 Planets Inside the{' '}
                  <span className="font-serif font-normal italic text-[#F2A65A]">
                    3D Space Odyssey.
                  </span>
                </h2>
                <p className="max-w-2xl text-sm text-[#D5CFC2]">
                  Board the Three.js Rocketship for a full orbital launch transition into the interactive 8-planet solar system—or land back on Earth anytime.
                </p>
              </div>
              <div className="flex lg:col-span-4 lg:justify-end">
                <button
                  type="button"
                  onClick={launchToSpace}
                  className="flex items-center gap-3 rounded-full bg-gradient-to-r from-[#E06D43] to-[#D97736] px-7 py-4 text-sm font-extrabold text-white shadow-2xl shadow-[#E06D43]/40 transition hover:scale-105 cursor-pointer"
                >
                  <Rocket className="h-5 w-5" />
                  <span>Ignite 3D Rocketship</span>
                </button>
              </div>
            </div>
          </div>

          <ContactSection />
        </section>
        )}
      </main>

      {/* EDITORIAL FOOTER */}
      <footer className="mt-20 border-t border-[#2C241E]/15 bg-[#E2D8C4]/80 py-12 backdrop-blur-xl dark:border-[#E6DEC8]/10 dark:bg-[#111422]/90">
        <div className="flex w-full max-w-none flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-10 2xl:px-14">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="MD" className="h-10 w-10 rounded-xl" />
            <div>
              <p className="font-display text-sm font-extrabold text-[#1E1A17] dark:text-[#F5EFE2]">
                Mohamed Datt ({PERSONAL_PROFILE.handle})
              </p>
              <p className="font-mono text-[11px] text-[#5A4F46] dark:text-[#A39E93]">
                2026–2027 Portfolio • Next.js 16 • Three.js • Drizzle • Live Stripe • Gemini AI
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={PERSONAL_PROFILE.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-[#2C241E]/15 p-2 text-[#1E1A17] hover:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:text-[#E6DEC8]"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href={PERSONAL_PROFILE.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-[#2C241E]/15 p-2 text-[#1E1A17] hover:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:text-[#E6DEC8]"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${PERSONAL_PROFILE.email}`}
              className="rounded-xl border border-[#2C241E]/15 p-2 text-[#1E1A17] hover:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:text-[#E6DEC8]"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
            <Link
              href="/admin"
              className="flex items-center gap-1 rounded-xl border border-[#2C241E]/15 px-3 py-2 font-mono text-[11px] font-semibold text-[#5A4F46] hover:border-[#E06D43] hover:text-[#E06D43] dark:border-[#E6DEC8]/15 dark:text-[#B8B2A6]"
            >
              <Lock className="h-3 w-3" />
              Admin
            </Link>
          </div>
        </div>
      </footer>

      {/* WILL WALTERS STUDIO INSPIRED FLOATING BOTTOM GLASS DOCK */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[#E6DEC8]/20 bg-[#141726]/90 p-1.5 text-[11px] font-mono font-bold text-[#D5CFC2] shadow-2xl backdrop-blur-2xl">
          <a href="#top" className="rounded-full bg-white px-3 py-1.5 text-[#141726]">
            HOME
          </a>
          <a href="#section-projects" className="rounded-full px-3 py-1.5 hover:text-white">
            WORKS
          </a>
          <a href="#section-services" className="rounded-full px-3 py-1.5 hover:text-white">
            STUDIO
          </a>
          <a href="#section-resume" className="hidden rounded-full px-3 py-1.5 text-[#5EEAD4] hover:bg-white/10 sm:inline">
            RESUME
          </a>
          <button
            type="button"
            onClick={launchToSpace}
            className="flex items-center gap-1 rounded-full bg-[#E06D43] px-3.5 py-1.5 text-white transition hover:brightness-110 cursor-pointer"
          >
            <Rocket className="h-3 w-3" />
            <span>3D SPACE</span>
          </button>
        </div>
      </div>

      {/* Project Architecture Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveProject(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D101B]/80 p-4 backdrop-blur-md"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl border border-[#E6DEC8]/20 bg-[#16192B] p-6 text-[#F5EFE2] shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#F2A65A]">
                    Architecture Teardown
                  </span>
                  <h3 id="project-modal-title" className="font-display text-2xl font-bold">
                    {activeProject.title}
                  </h3>
                </div>
                <button
                  type="button"
                  aria-label="Close architecture teardown modal"
                  onClick={() => setActiveProject(null)}
                  className="rounded-full border border-[#E6DEC8]/15 p-1.5 text-[#B8B2A6] hover:bg-white/10 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#D5CFC2]">
                {activeProject.architectureNotes}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {activeProject.techStack.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[#2DD4BF]/35 bg-[#2DD4BF]/15 px-3 py-1 font-mono text-[11px] text-[#5EEAD4]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
