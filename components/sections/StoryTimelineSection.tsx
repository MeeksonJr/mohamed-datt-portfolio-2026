'use client'

import { useEffect, useState } from 'react'
import { Globe, Plane, Terminal, Trophy, Rocket, Brain, MapPin, ChevronRight } from 'lucide-react'
import SpotlightCard from '@/components/ui/SpotlightCard'
import EditableText from '@/components/studio/EditableText'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import { PERSONAL_PROFILE } from '@/lib/content/default-portfolio-data'
import { cn } from '@/lib/utils'

const ICON_MAP = {
  globe: Globe,
  plane: Plane,
  terminal: Terminal,
  trophy: Trophy,
  rocket: Rocket,
  brain: Brain,
}

export default function StoryTimelineSection() {
  const { snapshot, selectedPlanetNode, setSelectedPlanetNode } = usePortfolioStore()
  const [activePhoto, setActivePhoto] = useState(0)
  const [selectedMilestone, setSelectedMilestone] = useState(snapshot.milestones.length - 1)

  useEffect(() => {
    if (!selectedPlanetNode) return
    const idx = snapshot.milestones.findIndex((m) => m.id === selectedPlanetNode)
    if (idx !== -1) setSelectedMilestone(idx)
  }, [selectedPlanetNode, snapshot.milestones])

  const portraitMedia = snapshot.mediaGallery.filter((m) => m.category === 'portrait')
  const photos =
    portraitMedia.length > 0
      ? portraitMedia.map((m) => ({ src: m.url, label: m.label }))
      : [
          { src: PERSONAL_PROFILE.avatarImage, label: 'Studio Portrait' },
          { src: PERSONAL_PROFILE.portraitImage, label: 'Norfolk VA' },
        ]
  const safePhoto = photos[activePhoto] || photos[0]

  const currentMs = snapshot.milestones[selectedMilestone] || snapshot.milestones[0]

  return (
    <section id="section-story" className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-12">
        <div className="space-y-3 sm:col-span-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#2C241E]/15 bg-[#121625] dark:border-[#E6DEC8]/15">
            <img
              src={safePhoto.src}
              alt={`Mohamed Datt - ${safePhoto.label}`}
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#141726]/90 p-2.5">
              <span className="flex items-center gap-1 font-mono text-[10px] text-[#F2A65A]">
                <MapPin className="h-3 w-3" />
                {PERSONAL_PROFILE.origin}
              </span>
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto">
            {photos.map((photo, idx) => (
              <button
                key={photo.src}
                type="button"
                onClick={() => setActivePhoto(idx)}
                className={cn(
                  'h-10 w-14 shrink-0 overflow-hidden rounded-lg border transition cursor-pointer',
                  activePhoto === idx ? 'border-[#E06D43] ring-1 ring-[#E06D43]' : 'border-white/10 opacity-60'
                )}
              >
                <img src={photo.src} alt={photo.label} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 sm:col-span-7">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#0F766E] dark:text-[#2DD4BF]">
            02 / Planetary Origin Logs
          </span>
          <EditableText
            textKey="aboutTitle"
            as="h2"
            className="font-display text-2xl font-bold text-[#1E1A17] dark:text-[#F5EFE2]"
          />
          <EditableText
            textKey="aboutBio"
            as="p"
            multiline
            className="text-xs leading-relaxed text-[#3B312B] dark:text-[#D5CFC2]"
          />

          <SpotlightCard className="p-3.5" spotlightColor="rgba(45, 212, 191, 0.14)">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
                {currentMs.title}
              </h3>
              <span className="rounded-full bg-[#E06D43]/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#A94422] dark:text-[#F2A65A]">
                {currentMs.year}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#3B312B] dark:text-[#D5CFC2]">{currentMs.summary}</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#2DD4BF]/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#0F766E] dark:text-[#5EEAD4]">
              <ChevronRight className="h-3 w-3" />
              {currentMs.highlight}
            </div>
          </SpotlightCard>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {snapshot.milestones.map((ms, idx) => {
          const Icon = ICON_MAP[ms.iconName]
          const active = selectedMilestone === idx
          return (
            <button
              key={ms.id}
              type="button"
              onClick={() => {
                setSelectedMilestone(idx)
                setSelectedPlanetNode(ms.id)
              }}
              className={cn(
                'flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition cursor-pointer',
                active
                  ? 'border-[#E06D43] bg-[#E06D43]/15'
                  : 'border-[#2C241E]/10 bg-white/30 hover:border-[#E06D43]/40 dark:border-[#E6DEC8]/10 dark:bg-white/[0.02]'
              )}
            >
              <div className="flex w-full items-center justify-between">
                <Icon className={cn('h-3.5 w-3.5', active ? 'text-[#E06D43]' : 'text-slate-400')} />
                <span className="font-mono text-[9px] text-[#5A4F46] dark:text-[#A39E93]">
                  {ms.year}
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#1E1A17] dark:text-[#F5EFE2]">{ms.title}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
