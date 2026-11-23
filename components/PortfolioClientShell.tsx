'use client'

import { useEffect, useRef, useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { ChevronRight, Sparkles } from 'lucide-react'
import { PortfolioStoreProvider, usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import OdysseyWorldCanvas from '@/components/three/OdysseyWorldCanvas'
import RocketTransitionOverlay from '@/components/three/RocketTransitionOverlay'
import TerrestrialHome from '@/components/home/TerrestrialHome'
import SpatialDockNav from '@/components/layout/SpatialDockNav'
import TelemetryFrame from '@/components/layout/TelemetryFrame'
import HeroSection from '@/components/sections/HeroSection'
import StoryTimelineSection from '@/components/sections/StoryTimelineSection'
import ProjectsSection from '@/components/sections/ProjectsSection'
import ResearchLabSection from '@/components/sections/ResearchLabSection'
import SkillsAndGitHubSection from '@/components/sections/SkillsAndGitHubSection'
import ServicesEstimatorSection from '@/components/sections/ServicesEstimatorSection'
import TestimonialsGuestbookSection from '@/components/sections/TestimonialsGuestbookSection'
import ContactSection from '@/components/sections/ContactSection'
import AgenticCommandBar from '@/components/ai/AgenticCommandBar'
import VoiceConcierge from '@/components/ai/VoiceConcierge'
import ResumeTailorModal from '@/components/ai/ResumeTailorModal'
import type { PortfolioStateSnapshot, SectionKey } from '@/lib/content/types'
import { cn } from '@/lib/utils'

const SECTION_COMPONENTS: Record<SectionKey, React.ComponentType> = {
  hero: HeroSection,
  story: StoryTimelineSection,
  projects: ProjectsSection,
  research: ResearchLabSection,
  skills: SkillsAndGitHubSection,
  services: ServicesEstimatorSection,
  testimonials: TestimonialsGuestbookSection,
  contact: ContactSection,
}

function PortfolioCanvasContent() {
  const {
    snapshot,
    activeSector,
    isWarping,
    freeLook3D,
    hologramHidden,
    layoutStyle,
    warpToPlanet,
  } = usePortfolioStore()

  const [camCoords, setCamCoords] = useState<[number, number, number]>([1.9, 0.8, 6.4])
  const consoleScrollRef = useRef<HTMLDivElement>(null)
  const wheelLockRef = useRef<number>(0)

  const planets = snapshot.planets
  const currentStation = planets[activeSector] || planets[0]
  const ActiveComponent = currentStation ? SECTION_COMPONENTS[currentStation.sectionKey] : HeroSection
  const planetOnLeft = activeSector % 2 === 0

  useEffect(() => {
    if (layoutStyle !== 'odyssey' || freeLook3D) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        warpToPlanet(activeSector + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        warpToPlanet(activeSector - 1)
      }
    }

    const onWheel = (e: WheelEvent) => {
      const now = Date.now()
      if (now - wheelLockRef.current < 750 || Math.abs(e.deltaY) < 28) return

      const consoleEl = consoleScrollRef.current
      if (consoleEl && consoleEl.contains(e.target as Node)) {
        const canScrollDown =
          consoleEl.scrollTop + consoleEl.clientHeight < consoleEl.scrollHeight - 4
        const canScrollUp = consoleEl.scrollTop > 4
        if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
          return
        }
      }

      if (e.deltaY > 0 && activeSector < planets.length - 1) {
        wheelLockRef.current = now
        warpToPlanet(activeSector + 1)
      } else if (e.deltaY < 0 && activeSector > 0) {
        wheelLockRef.current = now
        warpToPlanet(activeSector - 1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', onWheel)
    }
  }, [activeSector, freeLook3D, layoutStyle, planets.length, warpToPlanet])

  useEffect(() => {
    if (consoleScrollRef.current) {
      consoleScrollRef.current.scrollTop = 0
    }
  }, [activeSector])

  const hideHologram = freeLook3D || isWarping || hologramHidden

  return (
    <>
      {layoutStyle === 'editorial' ? (
        <TerrestrialHome />
      ) : (
        <div className="observatory-grid relative h-screen w-screen overflow-hidden bg-[#E2D8C4] text-[#1E1A17] transition-colors duration-500 dark:bg-[#181C2E] dark:text-[#F3EDE0]">
          <OdysseyWorldCanvas onTelemetryTick={setCamCoords} />

          <div className="relative z-40">
            <SpatialDockNav />
          </div>

          <TelemetryFrame camCoords={camCoords} />

          {isWarping && !freeLook3D && currentStation && (
            <div className="pointer-events-none fixed inset-x-0 top-24 z-30 flex justify-center">
              <div className="flex items-center gap-2 rounded-full border border-[#F2A65A]/50 bg-[#181C2E]/85 px-4 py-1.5 font-mono text-[11px] font-bold tracking-widest text-[#F2A65A] shadow-xl backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                WARPING TO SECTOR {currentStation.code} // {currentStation.planetName.toUpperCase()}
              </div>
            </div>
          )}

          <main className="pointer-events-none relative z-20 mx-auto flex h-[calc(100vh-140px)] max-w-[1440px] items-center px-4 sm:px-8">
            {!hideHologram && currentStation && (
              <div
                className={cn(
                  'hidden lg:flex lg:w-[44%] flex-col justify-end h-full pb-14',
                  planetOnLeft ? 'order-1 items-start' : 'order-2 items-end text-right'
                )}
              >
                <div className="pointer-events-auto rounded-2xl border border-[#2C241E]/15 bg-[#EFE8D8]/75 px-4 py-3 backdrop-blur-xl dark:border-[#E6DEC8]/15 dark:bg-[#181C2E]/75">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] dark:text-[#F2A65A]">
                    Docked Planet {currentStation.code} / 0{planets.length} • Coords [{currentStation.coordsLabel}]
                  </p>
                  <p className="font-display text-base font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
                    {currentStation.planetName}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-[#0F766E] dark:text-[#2DD4BF]">
                    {currentStation.description || 'Click orbiting 3D moons directly in space or warp below'}
                  </p>
                </div>
              </div>
            )}

            {!hideHologram && (
              <svg
                aria-hidden="true"
                className="pointer-events-none hidden lg:block absolute left-1/2 top-1/2 h-16 w-24 -translate-x-1/2 -translate-y-1/2"
                viewBox="0 0 96 64"
              >
                <line
                  x1={planetOnLeft ? '0' : '96'}
                  y1="32"
                  x2={planetOnLeft ? '96' : '0'}
                  y2="32"
                  stroke="#E06D43"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <circle cx={planetOnLeft ? '8' : '88'} cy="32" r="3.5" fill="#2DD4BF" />
                <circle cx={planetOnLeft ? '88' : '8'} cy="32" r="3.5" fill="#E06D43" />
              </svg>
            )}

            <div
              className={cn(
                'w-full transition-all duration-500 lg:w-[54%]',
                planetOnLeft ? 'order-2 lg:ml-auto' : 'order-1 lg:mr-auto',
                hideHologram
                  ? 'pointer-events-none scale-95 opacity-0'
                  : 'pointer-events-auto scale-100 opacity-100'
              )}
            >
              <div className="relative flex max-h-[calc(100vh-175px)] flex-col overflow-hidden rounded-3xl border border-[#2C241E]/20 bg-[#EFE8D8]/85 shadow-[0_28px_80px_-20px_rgba(20,18,16,0.45)] backdrop-blur-2xl dark:border-[#E6DEC8]/18 dark:bg-[#171B2D]/85">
                {currentStation && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2C241E]/10 bg-black/[0.03] px-5 py-2.5 dark:border-[#E6DEC8]/10 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="h-2 w-2 rounded-full bg-[#E06D43]" />
                      <span className="font-bold uppercase tracking-wider text-[#C85A32] dark:text-[#F2A65A]">
                        HOLOGRAM CONSOLE // {currentStation.code} {currentStation.shortName}
                      </span>
                    </div>

                    {activeSector < planets.length - 1 && (
                      <button
                        type="button"
                        onClick={() => warpToPlanet(activeSector + 1)}
                        className="flex items-center gap-1 font-mono text-[10px] font-bold text-[#0F766E] hover:underline dark:text-[#2DD4BF] cursor-pointer"
                      >
                        Next: {planets[activeSector + 1].shortName}
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}

                <div ref={consoleScrollRef} className="flex-1 overflow-y-auto p-5 sm:p-6">
                  {currentStation?.isCustom ? (
                    <div className="space-y-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#2DD4BF]">
                        Custom World • {currentStation.code}
                      </span>
                      <h2 className="font-display text-2xl font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
                        {currentStation.planetName}
                      </h2>
                      <p className="text-sm text-[#3B312B] dark:text-[#D5CFC2]">
                        {currentStation.description || 'Custom planetary station added via Admin Command Center.'}
                      </p>
                      <ProjectsSection />
                    </div>
                  ) : (
                    ActiveComponent && <ActiveComponent />
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      <RocketTransitionOverlay />
      <AgenticCommandBar />
      <VoiceConcierge />
      <ResumeTailorModal />
    </>
  )
}

export default function PortfolioClientShell({
  initialSnapshot,
  initialPersistence,
  initialIsAdmin = false,
}: {
  initialSnapshot: PortfolioStateSnapshot
  initialPersistence: 'drizzle' | 'local-file' | 'fallback'
  initialIsAdmin?: boolean
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <PortfolioStoreProvider
        initialSnapshot={initialSnapshot}
        initialPersistence={initialPersistence}
        initialIsAdmin={initialIsAdmin}
      >
        <PortfolioCanvasContent />
        <Toaster position="top-center" richColors />
      </PortfolioStoreProvider>
    </ThemeProvider>
  )
}
