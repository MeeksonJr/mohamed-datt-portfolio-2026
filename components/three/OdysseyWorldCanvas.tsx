'use client'

import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'

const OdysseyWorldScene = dynamic(() => import('./OdysseyWorldScene'), {
  ssr: false,
})

export default function OdysseyWorldCanvas({
  onTelemetryTick,
}: {
  onTelemetryTick?: (pos: [number, number, number]) => void
}) {
  const {
    snapshot,
    activeSector,
    isWarping,
    selectedPlanetNode,
    setSelectedPlanetNode,
    avatarMode,
    avatarMood,
    audioLevel,
    freeLook3D,
    hologramHidden,
    wireframe3D,
    warpToPlanet,
    setVoiceDrawerOpen,
    setResumeTailorOpen,
    executeAgentAction,
  } = usePortfolioStore()

  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isLight = mounted ? resolvedTheme === 'light' : false

  const handleSelectMoonNode = (nodeId: string) => {
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
  }

  return (
    <div
      className={
        freeLook3D
          ? 'fixed inset-0 z-30 pointer-events-auto'
          : 'fixed inset-0 z-0 pointer-events-auto'
      }
    >
      <OdysseyWorldScene
        planets={snapshot.planets}
        activeSector={activeSector}
        isWarping={isWarping}
        selectedNodeId={selectedPlanetNode}
        mode={avatarMode}
        mood={avatarMood}
        audioLevel={audioLevel}
        isLight={isLight}
        freeLook={freeLook3D}
        hologramHidden={hologramHidden}
        wireframe={wireframe3D}
        onSelectPlanet={warpToPlanet}
        onSelectMoonNode={handleSelectMoonNode}
        onTelemetryTick={onTelemetryTick}
      />

      {/* Mid-Tone Atmospheric Horizon Gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isLight
            ? 'radial-gradient(circle at 25% 45%, rgba(200, 90, 50, 0.1), transparent 55%)'
            : 'radial-gradient(circle at 28% 45%, rgba(224, 109, 67, 0.12), transparent 52%), radial-gradient(circle at 75% 75%, rgba(45, 212, 191, 0.08), transparent 50%)',
        }}
      />
    </div>
  )
}
