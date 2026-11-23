'use client'

import { useEffect, useRef, useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react'
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
    selectedPlanetNode,
    setSelectedPlanetNode,
    warpToPlanet,
    setVoiceDrawerOpen,
    setResumeTailorOpen,
    executeAgentAction,
  } = usePortfolioStore()

  const [camCoords, setCamCoords] = useState<[number, number, number]>([1.9, 0.8, 6.4])
  const [mobileConsoleMode, setMobileConsoleMode] = useState<'split' | 'expanded' | 'minimized'>('split')
  const consoleScrollRef = useRef<HTMLDivElement>(null)
  const wheelLockRef = useRef<number>(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1 || freeLook3D) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null
    if (Math.abs(dx) > 58 && Math.abs(dx) > Math.abs(dy) * 1.35) {
      if (dx < 0 && activeSector < planets.length - 1) {
        warpToPlanet(activeSector + 1)
      } else if (dx > 0 && activeSector > 0) {
        warpToPlanet(activeSector - 1)
      }
    }
  }

  const handleTapMobileMoon = (nodeId: string) => {
    setSelectedPlanetNode(nodeId)
    if (nodeId === 'voice-twin') {
      setVoiceDrawerOpen(true)
    } else if (nodeId === 'tailor-resume' || nodeId === 'tailor-fit') {
      setResumeTailorOpen(true)
    } else if (nodeId === 'repos-50') {
      executeAgentAction({ type: 'scrollTo', payload: 'skills' })
    } else if (nodeId === 'award-1st') {
      executeAgentAction({ type: 'scrollTo', payload: 'testimonials' })
    }
    if (mobileConsoleMode === 'minimized') {
      setMobileConsoleMode('split')
    }
  }

  const hideHologram = freeLook3D || isWarping || hologramHidden

  return (
    <>
      {layoutStyle === 'editorial' ? (
        <TerrestrialHome />
      ) : (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="observatory-grid relative h-[100dvh] w-screen overflow-hidden bg-[#E2D8C4] text-[#1E1A17] transition-colors duration-500 dark:bg-[#181C2E] dark:text-[#F3EDE0]"
        >
          <OdysseyWorldCanvas onTelemetryTick={setCamCoords} />

          <div className="relative z-40">
            <SpatialDockNav />
          </div>

          <TelemetryFrame camCoords={camCoords} />

          {isWarping && !freeLook3D && currentStation && (
            <div className="pointer-events-none fixed inset-x-0 top-16 z-30 flex justify-center sm:top-24">
              <div className="flex items-center gap-2 rounded-full border border-[#F2A65A]/50 bg-[#181C2E]/85 px-4 py-1.5 font-mono text-[11px] font-bold tracking-widest text-[#F2A65A] shadow-xl backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                WARPING TO {currentStation.code} // {currentStation.planetName.toUpperCase()}
              </div>
            </div>
          )}

          {/* Responsive Main Stage: Vertical 3D Orbital Stage + Tethered Console on Mobile (<1024px) | Horizontal Split on Desktop */}
          <main className="pointer-events-none relative z-20 mx-auto flex h-[calc(100dvh-116px)] max-w-[1440px] flex-col justify-between px-3 pb-2 pt-1 sm:px-6 lg:h-[calc(100vh-140px)] lg:flex-row lg:items-center lg:px-8 lg:pb-0 lg:pt-0">
            {/* MOBILE TOP 3D ORBITAL STAGE (Open transparent viewport letting the centered 3D planet & orbiting moons shine) */}
            {!hideHologram && currentStation && (
              <div
                className={cn(
                  'pointer-events-none flex flex-col justify-between transition-all duration-300 lg:hidden',
                  mobileConsoleMode === 'expanded'
                    ? 'shrink-0 pb-1'
                    : mobileConsoleMode === 'minimized'
                      ? 'flex-1 pb-2'
                      : 'h-[37dvh] min-h-[195px] shrink-0'
                )}
              >
                {/* Compact Mobile Planet Header + Quick Swipe/Arrow Warp */}
                <div className="pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between gap-2 rounded-2xl border border-[#2C241E]/15 bg-[#EFE8D8]/75 px-3 py-1.5 backdrop-blur-xl dark:border-[#E6DEC8]/15 dark:bg-[#14182A]/78">
                  <button
                    type="button"
                    disabled={activeSector === 0}
                    onClick={() => warpToPlanet(activeSector - 1)}
                    aria-label="Warp to previous planet"
                    className="rounded-lg p-1 text-[#1E1A17] hover:bg-black/10 disabled:opacity-30 dark:text-[#F5EFE2] dark:hover:bg-white/10 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="min-w-0 text-center">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#C85A32] dark:text-[#F2A65A]">
                      PLANET {currentStation.code} / 0{planets.length} • SWIPE TO FLY
                    </p>
                    <p className="truncate font-display text-xs font-extrabold text-[#1E1A17] dark:text-[#F5EFE2]">
                      {currentStation.planetName}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={activeSector >= planets.length - 1}
                    onClick={() => warpToPlanet(activeSector + 1)}
                    aria-label="Warp to next planet"
                    className="rounded-lg p-1 text-[#1E1A17] hover:bg-black/10 disabled:opacity-30 dark:text-[#F5EFE2] dark:hover:bg-white/10 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Tactile Orbiting Moon Node Chips at the base of the 3D planet stage + Vertical Tether Line */}
                {mobileConsoleMode !== 'expanded' && (
                  <div className="flex flex-col items-center gap-1.5">
                    {currentStation.moons.length > 0 && (
                      <div className="pointer-events-auto flex max-w-full items-center gap-1.5 overflow-x-auto px-1 pb-0.5">
                        {currentStation.moons.map((moon) => {
                          const isSelected = selectedPlanetNode === moon.id
                          return (
                            <button
                              key={moon.id}
                              type="button"
                              onClick={() => handleTapMobileMoon(moon.id)}
                              className={cn(
                                'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold backdrop-blur-xl transition cursor-pointer',
                                isSelected
                                  ? 'border-white bg-[#E06D43] text-white shadow-md'
                                  : 'border-[#2C241E]/20 bg-[#141726]/80 text-[#F5EFE2]'
                              )}
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: isSelected ? '#FFFFFF' : moon.color }}
                              />
                              <span>{moon.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Vertical Energy Tether Beam from 3D Planet -> Mobile Console */}
                    <svg aria-hidden="true" className="h-5 w-8" viewBox="0 0 32 20">
                      <line
                        x1="16"
                        y1="0"
                        x2="16"
                        y2="20"
                        stroke="#E06D43"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      <circle cx="16" cy="3" r="2.5" fill="#2DD4BF" />
                      <circle cx="16" cy="17" r="2.5" fill="#E06D43" />
                    </svg>
                  </div>
                )}
              </div>
            )}

            {/* DESKTOP PLANET DOCK CARD (Left/Right Alternating) */}
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

            {/* DESKTOP HORIZONTAL TETHER */}
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

            {/* TETHERED HOLOGRAM CONSOLE (Bottom Half Sheet on Mobile, Left/Right Console on Desktop) */}
            <div
              className={cn(
                'w-full transition-all duration-500 lg:w-[54%]',
                planetOnLeft ? 'lg:order-2 lg:ml-auto' : 'lg:order-1 lg:mr-auto',
                hideHologram
                  ? 'pointer-events-none scale-95 opacity-0'
                  : 'pointer-events-auto scale-100 opacity-100'
              )}
            >
              <div
                className={cn(
                  'relative flex flex-col overflow-hidden rounded-3xl border border-[#2C241E]/20 bg-[#EFE8D8]/88 shadow-[0_28px_80px_-20px_rgba(20,18,16,0.45)] backdrop-blur-2xl transition-all duration-300 dark:border-[#E6DEC8]/18 dark:bg-[#171B2D]/88 lg:max-h-[calc(100vh-175px)]',
                  mobileConsoleMode === 'minimized'
                    ? 'max-h-[54px]'
                    : mobileConsoleMode === 'expanded'
                      ? 'max-h-[calc(100dvh-185px)]'
                      : 'max-h-[calc(62dvh-76px)]'
                )}
              >
                {currentStation && (
                  <div className="flex items-center justify-between gap-2 border-b border-[#2C241E]/10 bg-black/[0.03] px-4 py-2.5 sm:px-5 dark:border-[#E6DEC8]/10 dark:bg-white/[0.03]">
                    <div className="flex min-w-0 items-center gap-2 font-mono text-[10px]">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#E06D43]" />
                      <span className="truncate font-bold uppercase tracking-wider text-[#C85A32] dark:text-[#F2A65A]">
                        CONSOLE // {currentStation.code} {currentStation.shortName}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {/* Mobile Expand / Collapse to 3D Stage Controls */}
                      <div className="flex items-center gap-1 lg:hidden">
                        <button
                          type="button"
                          onClick={() =>
                            setMobileConsoleMode((m) => (m === 'expanded' ? 'split' : 'expanded'))
                          }
                          aria-label={mobileConsoleMode === 'expanded' ? 'Return to split 3D stage' : 'Expand console'}
                          className="rounded-lg border border-[#2C241E]/15 bg-white/50 p-1 text-[#1E1A17] dark:border-white/15 dark:bg-white/10 dark:text-[#F5EFE2] cursor-pointer"
                        >
                          {mobileConsoleMode === 'expanded' ? (
                            <Minimize2 className="h-3.5 w-3.5" />
                          ) : (
                            <Maximize2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setMobileConsoleMode((m) => (m === 'minimized' ? 'split' : 'minimized'))
                          }
                          aria-label={mobileConsoleMode === 'minimized' ? 'Show console' : 'Focus 3D planet'}
                          className="rounded-lg border border-[#2C241E]/15 bg-white/50 p-1 text-[#1E1A17] dark:border-white/15 dark:bg-white/10 dark:text-[#F5EFE2] cursor-pointer"
                        >
                          {mobileConsoleMode === 'minimized' ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      {activeSector < planets.length - 1 && (
                        <button
                          type="button"
                          onClick={() => warpToPlanet(activeSector + 1)}
                          className="flex items-center gap-1 font-mono text-[10px] font-bold text-[#0F766E] hover:underline dark:text-[#2DD4BF] cursor-pointer"
                        >
                          <span className="hidden sm:inline">Next:</span> {planets[activeSector + 1].shortName}
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {mobileConsoleMode !== 'minimized' && (
                  <div ref={consoleScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                )}
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
