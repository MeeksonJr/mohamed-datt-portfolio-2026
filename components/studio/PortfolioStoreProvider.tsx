'use client'

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { createInitialSnapshot } from '@/lib/content/default-portfolio-data'
import type { PlanetDefinition } from '@/lib/content/planets'
import type {
  AgentUIAction,
  AvatarMode,
  AvatarMood,
  BentoSpan,
  MediaAsset,
  PersonaId,
  PortfolioStateSnapshot,
  PortfolioTextMap,
  ProjectItem,
  SectionConfig,
  SectionKey,
} from '@/lib/content/types'

export type RocketTransitionPhase = 'idle' | 'launch' | 'land'

interface PortfolioContextValue {
  snapshot: PortfolioStateSnapshot
  persistence: 'drizzle' | 'local-file' | 'fallback'
  isAdmin: boolean
  setIsAdmin: (val: boolean) => void
  persona: PersonaId
  setPersona: (persona: PersonaId) => void
  projectFilter: string
  setProjectFilter: (filter: string) => void
  avatarMode: AvatarMode
  setAvatarMode: (mode: AvatarMode) => void
  avatarMood: AvatarMood
  setAvatarMood: (mood: AvatarMood) => void
  audioLevel: number
  setAudioLevel: (level: number) => void
  inlineEditMode: boolean
  setInlineEditMode: (active: boolean) => void
  inspectMode: boolean
  setInspectMode: (active: boolean) => void
  resumeTailorOpen: boolean
  setResumeTailorOpen: (open: boolean) => void
  voiceDrawerOpen: boolean
  setVoiceDrawerOpen: (open: boolean) => void
  commandBarOpen: boolean
  setCommandBarOpen: (open: boolean) => void
  freeLook3D: boolean
  setFreeLook3D: (active: boolean) => void
  wireframe3D: boolean
  setWireframe3D: (active: boolean) => void
  layoutStyle: 'odyssey' | 'editorial'
  setLayoutStyle: (style: 'odyssey' | 'editorial') => void
  rocketTransition: RocketTransitionPhase
  launchToSpace: () => void
  landOnEarth: () => void
  skipRocketTransition: () => void
  scrollProgress: number
  setScrollProgress: (val: number) => void
  activeSector: number
  setActiveSector: (idx: number) => void
  isWarping: boolean
  selectedPlanetNode: string | null
  setSelectedPlanetNode: (nodeId: string | null) => void
  hologramHidden: boolean
  setHologramHidden: (hidden: boolean) => void
  warpToPlanet: (index: number) => void
  updateText: (key: keyof PortfolioTextMap, value: string) => void
  reorderSections: (newOrder: SectionConfig[]) => void
  toggleSectionVisibility: (sectionKey: SectionKey) => void
  updateSectionSpan: (sectionKey: SectionKey, span: BentoSpan) => void
  updateSnapshot: (updater: (prev: PortfolioStateSnapshot) => PortfolioStateSnapshot) => void
  upsertPlanet: (planet: PlanetDefinition) => void
  deletePlanet: (index: number) => void
  upsertProject: (project: ProjectItem) => void
  deleteProject: (id: string) => void
  addMediaAsset: (asset: MediaAsset) => void
  deleteMediaAsset: (id: string) => void
  saveSnapshot: () => Promise<void>
  resetSnapshot: () => Promise<void>
  executeAgentAction: (action: AgentUIAction) => void
  isSaving: boolean
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

export function PortfolioStoreProvider({
  initialSnapshot,
  initialPersistence,
  initialIsAdmin = false,
  children,
}: {
  initialSnapshot: PortfolioStateSnapshot
  initialPersistence: 'drizzle' | 'local-file' | 'fallback'
  initialIsAdmin?: boolean
  children: React.ReactNode
}) {
  const [snapshot, setSnapshot] = useState<PortfolioStateSnapshot>(initialSnapshot)
  const [persistence] = useState<'drizzle' | 'local-file' | 'fallback'>(initialPersistence)
  const [isAdmin, setIsAdmin] = useState<boolean>(initialIsAdmin)
  const [persona, setPersonaState] = useState<PersonaId>('all')
  const [projectFilter, setProjectFilter] = useState<string>('All')
  const [avatarMood, setAvatarMood] = useState<AvatarMood>('idle')
  const [audioLevel, setAudioLevel] = useState<number>(0)
  const [inlineEditMode, setInlineEditMode] = useState(false)
  const [inspectMode, setInspectMode] = useState(false)
  const [resumeTailorOpen, setResumeTailorOpen] = useState(false)
  const [voiceDrawerOpen, setVoiceDrawerOpen] = useState(false)
  const [commandBarOpen, setCommandBarOpen] = useState(false)
  const [freeLook3D, setFreeLook3D] = useState(false)
  const [wireframe3D, setWireframe3D] = useState(false)
  // Terrestrial Home is the welcoming default on load
  const [layoutStyle, setLayoutStyle] = useState<'odyssey' | 'editorial'>('editorial')
  const [rocketTransition, setRocketTransition] = useState<RocketTransitionPhase>('idle')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSector, setActiveSector] = useState(0)
  const [isWarping, setIsWarping] = useState(false)
  const [selectedPlanetNode, setSelectedPlanetNode] = useState<string | null>(null)
  const [hologramHidden, setHologramHidden] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const warpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rocketSwitchRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rocketEndRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (warpTimerRef.current) clearTimeout(warpTimerRef.current)
      if (rocketSwitchRef.current) clearTimeout(rocketSwitchRef.current)
      if (rocketEndRef.current) clearTimeout(rocketEndRef.current)
    }
  }, [])

  // Sync admin status & allow URL query ?mode=space shortcut
  useEffect(() => {
    fetch('/api/admin/auth')
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.authenticated === 'boolean') setIsAdmin(d.authenticated)
      })
      .catch(() => {})

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('mode') === 'space') {
        setLayoutStyle('odyssey')
      }
    }
  }, [])

  // Global keyboard shortcuts: Cmd/Ctrl+K (AI Command Bar)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandBarOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const launchToSpace = useCallback(() => {
    if (rocketTransition !== 'idle') return
    setRocketTransition('launch')
    if (rocketSwitchRef.current) clearTimeout(rocketSwitchRef.current)
    if (rocketEndRef.current) clearTimeout(rocketEndRef.current)

    rocketSwitchRef.current = setTimeout(() => {
      setLayoutStyle('odyssey')
      setActiveSector(0)
      setHologramHidden(false)
      setFreeLook3D(false)
    }, 1700)

    rocketEndRef.current = setTimeout(() => {
      setRocketTransition('idle')
    }, 2400)
  }, [rocketTransition])

  const landOnEarth = useCallback(() => {
    if (rocketTransition !== 'idle') return
    setRocketTransition('land')
    if (rocketSwitchRef.current) clearTimeout(rocketSwitchRef.current)
    if (rocketEndRef.current) clearTimeout(rocketEndRef.current)

    rocketSwitchRef.current = setTimeout(() => {
      setLayoutStyle('editorial')
      setFreeLook3D(false)
      setHologramHidden(false)
      window.scrollTo({ top: 0 })
    }, 1700)

    rocketEndRef.current = setTimeout(() => {
      setRocketTransition('idle')
    }, 2400)
  }, [rocketTransition])

  const skipRocketTransition = useCallback(() => {
    if (rocketSwitchRef.current) clearTimeout(rocketSwitchRef.current)
    if (rocketEndRef.current) clearTimeout(rocketEndRef.current)
    if (rocketTransition === 'launch') {
      setLayoutStyle('odyssey')
      setActiveSector(0)
    } else if (rocketTransition === 'land') {
      setLayoutStyle('editorial')
    }
    setRocketTransition('idle')
  }, [rocketTransition])

  const setAvatarMode = useCallback((mode: AvatarMode) => {
    setSnapshot((prev) => ({
      ...prev,
      avatarMode: mode,
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const setPersona = useCallback((nextPersona: PersonaId) => {
    setPersonaState(nextPersona)
    if (nextPersona === 'research') {
      setProjectFilter('ODU Research')
      setAvatarMood('coding')
    } else if (nextPersona === 'recruiter') {
      setProjectFilter('All')
      setAvatarMood('idle')
    } else if (nextPersona === 'client') {
      setProjectFilter('Sold & Client')
      setAvatarMood('celebrating')
    } else if (nextPersona === 'engineer') {
      setProjectFilter('AI & SaaS')
      setAvatarMood('coding')
    } else {
      setProjectFilter('All')
      setAvatarMood('idle')
    }
  }, [])

  const updateSnapshot = useCallback(
    (updater: (prev: PortfolioStateSnapshot) => PortfolioStateSnapshot) => {
      setSnapshot((prev) => updater({ ...prev, updatedAt: new Date().toISOString() }))
    },
    []
  )

  const updateText = useCallback((key: keyof PortfolioTextMap, value: string) => {
    setSnapshot((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      texts: { ...prev.texts, [key]: value },
    }))
  }, [])

  const reorderSections = useCallback((newOrder: SectionConfig[]) => {
    setSnapshot((prev) => ({
      ...prev,
      sections: newOrder.map((sec, idx) => ({ ...sec, order: idx })),
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const toggleSectionVisibility = useCallback((sectionKey: SectionKey) => {
    setSnapshot((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.sectionKey === sectionKey ? { ...s, visible: !s.visible } : s
      ),
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const updateSectionSpan = useCallback((sectionKey: SectionKey, bentoSpan: BentoSpan) => {
    setSnapshot((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.sectionKey === sectionKey ? { ...s, bentoSpan } : s
      ),
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const upsertPlanet = useCallback((planet: PlanetDefinition) => {
    setSnapshot((prev) => {
      const exists = prev.planets.some((p) => p.index === planet.index)
      const planets = exists
        ? prev.planets.map((p) => (p.index === planet.index ? planet : p))
        : [...prev.planets, planet]
      return {
        ...prev,
        planets: planets.map((p, idx) => ({ ...p, index: idx })),
        updatedAt: new Date().toISOString(),
      }
    })
  }, [])

  const deletePlanet = useCallback((index: number) => {
    setSnapshot((prev) => {
      const filtered = prev.planets
        .filter((p) => p.index !== index)
        .map((p, idx) => ({ ...p, index: idx }))
      return {
        ...prev,
        planets: filtered,
        updatedAt: new Date().toISOString(),
      }
    })
  }, [])

  const upsertProject = useCallback((project: ProjectItem) => {
    setSnapshot((prev) => {
      const exists = prev.projects.some((p) => p.id === project.id)
      const projects = exists
        ? prev.projects.map((p) => (p.id === project.id ? project : p))
        : [project, ...prev.projects]
      return {
        ...prev,
        projects,
        updatedAt: new Date().toISOString(),
      }
    })
  }, [])

  const deleteProject = useCallback((id: string) => {
    setSnapshot((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const addMediaAsset = useCallback((asset: MediaAsset) => {
    setSnapshot((prev) => ({
      ...prev,
      mediaGallery: [asset, ...prev.mediaGallery],
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const deleteMediaAsset = useCallback((id: string) => {
    setSnapshot((prev) => ({
      ...prev,
      mediaGallery: prev.mediaGallery.filter((m) => m.id !== id),
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const saveSnapshot = useCallback(async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/cms/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save portfolio state')
      }
      setAvatarMood('celebrating')
      toast.success(data.message || 'Changes published globally!')
      setTimeout(() => setAvatarMood('idle'), 2000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }, [snapshot])

  const resetSnapshot = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/sections', { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Admin access required')
      }
      setSnapshot(createInitialSnapshot())
      toast.info('Reset portfolio state to factory defaults')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed')
    }
  }, [])

  const warpToPlanet = useCallback(
    (index: number) => {
      const total = Math.max(1, snapshot.planets.length)
      const clamped = Math.max(0, Math.min(total - 1, index))
      setActiveSector(clamped)
      setScrollProgress(total > 1 ? clamped / (total - 1) : 0)
      setSelectedPlanetNode(null)
      setHologramHidden(false)
      setIsWarping(true)
      if (warpTimerRef.current) clearTimeout(warpTimerRef.current)
      warpTimerRef.current = setTimeout(() => {
        setIsWarping(false)
      }, 550)
    },
    [snapshot.planets.length]
  )

  const executeAgentAction = useCallback(
    (action: AgentUIAction) => {
      if (action.type === 'scrollTo' && action.payload) {
        const targetIdx = snapshot.planets.findIndex((p) => p.sectionKey === action.payload)
        if (layoutStyle === 'odyssey' && targetIdx !== -1) {
          warpToPlanet(targetIdx)
        } else {
          const el = document.getElementById(`section-${action.payload}`)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      } else if (action.type === 'setPersona' && action.payload) {
        setPersona(action.payload as PersonaId)
      } else if (action.type === 'filterProjects' && action.payload) {
        setProjectFilter(action.payload)
        const projIdx = snapshot.planets.findIndex((p) => p.sectionKey === 'projects')
        if (layoutStyle === 'odyssey' && projIdx !== -1) {
          warpToPlanet(projIdx)
        } else {
          const el = document.getElementById('section-projects')
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      } else if (action.type === 'setAvatarMode' && action.payload) {
        setAvatarMode(action.payload as AvatarMode)
      } else if (action.type === 'setAvatarMood' && action.payload) {
        setAvatarMood(action.payload as AvatarMood)
      } else if (action.type === 'openResumeTailor') {
        setResumeTailorOpen(true)
      }
    },
    [layoutStyle, setAvatarMode, setPersona, snapshot.planets, warpToPlanet]
  )

  return (
    <PortfolioContext.Provider
      value={{
        snapshot,
        persistence,
        isAdmin,
        setIsAdmin,
        persona,
        setPersona,
        projectFilter,
        setProjectFilter,
        avatarMode: snapshot.avatarMode,
        setAvatarMode,
        avatarMood,
        setAvatarMood,
        audioLevel,
        setAudioLevel,
        inlineEditMode,
        setInlineEditMode,
        inspectMode,
        setInspectMode,
        resumeTailorOpen,
        setResumeTailorOpen,
        voiceDrawerOpen,
        setVoiceDrawerOpen,
        commandBarOpen,
        setCommandBarOpen,
        freeLook3D,
        setFreeLook3D,
        wireframe3D,
        setWireframe3D,
        layoutStyle,
        setLayoutStyle,
        rocketTransition,
        launchToSpace,
        landOnEarth,
        skipRocketTransition,
        scrollProgress,
        setScrollProgress,
        activeSector,
        setActiveSector,
        isWarping,
        selectedPlanetNode,
        setSelectedPlanetNode,
        hologramHidden,
        setHologramHidden,
        warpToPlanet,
        updateText,
        reorderSections,
        toggleSectionVisibility,
        updateSectionSpan,
        updateSnapshot,
        upsertPlanet,
        deletePlanet,
        upsertProject,
        deleteProject,
        addMediaAsset,
        deleteMediaAsset,
        saveSnapshot,
        resetSnapshot,
        executeAgentAction,
        isSaving,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolioStore() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) {
    throw new Error('usePortfolioStore must be used inside PortfolioStoreProvider')
  }
  return ctx
}
