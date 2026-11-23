'use client'

import {
  Mic,
  Download,
  GitBranch,
  Trophy,
  Sparkles,
  GraduationCap,
  Briefcase,
  Orbit,
  Box,
  ArrowRight,
} from 'lucide-react'
import EditableText from '@/components/studio/EditableText'
import SpotlightCard from '@/components/ui/SpotlightCard'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import { PERSONAL_PROFILE } from '@/lib/content/default-portfolio-data'
import { cn } from '@/lib/utils'

const STAT_ICONS = [GitBranch, Briefcase, Trophy, GraduationCap]

export default function HeroSection() {
  const {
    snapshot,
    persona,
    avatarMode,
    setAvatarMode,
    wireframe3D,
    setWireframe3D,
    setFreeLook3D,
    setVoiceDrawerOpen,
    setResumeTailorOpen,
    warpToPlanet,
  } = usePortfolioStore()

  return (
    <section id="section-hero" className="space-y-5">
      {/* Coordinate & Identity Strip */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-[#E06D43]/40 bg-[#E06D43]/15 px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E06D43] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E06D43]" />
          </span>
          <EditableText
            textKey="heroEyebrow"
            as="span"
            className="font-mono text-[10px] font-bold tracking-wider text-[#A94422] dark:text-[#F2A65A]"
          />
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#2C241E]/15 bg-white/40 px-2.5 py-1 dark:border-[#E6DEC8]/15 dark:bg-white/[0.04]">
          <img
            src={PERSONAL_PROFILE.avatarImage}
            alt="Mohamed Datt"
            className="h-5 w-5 rounded-full object-cover"
          />
          <span className="font-mono text-[10px] font-medium text-[#2C241E] dark:text-[#E6DEC8]">
            Norfolk, VA • EN / FR
          </span>
        </div>
      </div>

      {/* Headline & Subheadline */}
      <EditableText
        textKey="heroHeadline"
        as="h1"
        multiline
        className="font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-[#1E1A17] sm:text-4xl dark:text-[#F5EFE2]"
      />

      <EditableText
        textKey="heroSubheadline"
        as="p"
        multiline
        className="text-sm leading-relaxed text-[#3B312B] dark:text-[#D5CFC2]"
      />

      {/* Primary Action Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => setVoiceDrawerOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E06D43] via-[#D97736] to-[#C85A32] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#E06D43]/30 transition hover:brightness-110 cursor-pointer"
        >
          <Mic className="h-4 w-4" />
          <span>{snapshot.texts.heroPrimaryCta}</span>
        </button>

        <button
          type="button"
          onClick={() => setResumeTailorOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-[#2DD4BF]/45 bg-[#2DD4BF]/15 px-4 py-2.5 text-xs font-semibold text-[#0F766E] transition hover:bg-[#2DD4BF]/25 dark:text-[#5EEAD4] cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>{snapshot.texts.heroSecondaryCta}</span>
        </button>

        <a
          href={`/api/resume/pdf?persona=${persona}`}
          className="flex items-center gap-1.5 rounded-xl border border-[#2C241E]/15 bg-white/40 px-3.5 py-2.5 text-xs font-semibold text-[#1E1A17] transition hover:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-white/[0.04] dark:text-[#E6DEC8]"
        >
          <Download className="h-3.5 w-3.5 text-[#E06D43]" />
          <span>{persona === 'all' ? '2026 PDF' : `${persona.toUpperCase()} PDF`}</span>
        </a>
      </div>

      {/* 3D Planet Controls Strip */}
      <div className="rounded-2xl border border-[#2C241E]/10 bg-white/35 p-3 dark:border-[#E6DEC8]/10 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'companion', label: 'Monolith Rig' },
                { id: 'neural', label: 'Event Horizon' },
                { id: 'workstation', label: 'Mars Globe' },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setAvatarMode(preset.id)}
                className={cn(
                  'rounded-lg border px-2.5 py-1 font-mono text-[10px] font-semibold transition cursor-pointer',
                  avatarMode === preset.id
                    ? 'border-[#E06D43] bg-[#E06D43] text-white'
                    : 'border-[#2C241E]/15 bg-white/40 text-[#2C241E] dark:border-[#E6DEC8]/15 dark:bg-white/[0.04] dark:text-[#E6DEC8]'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFreeLook3D(true)}
              className="flex items-center gap-1 rounded-lg border border-[#2DD4BF]/40 bg-[#2DD4BF]/15 px-2.5 py-1 font-mono text-[10px] font-semibold text-[#0F766E] dark:text-[#5EEAD4] cursor-pointer"
            >
              <Orbit className="h-3 w-3" />
              Orbit
            </button>
            <button
              type="button"
              onClick={() => setWireframe3D(!wireframe3D)}
              className={cn(
                'flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-[10px] font-semibold cursor-pointer',
                wireframe3D
                  ? 'border-[#F2A65A] bg-[#F2A65A]/25 text-[#A94422] dark:text-[#F2A65A]'
                  : 'border-[#2C241E]/15 bg-white/40 text-[#2C241E] dark:border-[#E6DEC8]/15 dark:bg-white/[0.04] dark:text-[#E6DEC8]'
              )}
            >
              <Box className="h-3 w-3" />
              Mesh
            </button>
            <button
              type="button"
              onClick={() => warpToPlanet(1)}
              className="flex items-center gap-1 rounded-lg bg-[#1E1A17] px-2.5 py-1 font-mono text-[10px] font-bold text-[#F5EFE2] dark:bg-[#F2A65A] dark:text-[#181C2E] cursor-pointer"
            >
              Start Tour
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Telemetry Readout Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {PERSONAL_PROFILE.quickStats.map((stat, idx) => {
          const Icon = STAT_ICONS[idx % STAT_ICONS.length]
          return (
            <SpotlightCard key={stat.id} className="p-3">
              <div className="flex items-center justify-between">
                <Icon className="h-3.5 w-3.5 text-[#E06D43]" />
                <span className="font-mono text-[9px] text-[#5A4F46] dark:text-[#9CA3AF]">
                  0{idx + 1}
                </span>
              </div>
              <p className="mt-1.5 font-display text-lg font-extrabold text-[#1E1A17] dark:text-[#F5EFE2]">
                {stat.value}
              </p>
              <p className="text-[11px] font-bold text-[#3B312B] dark:text-[#E6DEC8]">
                {stat.label}
              </p>
            </SpotlightCard>
          )
        })}
      </div>
    </section>
  )
}
