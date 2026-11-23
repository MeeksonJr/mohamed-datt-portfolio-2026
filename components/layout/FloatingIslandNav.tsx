'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Command, Lock, Moon, Rocket, Sun, Unlock } from 'lucide-react'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import type { PersonaId } from '@/lib/content/types'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '#section-story', label: 'Origin' },
  { href: '#section-projects', label: 'Works' },
  { href: '#section-resume', label: 'Resume' },
  { href: '#section-research', label: 'R1 Lab' },
  { href: '#section-services', label: 'Studio' },
  { href: '#section-contact', label: 'Contact' },
]

const PERSONAS: Array<{ id: PersonaId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'recruiter', label: 'Hire' },
  { id: 'engineer', label: 'Dev' },
  { id: 'research', label: 'Lab' },
  { id: 'client', label: 'Client' },
]

export default function FloatingIslandNav() {
  const {
    persona,
    setPersona,
    isAdmin,
    launchToSpace,
    setCommandBarOpen,
    setResumeTailorOpen,
  } = usePortfolioStore()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-3 z-40 w-full px-3 sm:px-5 lg:px-8">
      <div className="flex items-center justify-between gap-2 rounded-full border border-[#2C241E]/15 bg-[#EFE8D8]/90 px-3.5 py-2 shadow-[0_18px_48px_-14px_rgba(20,16,12,0.38)] backdrop-blur-2xl dark:border-[#E6DEC8]/15 dark:bg-[#141726]/90">
        {/* Brand */}
        <a href="#top" className="flex shrink-0 items-center gap-2 pr-1">
          <img src="/logo.svg" alt="Mohamed Datt" className="h-7 w-7 rounded-full shadow-sm" />
          <div className="hidden whitespace-nowrap sm:flex sm:items-baseline">
            <span className="font-display text-xs font-extrabold tracking-tight text-[#1E1A17] dark:text-[#F5EFE2]">
              MD // STUDIO
            </span>
            <span className="ml-1 font-mono text-[9px] font-bold text-[#E06D43]">
              26–27
            </span>
          </div>
        </a>

        {/* Section Links */}
        <nav aria-label="Primary Sections" className="hidden items-center gap-3.5 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4A3F37] transition hover:text-[#E06D43] dark:text-[#D5CFC2] dark:hover:text-[#F2A65A]"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => setResumeTailorOpen(true)}
            className="whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-wider text-[#0F766E] transition hover:underline dark:text-[#2DD4BF] cursor-pointer"
          >
            ResumeForge
          </button>
        </nav>

        {/* Persona Mini Pills */}
        <div className="hidden shrink-0 items-center gap-0.5 rounded-full border border-[#2C241E]/10 bg-[#E4DBC8]/75 p-0.5 lg:flex dark:border-[#E6DEC8]/10 dark:bg-[#0D101B]/80">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPersona(p.id)}
              className={cn(
                'rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold transition cursor-pointer',
                persona === p.id
                  ? 'bg-[#2DD4BF] text-[#111827]'
                  : 'text-[#5A4F46] hover:text-[#1E1A17] dark:text-[#B8B2A6] dark:hover:text-white'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Right Controls */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Rocket Launch Button -> 3D Space Odyssey */}
          <button
            type="button"
            onClick={launchToSpace}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E06D43] via-[#D97736] to-[#C85A32] px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-[#E06D43]/35 transition hover:scale-[1.03] hover:brightness-110 cursor-pointer"
          >
            <Rocket className="h-3.5 w-3.5" />
            <span>3D Space</span>
          </button>

          <button
            type="button"
            onClick={() => setCommandBarOpen(true)}
            className="flex items-center gap-1 rounded-full border border-[#2C241E]/15 bg-white/40 px-2.5 py-1.5 text-xs font-medium text-[#1E1A17] dark:border-[#E6DEC8]/15 dark:bg-white/[0.05] dark:text-[#E6DEC8] cursor-pointer"
            title="AI Command Bar (Cmd+K)"
            aria-label="Open Command Bar"
          >
            <Command className="h-3.5 w-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
          </button>

          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="rounded-full border border-[#2C241E]/15 bg-white/40 p-1.5 text-[#1E1A17] dark:border-[#E6DEC8]/15 dark:bg-white/[0.05] dark:text-[#F2A65A] cursor-pointer"
              aria-label="Toggle atmosphere theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          )}

          <Link
            href="/admin"
            className="rounded-full border border-[#2C241E]/15 bg-white/40 p-1.5 text-[#5A4F46] transition hover:border-[#E06D43] hover:text-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-white/[0.05] dark:text-[#B8B2A6]"
            title="Admin Vault"
            aria-label="Admin Vault"
          >
            {isAdmin ? <Unlock className="h-3.5 w-3.5 text-[#2DD4BF]" /> : <Lock className="h-3.5 w-3.5" />}
          </Link>
        </div>
      </div>
    </header>
  )
}
