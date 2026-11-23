'use client'

import { useState } from 'react'
import { Camera, Rocket, Sparkles } from 'lucide-react'
import { PERSONAL_PROFILE } from '@/lib/content/default-portfolio-data'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import { cn } from '@/lib/utils'

type ColorGrade = 'noir' | 'amber' | 'natural'

interface StudioAnglePreset {
  id: string
  num: string
  label: string
  subtitle: string
  defaultGrade: ColorGrade
  imageClass: string
  archMode?: boolean
  fallbackUrl: string
}

const ANGLE_PRESETS: StudioAnglePreset[] = [
  {
    id: 'studio-noir',
    num: '01',
    label: 'Studio Noir',
    subtitle: 'NOIRBYTE High-Contrast Studio Portrait',
    defaultGrade: 'noir',
    imageClass: 'object-cover object-[50%_15%] scale-100',
    fallbackUrl: PERSONAL_PROFILE.avatarImage,
  },
  {
    id: 'arch-orbital',
    num: '02',
    label: 'Arch Orbital',
    subtitle: 'Sculptural Arch + Orbital Stamp',
    defaultGrade: 'natural',
    imageClass: 'object-cover object-[50%_18%] scale-100',
    archMode: true,
    fallbackUrl: PERSONAL_PROFILE.portraitImage,
  },
  {
    id: 'field-full',
    num: '03',
    label: 'Field Stance',
    subtitle: 'Folioblox Amber Duotone Full-Shot',
    defaultGrade: 'amber',
    imageClass: 'object-cover object-[50%_14%] scale-100',
    fallbackUrl: '/images/standing-shot.jpg',
  },
  {
    id: 'architect-desk',
    num: '04',
    label: 'Builder Mode',
    subtitle: 'Full-Frame Studio Bench Angle',
    defaultGrade: 'natural',
    imageClass: 'object-cover object-[50%_8%] scale-100',
    fallbackUrl: '/images/sitting-shot.jpg',
  },
]

const GRADE_CLASSES: Record<ColorGrade, string> = {
  noir: 'portrait-noir',
  amber: 'portrait-amber',
  natural: 'portrait-cyber',
}

export default function EditorialPortraitStudio() {
  const { snapshot, launchToSpace } = usePortfolioStore()
  const [activeIdx, setActiveIdx] = useState(0)
  const [gradeOverride, setGradeOverride] = useState<ColorGrade | null>(null)

  const portraitAssets = snapshot.mediaGallery.filter((m) => m.category === 'portrait')
  const preset = ANGLE_PRESETS[activeIdx] || ANGLE_PRESETS[0]
  const photoUrl = portraitAssets[activeIdx]?.url || preset.fallbackUrl
  const activeGrade = gradeOverride || preset.defaultGrade

  return (
    <div className="relative mx-auto flex w-full max-w-[430px] flex-col gap-3 lg:max-w-none">
      {/* Main Studio Portrait Frame */}
      <div className="relative overflow-hidden rounded-[2rem] border border-[#2C241E]/20 bg-[#141726] p-3 shadow-[0_32px_90px_-24px_rgba(20,16,12,0.55)] dark:border-[#E6DEC8]/15">
        {/* Top Telemetry Bar */}
        <div className="mb-2.5 flex items-center justify-between px-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#E6DEC8]">
              {preset.num} // {preset.label}
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-0.5">
            {(['noir', 'amber', 'natural'] as ColorGrade[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGradeOverride(g)}
                className={cn(
                  'rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase transition cursor-pointer',
                  activeGrade === g
                    ? 'bg-[#E06D43] text-white'
                    : 'text-[#A39E93] hover:text-white'
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Sculptural Portrait Canvas — Unobstructed Full Headroom Framing */}
        <div className="relative aspect-[4/4] w-full overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-[#23273E] via-[#171A2B] to-[#0E101A]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 top-6 h-64 w-64 rounded-full bg-[#E06D43]/35 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-10 bottom-10 h-48 w-48 rounded-full bg-[#2DD4BF]/20 blur-3xl"
          />

          {/* Arch Mask vs Full Editorial Frame */}
          <div
            className={cn(
              'relative h-full w-full transition-all duration-500',
              preset.archMode &&
                'mx-auto mt-3 h-[94%] w-[86%] overflow-hidden rounded-t-full border border-[#E6DEC8]/25 bg-[#1D2235]'
            )}
          >
            <img
              key={`${photoUrl}-${activeIdx}`}
              src={photoUrl}
              alt={`Mohamed Datt — ${preset.label}`}
              className={cn(
                'h-full w-full transition-all duration-700',
                preset.imageClass,
                GRADE_CLASSES[activeGrade]
              )}
            />
          </div>

          {/* Hand-Drawn Orbital SVG Loop */}
          <svg
            aria-hidden="true"
            viewBox="0 0 400 400"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <path
              d="M 38 290 C 12 215, 388 205, 360 135 C 335 82, 24 126, 40 198 C 52 252, 338 292, 354 342"
              fill="none"
              stroke={activeIdx === 1 ? '#2DD4BF' : '#E06D43'}
              strokeWidth="1.75"
              strokeDasharray={activeIdx === 1 ? 'none' : '5 5'}
              strokeOpacity="0.82"
            />
          </svg>

          {/* Spinning Circular Stamp CTA -> Launches 3D Space Odyssey Rocket */}
          <button
            type="button"
            onClick={launchToSpace}
            aria-label="Launch 3D Space Odyssey Rocketship"
            title="Launch 3D Space Odyssey Rocketship"
            className="group absolute right-3 top-3 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-white/15 bg-[#121625]/75 backdrop-blur-md transition hover:scale-105 hover:border-[#E06D43] cursor-pointer"
          >
            <svg viewBox="0 0 100 100" className="h-14 w-14 animate-spin-slow">
              <defs>
                <path
                  id="orbitalStampPath"
                  d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                />
              </defs>
              <text
                fill="#F2A65A"
                fontSize="8.3"
                fontWeight="700"
                letterSpacing="2.1"
                fontFamily="monospace"
              >
                <textPath href="#orbitalStampPath">
                  LAUNCH 3D SPACE • BOARD ROCKET •
                </textPath>
              </text>
            </svg>
            <Rocket className="absolute h-4 w-4 text-[#E06D43] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Dedicated Non-Clipped Telemetry Bar (Below Image Frame so zero text or faces ever clip) */}
        <div className="corner-bracket-card mt-2.5 rounded-2xl border border-white/15 bg-[#0D101B]/90 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#F2A65A]">
                36.8508° N • NORFOLK / ODU R1
              </p>
              <p className="truncate font-display text-xs font-bold text-white sm:text-sm">
                {PERSONAL_PROFILE.title}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#E06D43]/25 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#F2A65A]">
              <Sparkles className="h-2.5 w-2.5" />
              {preset.label}
            </span>
          </div>
        </div>

        {/* NEXA WEAR 01 02 03 04 Camera Angle Switcher Strip */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#B8B2A6]">
            <Camera className="h-3 w-3 text-[#E06D43]" />
            {preset.subtitle}
          </span>

          <div className="flex items-center gap-1">
            {ANGLE_PRESETS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveIdx(idx)
                  setGradeOverride(null)
                }}
                className={cn(
                  'rounded-lg px-2 py-1 font-mono text-[11px] font-bold transition cursor-pointer',
                  activeIdx === idx
                    ? 'bg-[#E06D43] text-white shadow-sm'
                    : 'bg-white/[0.06] text-[#B8B2A6] hover:bg-white/15 hover:text-white'
                )}
              >
                {item.num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
