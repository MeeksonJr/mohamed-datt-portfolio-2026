'use client'

import { ChevronLeft, ChevronRight, Compass, Eye, EyeOff, RotateCcw } from 'lucide-react'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import { cn } from '@/lib/utils'

export default function TelemetryFrame({
  camCoords,
}: {
  camCoords: [number, number, number]
}) {
  const {
    snapshot,
    activeSector,
    isWarping,
    freeLook3D,
    setFreeLook3D,
    hologramHidden,
    setHologramHidden,
    layoutStyle,
    warpToPlanet,
  } = usePortfolioStore()

  const planets = snapshot.planets
  const activeStation = planets[activeSector] || planets[0]

  if (!activeStation) return null

  return (
    <>
      <div className="pointer-events-none fixed inset-2.5 z-20 hidden sm:block">
        <span className="absolute left-0 top-0 font-mono text-xs text-[#E06D43]/55">+</span>
        <span className="absolute right-0 top-0 font-mono text-xs text-[#E06D43]/55">+</span>
        <span className="absolute bottom-0 left-0 font-mono text-xs text-[#E06D43]/55">+</span>
        <span className="absolute bottom-0 right-0 font-mono text-xs text-[#E06D43]/55">+</span>
      </div>

      {/* Bottom-Left Live 3D Telemetry Readout */}
      <div className="pointer-events-none fixed bottom-4 left-4 z-30 hidden items-center gap-2.5 rounded-xl border border-[#2C241E]/15 bg-[#EFE8D8]/85 px-3 py-2 font-mono text-[10px] text-[#2C241E] backdrop-blur-xl dark:border-[#E6DEC8]/15 dark:bg-[#191D2E]/80 dark:text-[#E6DEC8] xl:flex">
        <Compass className={cn('h-3.5 w-3.5 text-[#E06D43]', isWarping && 'animate-spin')} />
        <span className="font-bold text-[#C85A32] dark:text-[#F2A65A]">
          {activeStation.code} // {activeStation.shortName}
        </span>
        <span className="opacity-35">|</span>
        <span>
          CAM [{camCoords[0].toFixed(1)}, {camCoords[1].toFixed(1)}, {camCoords[2].toFixed(1)}]
        </span>
      </div>

      {/* Bottom-Center Interactive Planetary System Map */}
      {!freeLook3D && layoutStyle === 'odyssey' && (
        <nav
          aria-label="Planetary System Navigator"
          className="fixed bottom-2.5 left-1/2 z-30 flex max-w-[96vw] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-2xl border border-[#2C241E]/15 bg-[#EFE8D8]/90 px-2 py-1 shadow-2xl backdrop-blur-2xl sm:bottom-4 sm:gap-1.5 sm:px-2.5 sm:py-1.5 dark:border-[#E6DEC8]/15 dark:bg-[#181C2E]/90"
        >
          <button
            type="button"
            disabled={activeSector === 0}
            onClick={() => warpToPlanet(activeSector - 1)}
            className="flex shrink-0 items-center gap-1 rounded-xl border border-[#2C241E]/10 px-2 py-1.5 font-mono text-[10px] font-bold text-[#1E1A17] transition hover:border-[#E06D43] disabled:opacity-30 dark:border-[#E6DEC8]/10 dark:text-[#E6DEC8] cursor-pointer"
            aria-label="Previous planet"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">PREV</span>
          </button>

          <div className="flex items-center gap-0.5 sm:gap-1 px-0.5 sm:px-1">
            {planets.map((station) => {
              const active = activeSector === station.index
              return (
                <button
                  key={`${station.code}-${station.index}`}
                  type="button"
                  onClick={() => warpToPlanet(station.index)}
                  className={cn(
                    'flex shrink-0 items-center gap-1 rounded-xl px-1.5 py-1.5 font-mono text-[10px] font-bold transition sm:px-2 cursor-pointer',
                    active
                      ? 'bg-[#E06D43] text-white shadow-md shadow-[#E06D43]/40'
                      : 'text-[#5A4F46] hover:bg-black/5 hover:text-[#1E1A17] dark:text-[#B8B2A6] dark:hover:bg-white/10 dark:hover:text-white'
                  )}
                  title={`Warp to ${station.planetName}`}
                >
                  <span>{station.code}</span>
                  <span className={cn('hidden lg:inline', !active && 'opacity-70')}>
                    {station.shortName}
                  </span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            disabled={activeSector >= planets.length - 1}
            onClick={() => warpToPlanet(activeSector + 1)}
            className="flex shrink-0 items-center gap-1 rounded-xl bg-[#2DD4BF]/20 px-2 py-1.5 font-mono text-[10px] font-bold text-[#0F766E] transition hover:bg-[#2DD4BF]/30 disabled:opacity-30 sm:px-2.5 dark:text-[#5EEAD4] cursor-pointer"
            aria-label="Warp to next planet"
          >
            <span className="hidden sm:inline">WARP</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setHologramHidden(!hologramHidden)}
            className={cn(
              'ml-0.5 flex shrink-0 items-center gap-1 rounded-xl border px-2 py-1.5 font-mono text-[10px] font-semibold transition cursor-pointer',
              hologramHidden
                ? 'border-[#F2A65A] bg-[#F2A65A]/20 text-[#A94422] dark:text-[#F2A65A]'
                : 'border-[#2C241E]/15 text-[#3B312B] hover:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:text-[#E6DEC8]'
            )}
            aria-label={hologramHidden ? 'Show console HUD' : 'Pure 3D space view'}
          >
            {hologramHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{hologramHidden ? 'Show HUD' : 'Pure 3D'}</span>
          </button>
        </nav>
      )}

      {/* Free-Look 3D World Exit Banner */}
      {freeLook3D && (
        <div className="fixed bottom-4 left-1/2 z-50 flex max-w-[94vw] -translate-x-1/2 items-center gap-2 rounded-full border border-[#E06D43]/50 bg-[#181C2E]/90 px-4 py-2 text-xs text-[#E6DEC8] shadow-2xl backdrop-blur-xl sm:bottom-6 sm:gap-3 sm:px-5 sm:py-2.5">
          <Eye className="h-4 w-4 shrink-0 text-[#F2A65A]" />
          <span className="truncate font-mono text-[10px] sm:text-[11px]">
            3D ORBIT • Drag to Rotate • Tap Planets/Moons
          </span>
          <button
            type="button"
            onClick={() => setFreeLook3D(false)}
            className="flex shrink-0 items-center gap-1 rounded-full bg-[#E06D43] px-3 py-1 text-[10px] font-bold text-white transition hover:brightness-110 sm:text-[11px] cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Console</span>
          </button>
        </div>
      )}
    </>
  )
}
