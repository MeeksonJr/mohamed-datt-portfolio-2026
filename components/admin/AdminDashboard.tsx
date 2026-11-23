'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Lock,
  Unlock,
  Globe,
  FolderGit2,
  Image as ImageIcon,
  Type,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  ArrowLeft,
  GripVertical,
  Eye,
  EyeOff,
  Loader2,
  Rocket,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { PortfolioStoreProvider, usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import type { PlanetDefinition } from '@/lib/content/planets'
import type {
  BentoSpan,
  PortfolioStateSnapshot,
  PortfolioTextMap,
  ProjectItem,
  SectionConfig,
} from '@/lib/content/types'
import { cn } from '@/lib/utils'

function SortableSectionItem({
  section,
  onToggle,
  onSpanChange,
}: {
  section: SectionConfig
  onToggle: () => void
  onSpanChange: (span: BentoSpan) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center justify-between gap-2 rounded-xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-3',
        !section.visible && 'opacity-50'
      )}
    >
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab rounded p-1 text-[#A39E93] hover:text-white"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div>
          <p className="text-xs font-bold text-[#F5EFE2]">{section.title}</p>
          <p className="font-mono text-[10px] text-[#9CA3AF]">{section.badge}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={section.bentoSpan}
          onChange={(e) => onSpanChange(e.target.value as BentoSpan)}
          className="rounded-lg border border-[#E6DEC8]/15 bg-[#121625] px-2 py-1 font-mono text-[10px] text-[#F5EFE2]"
        >
          <option value="full">Full Width</option>
          <option value="2x1">Wide (2 Col)</option>
          <option value="1x1">Compact (1 Col)</option>
        </select>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg border border-[#E6DEC8]/15 p-1.5 text-[#E6DEC8] cursor-pointer"
        >
          {section.visible ? <Eye className="h-3.5 w-3.5 text-[#2DD4BF]" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}

function AdminCenterInner() {
  const {
    snapshot,
    persistence,
    isAdmin,
    setIsAdmin,
    setAvatarMode,
    reorderSections,
    toggleSectionVisibility,
    updateSectionSpan,
    upsertPlanet,
    deletePlanet,
    upsertProject,
    deleteProject,
    addMediaAsset,
    deleteMediaAsset,
    updateText,
    saveSnapshot,
    resetSnapshot,
    isSaving,
  } = usePortfolioStore()

  const [passcodeInput, setPasscodeInput] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [activeTab, setActiveTab] = useState<'planets' | 'projects' | 'media' | 'copy'>('planets')

  // Planet editing state
  const [selectedPlanetIdx, setSelectedPlanetIdx] = useState(0)
  const [newPlanetName, setNewPlanetName] = useState('')
  const [newPlanetCode, setNewPlanetCode] = useState('09')
  const [newPlanetShort, setNewPlanetShort] = useState('NOVA')
  const [newPlanetStyle, setNewPlanetStyle] = useState<PlanetDefinition['customStyle']>('terracotta')

  // New project form state
  const [newProjTitle, setNewProjTitle] = useState('')
  const [newProjTagline, setNewProjTagline] = useState('')
  const [newProjDesc, setNewProjDesc] = useState('')
  const [newProjCat, setNewProjCat] = useState<ProjectItem['category']>('AI & SaaS')
  const [newProjStatus, setNewProjStatus] = useState<ProjectItem['status']>('live')
  const [newProjStack, setNewProjStack] = useState('Next.js 16, Three.js, Gemini AI')
  const [newProjGithub, setNewProjGithub] = useState('https://github.com/MeeksonJr')
  const [newProjImage, setNewProjImage] = useState('')

  // Media upload state
  const [uploading, setUploading] = useState(false)
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaLabel, setNewMediaLabel] = useState('')
  const [newMediaCategory, setNewMediaCategory] = useState<'portrait' | 'project' | 'planet'>('project')

  // AI copy rewriting state
  const [rewritingKey, setRewritingKey] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passcodeInput.trim()) return
    setIsAuthenticating(true)
    setAuthError(null)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput }),
      })
      const data = await res.json()
      if (!res.ok || !data.authenticated) {
        setAuthError(data.error || 'Access denied')
        return
      }
      setPasscodeInput('')
      setIsAdmin(true)
      toast.success('Admin Vault unlocked')
    } catch {
      setAuthError('Unable to verify credentials')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleLock = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    setIsAdmin(false)
    toast.info('Admin Vault locked')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = snapshot.sections.findIndex((s) => s.id === active.id)
    const newIndex = snapshot.sections.findIndex((s) => s.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderSections(arrayMove(snapshot.sections, oldIndex, newIndex))
    }
  }

  const handleAddPlanet = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlanetName.trim()) return
    const nextIdx = snapshot.planets.length
    const xOffset = nextIdx % 2 === 0 ? -17 : 19
    const zOffset = -110 - (nextIdx - 7) * 16
    const customPlanet: PlanetDefinition = {
      index: nextIdx,
      sectionKey: 'projects',
      code: newPlanetCode || `0${nextIdx + 1}`,
      shortName: newPlanetShort.toUpperCase() || 'CUSTOM',
      planetName: newPlanetName.trim(),
      coordsLabel: `${xOffset}.0 / +1.5 / ${zOffset}.0`,
      position: [xOffset, 1.5, zOffset],
      accentColor: '#E06D43',
      secondaryColor: '#2DD4BF',
      description: 'Custom planetary world configured via Admin Command Center.',
      customStyle: newPlanetStyle,
      isCustom: true,
      visible: true,
      moons: [
        { id: 'custom-m1', label: 'Primary Orbit', color: '#F2A65A', radius: 2.5, speed: 0.3, offset: 0, y: 0.6 },
        { id: 'custom-m2', label: 'Telemetry Node', color: '#2DD4BF', radius: 2.7, speed: 0.25, offset: 2.4, y: -0.3 },
      ],
    }
    upsertPlanet(customPlanet)
    setNewPlanetName('')
    setSelectedPlanetIdx(nextIdx)
    toast.success(`Added planet "${customPlanet.planetName}" — click Publish All Changes to persist`)
  }

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjTitle.trim()) return
    const item: ProjectItem = {
      id: `proj-${Date.now()}`,
      slug: newProjTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: newProjTitle.trim(),
      tagline: newProjTagline.trim() || 'Production Full-Stack Build',
      description: newProjDesc.trim() || 'Built and shipped from concept to live deployment.',
      category: newProjCat,
      status: newProjStatus,
      techStack: newProjStack.split(',').map((s) => s.trim()).filter(Boolean),
      metrics: ['Production Architecture', '2026–2027 Portfolio Flagship'],
      githubUrl: newProjGithub.trim() || 'https://github.com/MeeksonJr',
      imageUrl: newProjImage || undefined,
      featured: true,
      architectureNotes: newProjDesc.trim() || 'Modular Next.js + AI system.',
    }
    upsertProject(item)
    setNewProjTitle('')
    setNewProjTagline('')
    setNewProjDesc('')
    toast.success(`Added project "${item.title}"`)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      addMediaAsset({
        id: `img-${Date.now()}`,
        url: data.url,
        label: newMediaLabel || file.name,
        category: newMediaCategory,
      })
      setNewMediaLabel('')
      toast.success(`Uploaded ${file.name} to Media Library`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleRewriteWithGemini = async (key: keyof PortfolioTextMap, tone: 'Executive' | 'Technical' | 'Punchy' | 'Academic') => {
    setRewritingKey(key)
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: snapshot.texts[key], tone, field: key }),
      })
      const data = await res.json()
      if (data.rewritten) {
        updateText(key, data.rewritten)
        toast.success(`Rewritten in ${tone} tone`)
      }
    } catch {
      toast.error('AI rewrite unavailable')
    } finally {
      setRewritingKey(null)
    }
  }

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mohamed-portfolio-admin-backup.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#181C2E] px-4 text-[#F5EFE2]">
        <div className="w-full max-w-md rounded-3xl border border-[#E6DEC8]/15 bg-[#1F243B]/90 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E06D43]/20 text-[#F2A65A] ring-1 ring-[#E06D43]/40">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">Admin Command Vault</h1>
                <p className="font-mono text-[11px] text-[#A39E93]">
                  Protected by Salted Scrypt + HttpOnly HMAC
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="rounded-xl border border-[#E6DEC8]/15 p-2 text-[#E6DEC8] hover:bg-white/10"
              title="Back to Portfolio"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[11px] uppercase tracking-wider text-[#B8B2A6]">
                Vault Passcode
              </label>
              <input
                type="password"
                autoFocus
                required
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter passcode to unlock..."
                className="w-full rounded-xl border border-[#E6DEC8]/20 bg-[#121625] px-4 py-3 font-mono text-sm text-white outline-none focus:border-[#E06D43]"
              />
            </div>

            {authError && (
              <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E06D43] to-[#C85A32] py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
            >
              {isAuthenticating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
              {isAuthenticating ? 'Verifying Digest...' : 'Unlock Admin Center'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const activePlanet = snapshot.planets[selectedPlanetIdx] || snapshot.planets[0]

  return (
    <div className="min-h-screen bg-[#181C2E] text-[#F5EFE2]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-[#E6DEC8]/15 bg-[#15192B]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="MD Logo" className="h-9 w-9 rounded-lg" />
            <div>
              <h1 className="font-display text-lg font-bold">
                Horizon Command Center • Admin
              </h1>
              <p className="font-mono text-[10px] text-[#2DD4BF]">
                Store: {persistence} • {snapshot.planets.length} Planets • {snapshot.projects.length} Projects • {snapshot.mediaGallery.length} Images
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl border border-[#E6DEC8]/20 px-3 py-2 text-xs font-semibold hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Terrestrial Home
            </Link>
            <Link
              href="/?mode=space"
              className="flex items-center gap-1.5 rounded-xl border border-[#2DD4BF]/40 bg-[#2DD4BF]/15 px-3 py-2 text-xs font-semibold text-[#5EEAD4]"
            >
              <Rocket className="h-3.5 w-3.5" />
              3D Space View
            </Link>
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 rounded-xl border border-[#E6DEC8]/20 px-3 py-2 text-xs font-medium hover:bg-white/10 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              type="button"
              onClick={resetSnapshot}
              className="flex items-center gap-1.5 rounded-xl border border-[#E6DEC8]/20 px-3 py-2 text-xs font-medium hover:bg-white/10 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={saveSnapshot}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E06D43] to-[#C85A32] px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? 'Publishing...' : 'Publish All Changes'}
            </button>
            <button
              type="button"
              onClick={handleLock}
              className="flex items-center gap-1.5 rounded-xl border border-rose-400/35 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-200 cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              Lock
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#E6DEC8]/10 pb-3">
          {[
            { id: 'planets', label: 'Planets, 3D Globes & Layout', icon: Globe },
            { id: 'projects', label: 'Projects & Sold SaaS', icon: FolderGit2 },
            { id: 'media', label: 'Images & Uploads', icon: ImageIcon },
            { id: 'copy', label: 'Global Copy & Gemini AI', icon: Type },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer',
                  active
                    ? 'bg-[#E06D43] text-white shadow-md'
                    : 'border border-[#E6DEC8]/15 bg-white/[0.03] text-[#D5CFC2] hover:bg-white/[0.08]'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* TAB 1: PLANETS, 3D GLOBES & LAYOUT */}
        {activeTab === 'planets' && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Planet Selector & Add New Planet */}
            <div className="space-y-4 lg:col-span-5">
              <div className="rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-4 space-y-3">
                <h2 className="font-display text-sm font-bold">
                  Prime 3D Centerpiece Preset (Planet 01)
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'companion', label: 'Monolith Rig' },
                      { id: 'neural', label: 'Event Horizon' },
                      { id: 'workstation', label: 'Mars Globe' },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setAvatarMode(mode.id)}
                      className={cn(
                        'rounded-xl border py-2 font-mono text-[11px] font-semibold cursor-pointer',
                        snapshot.avatarMode === mode.id
                          ? 'border-[#E06D43] bg-[#E06D43]/25 text-[#F2A65A]'
                          : 'border-[#E6DEC8]/15 text-[#B8B2A6]'
                      )}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-4 space-y-2.5">
                <h2 className="font-display text-sm font-bold">
                  3D Star System Planets ({snapshot.planets.length})
                </h2>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {snapshot.planets.map((p, idx) => (
                    <div
                      key={`${p.code}-${idx}`}
                      className={cn(
                        'flex items-center justify-between rounded-xl border px-3 py-2 text-xs',
                        selectedPlanetIdx === idx
                          ? 'border-[#E06D43] bg-[#E06D43]/15'
                          : 'border-[#E6DEC8]/10 bg-black/20'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedPlanetIdx(idx)}
                        className="flex flex-1 items-center gap-2 text-left cursor-pointer"
                      >
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: p.accentColor }}
                        />
                        <span className="font-mono text-[10px] text-[#F2A65A]">{p.code}</span>
                        <span className="font-semibold">{p.planetName}</span>
                      </button>
                      {p.isCustom && (
                        <button
                          type="button"
                          onClick={() => deletePlanet(idx)}
                          className="text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom Planet */}
              <form
                onSubmit={handleAddPlanet}
                className="rounded-2xl border border-[#2DD4BF]/30 bg-[#1E2336]/75 p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#2DD4BF]" />
                  <h3 className="font-display text-sm font-bold">Add New 3D Planet</h3>
                </div>
                <input
                  type="text"
                  required
                  value={newPlanetName}
                  onChange={(e) => setNewPlanetName(e.target.value)}
                  placeholder="Planet Name (e.g., Quantum Lab World)"
                  className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-xs"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newPlanetCode}
                    onChange={(e) => setNewPlanetCode(e.target.value)}
                    placeholder="Code (09)"
                    className="rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-2 font-mono text-xs"
                  />
                  <input
                    type="text"
                    value={newPlanetShort}
                    onChange={(e) => setNewPlanetShort(e.target.value)}
                    placeholder="Short (NOVA)"
                    className="rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-2 font-mono text-xs"
                  />
                  <select
                    value={newPlanetStyle}
                    onChange={(e) => setNewPlanetStyle(e.target.value as PlanetDefinition['customStyle'])}
                    className="rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2 py-2 text-xs"
                  >
                    <option value="terracotta">Terracotta Ring</option>
                    <option value="teal-pulsar">Teal Pulsar</option>
                    <option value="dyson-ring">Dyson Lattice</option>
                    <option value="golden-crystal">Golden Crystal</option>
                    <option value="mars-globe">Mars Globe</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#2DD4BF] py-2 text-xs font-bold text-[#111827] cursor-pointer"
                >
                  + Spawn Planet in Star System
                </button>
              </form>
            </div>

            {/* Active Planet Editor & Section Rearrangement */}
            <div className="space-y-5 lg:col-span-7">
              {activePlanet && (
                <div className="rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-5 space-y-4">
                  <h3 className="font-display text-base font-bold">
                    Edit Planet {activePlanet.code}: {activePlanet.planetName}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#B8B2A6]">Planet Display Name</label>
                      <input
                        type="text"
                        value={activePlanet.planetName}
                        onChange={(e) =>
                          upsertPlanet({ ...activePlanet, planetName: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#B8B2A6]">Short Dock Tag</label>
                      <input
                        type="text"
                        value={activePlanet.shortName}
                        onChange={(e) =>
                          upsertPlanet({ ...activePlanet, shortName: e.target.value.toUpperCase() })
                        }
                        className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                      <div key={axis} className="space-y-1">
                        <label className="font-mono text-[10px] text-[#B8B2A6]">Pos {axis}</label>
                        <input
                          type="number"
                          step="0.5"
                          value={activePlanet.position[i]}
                          onChange={(e) => {
                            const nextPos = [...activePlanet.position] as [number, number, number]
                            nextPos[i] = Number(e.target.value) || 0
                            upsertPlanet({
                              ...activePlanet,
                              position: nextPos,
                              coordsLabel: `${nextPos[0].toFixed(1)} / ${nextPos[1].toFixed(1)} / ${nextPos[2].toFixed(1)}`,
                            })
                          }}
                          className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-2 font-mono text-xs"
                        />
                      </div>
                    ))}
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] text-[#B8B2A6]">Accent</label>
                      <input
                        type="color"
                        value={activePlanet.accentColor}
                        onChange={(e) =>
                          upsertPlanet({ ...activePlanet, accentColor: e.target.value })
                        }
                        className="h-9 w-full cursor-pointer rounded-xl border border-[#E6DEC8]/15 bg-[#121625] p-1"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] text-[#B8B2A6]">Secondary</label>
                      <input
                        type="color"
                        value={activePlanet.secondaryColor}
                        onChange={(e) =>
                          upsertPlanet({ ...activePlanet, secondaryColor: e.target.value })
                        }
                        className="h-9 w-full cursor-pointer rounded-xl border border-[#E6DEC8]/15 bg-[#121625] p-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-5 space-y-3">
                <h3 className="font-display text-base font-bold">
                  Rearrange Sections & Bento Widths
                </h3>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={snapshot.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {snapshot.sections.map((sec) => (
                        <SortableSectionItem
                          key={sec.id}
                          section={sec}
                          onToggle={() => toggleSectionVisibility(sec.sectionKey)}
                          onSpanChange={(span) => updateSectionSpan(sec.sectionKey, span)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROJECTS & SOLD SAAS */}
        {activeTab === 'projects' && (
          <div className="grid gap-6 lg:grid-cols-12">
            <form
              onSubmit={handleAddProject}
              className="space-y-3 rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-5 lg:col-span-5"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#E06D43]" />
                <h2 className="font-display text-base font-bold">Add New Project</h2>
              </div>
              <input
                type="text"
                required
                value={newProjTitle}
                onChange={(e) => setNewProjTitle(e.target.value)}
                placeholder="Project Title"
                className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-xs"
              />
              <input
                type="text"
                value={newProjTagline}
                onChange={(e) => setNewProjTagline(e.target.value)}
                placeholder="Tagline"
                className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-xs"
              />
              <textarea
                rows={3}
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                placeholder="Project Description & Impact"
                className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] p-3 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newProjCat}
                  onChange={(e) => setNewProjCat(e.target.value as ProjectItem['category'])}
                  className="rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-2 text-xs"
                >
                  <option value="AI & SaaS">AI & SaaS</option>
                  <option value="ODU Research">ODU Research</option>
                  <option value="Mobile & Systems">Mobile & Systems</option>
                  <option value="Sold & Client">Sold & Client</option>
                </select>
                <select
                  value={newProjStatus}
                  onChange={(e) => setNewProjStatus(e.target.value as ProjectItem['status'])}
                  className="rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-2 text-xs"
                >
                  <option value="live">live</option>
                  <option value="sold">sold</option>
                  <option value="research">research</option>
                  <option value="beta">beta</option>
                </select>
              </div>
              <input
                type="text"
                value={newProjStack}
                onChange={(e) => setNewProjStack(e.target.value)}
                placeholder="Tech stack (comma separated)"
                className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-xs"
              />
              <input
                type="url"
                value={newProjGithub}
                onChange={(e) => setNewProjGithub(e.target.value)}
                placeholder="GitHub Repo URL"
                className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-xs"
              />
              <select
                value={newProjImage}
                onChange={(e) => setNewProjImage(e.target.value)}
                className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-xs"
              >
                <option value="">No screenshot (Use Technical Card)</option>
                {snapshot.mediaGallery.map((m) => (
                  <option key={m.id} value={m.url}>
                    {m.label} ({m.url})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#E06D43] py-2.5 text-xs font-bold text-white cursor-pointer"
              >
                + Add Project to Portfolio
              </button>
            </form>

            <div className="space-y-3 lg:col-span-7">
              {snapshot.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-4"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#E06D43]/20 px-2 py-0.5 font-mono text-[10px] text-[#F2A65A]">
                        {proj.category}
                      </span>
                      <h3 className="font-display text-sm font-bold">{proj.title}</h3>
                    </div>
                    <p className="text-xs text-[#D5CFC2]">{proj.tagline}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.techStack.map((t) => (
                        <span key={t} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteProject(proj.id)}
                    className="rounded-lg border border-rose-400/30 p-2 text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: IMAGES & MEDIA LIBRARY */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="grid gap-4 rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-5 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="font-display text-base font-bold">Upload New Image File</h2>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newMediaLabel}
                    onChange={(e) => setNewMediaLabel(e.target.value)}
                    placeholder="Image Caption / Label"
                    className="rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-xs"
                  />
                  <select
                    value={newMediaCategory}
                    onChange={(e) => setNewMediaCategory(e.target.value as 'portrait' | 'project' | 'planet')}
                    className="rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-xs"
                  >
                    <option value="portrait">Portrait / Story Gallery</option>
                    <option value="project">Project Screenshot</option>
                    <option value="planet">Planet Texture</option>
                  </select>
                </div>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#E06D43]/50 bg-[#E06D43]/10 py-4 text-xs font-semibold text-[#F2A65A] hover:bg-[#E06D43]/20">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? 'Uploading...' : 'Select PNG / JPG / WEBP / SVG to Upload'}
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-base font-bold">Add Image via URL</h2>
                <input
                  type="text"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://... or /images/..."
                  className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newMediaUrl.trim()) return
                    addMediaAsset({
                      id: `img-${Date.now()}`,
                      url: newMediaUrl.trim(),
                      label: newMediaLabel || 'External Asset',
                      category: newMediaCategory,
                    })
                    setNewMediaUrl('')
                    setNewMediaLabel('')
                    toast.success('Added image URL to gallery')
                  }}
                  className="w-full rounded-xl bg-[#2DD4BF] py-2.5 text-xs font-bold text-[#111827] cursor-pointer"
                >
                  + Add Image URL
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {snapshot.mediaGallery.map((img) => (
                <div
                  key={img.id}
                  className="overflow-hidden rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75"
                >
                  <div className="aspect-video bg-[#121625]">
                    <img src={img.url} alt={img.label} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">{img.label}</p>
                      <p className="font-mono text-[10px] text-[#2DD4BF]">{img.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMediaAsset(img.id)}
                      className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GLOBAL COPY & GEMINI REWRITE */}
        {activeTab === 'copy' && (
          <div className="grid gap-4 md:grid-cols-2">
            {(Object.keys(snapshot.texts) as Array<keyof PortfolioTextMap>).map((key) => (
              <div
                key={key}
                className="space-y-2 rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-mono text-[11px] font-bold uppercase text-[#F2A65A]">
                    {key}
                  </label>
                  <div className="flex items-center gap-1">
                    {(['Executive', 'Technical', 'Punchy'] as const).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        disabled={rewritingKey === key}
                        onClick={() => handleRewriteWithGemini(key, tone)}
                        className="flex items-center gap-1 rounded-full border border-[#2DD4BF]/35 bg-[#2DD4BF]/10 px-2 py-0.5 font-mono text-[9px] text-[#5EEAD4] hover:bg-[#2DD4BF]/25 cursor-pointer"
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={snapshot.texts[key]}
                  onChange={(e) => updateText(key, e.target.value)}
                  className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] p-3 text-xs text-white outline-none focus:border-[#E06D43]"
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function AdminDashboard({
  initialSnapshot,
  initialPersistence,
  initialIsAdmin,
}: {
  initialSnapshot: PortfolioStateSnapshot
  initialPersistence: 'drizzle' | 'local-file' | 'fallback'
  initialIsAdmin: boolean
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <PortfolioStoreProvider
        initialSnapshot={initialSnapshot}
        initialPersistence={initialPersistence}
        initialIsAdmin={initialIsAdmin}
      >
        <AdminCenterInner />
        <Toaster position="top-center" richColors />
      </PortfolioStoreProvider>
    </ThemeProvider>
  )
}
