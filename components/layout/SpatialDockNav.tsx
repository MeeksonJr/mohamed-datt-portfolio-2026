'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  Command,
  Sun,
  Moon,
  Music,
  Pause,
  Play,
  SkipForward,
  Orbit,
  Globe,
  Bot,
  Aperture,
  PlaneLanding,
  Lock,
  Unlock,
} from 'lucide-react'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import { PERSONAL_PROFILE } from '@/lib/content/default-portfolio-data'
import type { AvatarMode, PersonaId } from '@/lib/content/types'
import { cn } from '@/lib/utils'

const PERSONAS: Array<{ id: PersonaId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'recruiter', label: 'Recruiter' },
  { id: 'engineer', label: 'Engineer' },
  { id: 'research', label: 'ODU Lab' },
  { id: 'client', label: 'Client' },
]

const WORLD_MODES: Array<{ id: AvatarMode; label: string; icon: typeof Bot }> = [
  { id: 'companion', label: 'Monolith', icon: Bot },
  { id: 'neural', label: 'Horizon', icon: Aperture },
  { id: 'workstation', label: 'Mars Globe', icon: Globe },
]

export default function SpatialDockNav() {
  const {
    persona,
    setPersona,
    avatarMode,
    setAvatarMode,
    freeLook3D,
    setFreeLook3D,
    setCommandBarOpen,
    warpToPlanet,
    landOnEarth,
    isAdmin,
  } = usePortfolioStore()

  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTrack = PERSONAL_PROFILE.tracks[trackIndex]

  const toggleAudio = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      void audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const nextTrack = () => {
    const nextIdx = (trackIndex + 1) % PERSONAL_PROFILE.tracks.length
    setTrackIndex(nextIdx)
    if (audioRef.current) {
      audioRef.current.src = PERSONAL_PROFILE.tracks[nextIdx].src
      if (isPlaying) {
        void audioRef.current.play()
      }
    }
  }

  return (
    <header className="sticky top-3 z-40 mx-auto w-full max-w-7xl px-4 sm:px-6">
      <audio ref={audioRef} src={currentTrack.src} onEnded={nextTrack} preload="none" />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#2C241E]/15 bg-[#EFE8D8]/85 px-3 py-2 shadow-xl backdrop-blur-2xl dark:border-[#E6DEC8]/15 dark:bg-[#191D2F]/85">
        {/* Brand Emblem */}
        <button
          type="button"
          onClick={() => warpToPlanet(0)}
          className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 text-left transition hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
        >
          <img
            src="/logo.svg"
            alt="Mohamed Datt MD Emblem"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg shadow-sm"
          />
          <div className="hidden sm:block">
            <p className="font-display text-xs font-bold tracking-tight text-[#1E1A17] dark:text-[#F3EDE0]">
              Mohamed Datt
            </p>
            <p className="font-mono text-[10px] text-[#C85A32] dark:text-[#F2A65A]">
              INTERPLANETARY ’26–’27
            </p>
          </div>
        </button>

        {/* 3D World Mode Switcher */}
        <div className="hidden items-center gap-1 rounded-xl border border-[#2C241E]/10 bg-[#E4DBC8]/80 p-1 dark:border-[#E6DEC8]/10 dark:bg-[#121625]/75 lg:flex">
          {WORLD_MODES.map((wm) => {
            const Icon = wm.icon
            const active = avatarMode === wm.id
            return (
              <button
                key={wm.id}
                type="button"
                onClick={() => setAvatarMode(wm.id)}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-[10px] font-semibold transition cursor-pointer',
                  active
                    ? 'bg-[#E06D43] text-white shadow-sm'
                    : 'text-[#5A4F46] hover:text-[#1E1A17] dark:text-[#B8B2A6] dark:hover:text-[#F3EDE0]'
                )}
              >
                <Icon className="h-3 w-3" />
                <span>{wm.label}</span>
              </button>
            )
          })}
        </div>

        {/* Persona Dock */}
        <nav
          aria-label="Visitor Persona Switcher"
          className="hidden items-center gap-1 rounded-xl border border-[#2C241E]/10 bg-[#E4DBC8]/75 p-1 dark:border-[#E6DEC8]/10 dark:bg-[#121625]/70 md:flex"
        >
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPersona(p.id)}
              className={cn(
                'rounded-lg px-2 py-1 text-[11px] font-medium transition cursor-pointer',
                persona === p.id
                  ? 'bg-[#2DD4BF] text-[#111827] font-bold shadow-sm'
                  : 'text-[#5A4F46] hover:text-[#1E1A17] dark:text-[#B8B2A6] dark:hover:text-[#F3EDE0]'
              )}
            >
              {p.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Land Back on Terrestrial Home Button */}
          <button
            type="button"
            onClick={landOnEarth}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#0D9488] px-3 py-1.5 text-[11px] font-bold text-[#0F172A] shadow-md transition hover:brightness-110 cursor-pointer"
            title="Descend back to Terrestrial Home"
          >
            <PlaneLanding className="h-3.5 w-3.5" />
            <span>Land on Earth</span>
          </button>

          {/* 3D Free-Look Orbit Toggle */}
          <button
            type="button"
            onClick={() => setFreeLook3D(!freeLook3D)}
            className={cn(
              'flex items-center gap-1 rounded-xl border px-2.5 py-1.5 font-mono text-[11px] font-semibold transition cursor-pointer',
              freeLook3D
                ? 'border-[#E06D43] bg-[#E06D43] text-white'
                : 'border-[#2C241E]/15 bg-[#E4DBC8]/80 text-[#2C241E] hover:border-[#E06D43]/60 dark:border-[#E6DEC8]/15 dark:bg-white/[0.05] dark:text-[#E6DEC8]'
            )}
            title="Hide HUD & Orbit 3D Universe"
          >
            <Orbit className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">3D Orbit</span>
          </button>

          {/* Audio Mini-Player */}
          <div className="hidden items-center gap-1 rounded-xl border border-[#2C241E]/15 bg-[#E4DBC8]/80 px-2 py-1 dark:border-[#E6DEC8]/15 dark:bg-white/[0.05] 2xl:flex">
            <Music className={cn('h-3.5 w-3.5 text-[#E06D43]', isPlaying && 'animate-pulse')} />
            <span className="max-w-[78px] truncate font-mono text-[10px] text-[#2C241E] dark:text-[#E6DEC8]">
              {currentTrack.title}
            </span>
            <button
              type="button"
              onClick={toggleAudio}
              className="rounded p-1 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
            <button
              type="button"
              onClick={nextTrack}
              className="rounded p-1 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              aria-label="Next track"
            >
              <SkipForward className="h-3 w-3" />
            </button>
          </div>

          {/* Cmd+K AI Command */}
          <button
            type="button"
            onClick={() => setCommandBarOpen(true)}
            className="flex items-center gap-1 rounded-xl border border-[#2C241E]/15 bg-[#E4DBC8]/80 px-2.5 py-1.5 text-xs font-medium text-[#1E1A17] transition hover:border-[#2DD4BF]/60 dark:border-[#E6DEC8]/15 dark:bg-white/[0.05] dark:text-[#E6DEC8] cursor-pointer"
            title="AI Command Bar (Cmd+K)"
          >
            <Command className="h-3.5 w-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
          </button>

          {/* Atmosphere Switcher */}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="rounded-xl border border-[#2C241E]/15 bg-[#E4DBC8]/80 p-1.5 text-[#1E1A17] transition hover:border-[#E06D43]/60 dark:border-[#E6DEC8]/15 dark:bg-white/[0.05] dark:text-[#F2A65A] cursor-pointer"
              aria-label="Switch atmosphere"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-[#F2A65A]" />
              ) : (
                <Moon className="h-4 w-4 text-[#2C241E]" />
              )}
            </button>
          )}

          {/* Discreet Admin Vault Link */}
          <Link
            href="/admin"
            className="rounded-xl border border-[#2C241E]/15 bg-[#E4DBC8]/80 p-1.5 text-[#5A4F46] transition hover:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-white/[0.05] dark:text-[#B8B2A6]"
            title="Admin Command Vault"
            aria-label="Admin Command Vault"
          >
            {isAdmin ? <Unlock className="h-4 w-4 text-[#2DD4BF]" /> : <Lock className="h-4 w-4" />}
          </Link>
        </div>
      </div>
    </header>
  )
}
