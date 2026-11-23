'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
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
  ArrowUp,
  ArrowDown,
  GripVertical,
  Eye,
  EyeOff,
  Loader2,
  Rocket,
  Download,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Pencil,
  X,
  Search,
  MoreHorizontal,
  ShieldCheck,
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

const TEXT_FIELD_LABELS: Record<keyof PortfolioTextMap, { label: string; group: string }> = {
  heroEyebrow: { label: 'Hero Availability Badge', group: 'Hero' },
  heroHeadline: { label: 'Hero Display Headline', group: 'Hero' },
  heroSubheadline: { label: 'Hero Summary Paragraph', group: 'Hero' },
  heroPrimaryCta: { label: 'Primary CTA Button', group: 'Hero' },
  heroSecondaryCta: { label: 'Secondary CTA Button', group: 'Hero' },
  aboutTitle: { label: 'Origin & Story Heading', group: 'Origin' },
  aboutBio: { label: 'Origin Biography Narrative', group: 'Origin' },
  projectsTitle: { label: 'Projects Section Heading', group: 'Projects' },
  projectsSubtitle: { label: 'Projects Section Subtitle', group: 'Projects' },
  researchTitle: { label: 'ODU Lab Research Heading', group: 'Research' },
  researchSubtitle: { label: 'ODU Lab Research Subtitle', group: 'Research' },
  skillsTitle: { label: 'Technical Stack Heading', group: 'Skills' },
  servicesTitle: { label: 'Freelance & Studio Heading', group: 'Studio' },
  contactTitle: { label: 'Contact Section Heading', group: 'Contact' },
  contactSubtitle: { label: 'Contact Section Subtitle', group: 'Contact' },
}

const PROJECT_CATEGORIES: Array<'All' | ProjectItem['category']> = [
  'All',
  'AI & SaaS',
  'ODU Research',
  'Mobile & Systems',
  'Sold & Client',
]

const MEDIA_CATEGORIES = ['all', 'portrait', 'project', 'planet'] as const

const AI_TONES = ['Executive', 'Technical', 'Punchy', 'Academic'] as const

const STATUS_BADGE_STYLES: Record<ProjectItem['status'], string> = {
  live: 'border-emerald-400/35 bg-emerald-500/15 text-emerald-300',
  sold: 'border-amber-400/40 bg-amber-500/15 text-amber-300',
  research: 'border-teal-400/35 bg-teal-500/15 text-teal-300',
  beta: 'border-sky-400/35 bg-sky-500/15 text-sky-300',
}

interface SortableSectionItemProps {
  section: SectionConfig
  index: number
  total: number
  onToggle: () => void
  onSpanChange: (span: BentoSpan) => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function SortableSectionItem({
  section,
  index,
  total,
  onToggle,
  onSpanChange,
  onMoveUp,
  onMoveDown,
}: SortableSectionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
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
        'flex flex-col gap-2.5 rounded-xl border border-[#E6DEC8]/15 bg-[#1E2336]/80 p-3 sm:flex-row sm:items-center sm:justify-between',
        !section.visible && 'opacity-55',
        isDragging && 'z-20 border-[#E06D43] shadow-xl ring-1 ring-[#E06D43]/40'
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag ${section.title}`}
          className="flex min-h-[40px] min-w-[36px] touch-none cursor-grab items-center justify-center rounded-lg border border-white/10 bg-black/20 text-[#A39E93] hover:text-white active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-[#B8B2A6]">
              #{index + 1}
            </span>
            <p className="truncate text-xs font-bold text-[#F5EFE2]">{section.title}</p>
          </div>
          <p className="truncate font-mono text-[10px] text-[#9CA3AF]">{section.badge}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            aria-label={`Move ${section.title} up`}
            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-[#E6DEC8]/15 bg-[#121625] text-[#E6DEC8] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={onMoveDown}
            aria-label={`Move ${section.title} down`}
            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-[#E6DEC8]/15 bg-[#121625] text-[#E6DEC8] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:flex-initial">
          <select
            value={section.bentoSpan}
            onChange={(e) => onSpanChange(e.target.value as BentoSpan)}
            aria-label={`${section.title} width`}
            className="min-h-[40px] rounded-lg border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-1.5 font-mono text-base text-[#F5EFE2] sm:text-xs"
          >
            <option value="full">Full Width</option>
            <option value="2x1">Wide (2 Col)</option>
            <option value="1x1">Compact (1 Col)</option>
          </select>
          <button
            type="button"
            onClick={onToggle}
            aria-label={section.visible ? `Hide ${section.title}` : `Show ${section.title}`}
            className={cn(
              'flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border px-2.5 text-xs font-medium cursor-pointer',
              section.visible
                ? 'border-[#2DD4BF]/35 bg-[#2DD4BF]/10 text-[#2DD4BF]'
                : 'border-[#E6DEC8]/15 bg-[#121625] text-[#9CA3AF]'
            )}
          >
            {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

interface InlineProjectEditorProps {
  project: ProjectItem
  mediaGallery: PortfolioStateSnapshot['mediaGallery']
  onSave: (updated: ProjectItem) => void
  onCancel: () => void
}

function InlineProjectEditor({
  project,
  mediaGallery,
  onSave,
  onCancel,
}: InlineProjectEditorProps) {
  const [title, setTitle] = useState(project.title)
  const [tagline, setTagline] = useState(project.tagline)
  const [description, setDescription] = useState(project.description)
  const [category, setCategory] = useState<ProjectItem['category']>(project.category)
  const [status, setStatus] = useState<ProjectItem['status']>(project.status)
  const [saleBadge, setSaleBadge] = useState(project.saleBadge || '')
  const [stackText, setStackText] = useState(project.techStack.join(', '))
  const [githubUrl, setGithubUrl] = useState(project.githubUrl)
  const [liveUrl, setLiveUrl] = useState(project.liveUrl || '')
  const [imageUrl, setImageUrl] = useState(project.imageUrl || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      ...project,
      title: title.trim(),
      tagline: tagline.trim() || project.tagline,
      description: description.trim() || project.description,
      category,
      status,
      saleBadge: saleBadge.trim() || undefined,
      techStack: stackText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      githubUrl: githubUrl.trim() || 'https://github.com/MeeksonJr',
      liveUrl: liveUrl.trim() || undefined,
      imageUrl: imageUrl || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t border-[#E6DEC8]/15 pt-3">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase text-[#B8B2A6]">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
          />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase text-[#B8B2A6]">Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="font-mono text-[10px] uppercase text-[#B8B2A6]">Description & Impact</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] p-3 text-base text-white sm:text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase text-[#B8B2A6]">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProjectItem['category'])}
            className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-2 text-base text-white sm:text-xs"
          >
            <option value="AI & SaaS">AI & SaaS</option>
            <option value="ODU Research">ODU Research</option>
            <option value="Mobile & Systems">Mobile & Systems</option>
            <option value="Sold & Client">Sold & Client</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase text-[#B8B2A6]">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectItem['status'])}
            className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-2 text-base text-white sm:text-xs"
          >
            <option value="live">live</option>
            <option value="sold">sold</option>
            <option value="research">research</option>
            <option value="beta">beta</option>
          </select>
        </div>
        <div className="col-span-2 space-y-1 sm:col-span-1">
          <label className="font-mono text-[10px] uppercase text-[#B8B2A6]">Badge (Optional)</label>
          <input
            type="text"
            value={saleBadge}
            onChange={(e) => setSaleBadge(e.target.value)}
            placeholder="e.g., ACQUIRED"
            className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="font-mono text-[10px] uppercase text-[#B8B2A6]">Tech Stack (comma separated)</label>
        <input
          type="text"
          value={stackText}
          onChange={(e) => setStackText(e.target.value)}
          className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
        />
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase text-[#B8B2A6]">GitHub URL</label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
          />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase text-[#B8B2A6]">Live URL (Optional)</label>
          <input
            type="url"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://..."
            className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="font-mono text-[10px] uppercase text-[#B8B2A6]">Preview Screenshot</label>
        <select
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
        >
          <option value="">No screenshot (Use Technical Card)</option>
          {mediaGallery.map((m) => (
            <option key={m.id} value={m.url}>
              {m.label} ({m.url})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[42px] rounded-xl border border-[#E6DEC8]/20 px-4 py-2 text-xs font-semibold text-[#D5CFC2] hover:bg-white/10 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#2DD4BF] px-4 py-2 text-xs font-bold text-[#111827] hover:brightness-110 cursor-pointer"
        >
          <Check className="h-3.5 w-3.5" />
          Save Project Update
        </button>
      </div>
    </form>
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

  // Vault Passcode Gate state
  const [passcodeInput, setPasscodeInput] = useState('')
  const [showPasscode, setShowPasscode] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  // Dashboard shell & tab navigation
  const [activeTab, setActiveTab] = useState<'planets' | 'projects' | 'media' | 'copy'>('planets')
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false)

  // Planet editing & creation state
  const [selectedPlanetIdx, setSelectedPlanetIdx] = useState(0)
  const [showAddPlanetForm, setShowAddPlanetForm] = useState(false)
  const [newPlanetName, setNewPlanetName] = useState('')
  const [newPlanetCode, setNewPlanetCode] = useState('09')
  const [newPlanetShort, setNewPlanetShort] = useState('NOVA')
  const [newPlanetStyle, setNewPlanetStyle] = useState<PlanetDefinition['customStyle']>('terracotta')

  // Projects state (creation, filtering, inline editing)
  const [showAddProjectForm, setShowAddProjectForm] = useState(false)
  const [projectCatFilter, setProjectCatFilter] = useState<'All' | ProjectItem['category']>('All')
  const [projectSearch, setProjectSearch] = useState('')
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [newProjTitle, setNewProjTitle] = useState('')
  const [newProjTagline, setNewProjTagline] = useState('')
  const [newProjDesc, setNewProjDesc] = useState('')
  const [newProjCat, setNewProjCat] = useState<ProjectItem['category']>('AI & SaaS')
  const [newProjStatus, setNewProjStatus] = useState<ProjectItem['status']>('live')
  const [newProjBadge, setNewProjBadge] = useState('')
  const [newProjStack, setNewProjStack] = useState('Next.js 16, Three.js, Gemini AI')
  const [newProjGithub, setNewProjGithub] = useState('https://github.com/MeeksonJr')
  const [newProjLiveUrl, setNewProjLiveUrl] = useState('')
  const [newProjImage, setNewProjImage] = useState('')

  // Media upload & library state
  const [uploading, setUploading] = useState(false)
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaLabel, setNewMediaLabel] = useState('')
  const [newMediaCategory, setNewMediaCategory] = useState<'portrait' | 'project' | 'planet'>('project')
  const [mediaFilter, setMediaFilter] = useState<(typeof MEDIA_CATEGORIES)[number]>('all')
  const [copiedMediaId, setCopiedMediaId] = useState<string | null>(null)

  // AI copy rewriting state
  const [rewritingKey, setRewritingKey] = useState<string | null>(null)
  const [copySearch, setCopySearch] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } })
  )

  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase()
    return snapshot.projects.filter((proj) => {
      const catMatch = projectCatFilter === 'All' || proj.category === projectCatFilter
      const searchMatch =
        !q ||
        proj.title.toLowerCase().includes(q) ||
        proj.tagline.toLowerCase().includes(q) ||
        proj.techStack.some((t) => t.toLowerCase().includes(q))
      return catMatch && searchMatch
    })
  }, [snapshot.projects, projectCatFilter, projectSearch])

  const filteredMedia = useMemo(() => {
    if (mediaFilter === 'all') return snapshot.mediaGallery
    return snapshot.mediaGallery.filter((m) => m.category === mediaFilter)
  }, [snapshot.mediaGallery, mediaFilter])

  const filteredTextKeys = useMemo(() => {
    const keys = Object.keys(snapshot.texts) as Array<keyof PortfolioTextMap>
    const q = copySearch.trim().toLowerCase()
    if (!q) return keys
    return keys.filter((key) => {
      const meta = TEXT_FIELD_LABELS[key]
      return (
        key.toLowerCase().includes(q) ||
        meta.label.toLowerCase().includes(q) ||
        meta.group.toLowerCase().includes(q) ||
        snapshot.texts[key].toLowerCase().includes(q)
      )
    })
  }, [snapshot.texts, copySearch])

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
    setMobileActionsOpen(false)
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

  const handleMoveSection = (fromIdx: number, direction: -1 | 1) => {
    const toIdx = fromIdx + direction
    if (toIdx < 0 || toIdx >= snapshot.sections.length) return
    reorderSections(arrayMove(snapshot.sections, fromIdx, toIdx))
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
    setShowAddPlanetForm(false)
    toast.success(`Added planet "${customPlanet.planetName}" — tap Publish All Changes to persist`)
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
      saleBadge: newProjBadge.trim() || undefined,
      techStack: newProjStack.split(',').map((s) => s.trim()).filter(Boolean),
      metrics: ['Production Architecture', '2026–2027 Portfolio Flagship'],
      githubUrl: newProjGithub.trim() || 'https://github.com/MeeksonJr',
      liveUrl: newProjLiveUrl.trim() || undefined,
      imageUrl: newProjImage || undefined,
      featured: true,
      architectureNotes: newProjDesc.trim() || 'Modular Next.js + AI system.',
    }
    upsertProject(item)
    setNewProjTitle('')
    setNewProjTagline('')
    setNewProjDesc('')
    setNewProjBadge('')
    setNewProjLiveUrl('')
    setShowAddProjectForm(false)
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

  const handleCopyMediaUrl = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedMediaId(id)
      toast.success('Media URL copied to clipboard')
      setTimeout(() => setCopiedMediaId((prev) => (prev === id ? null : prev)), 1800)
    } catch {
      toast.error('Clipboard permission denied')
    }
  }

  const handleRewriteWithGemini = async (
    key: keyof PortfolioTextMap,
    tone: (typeof AI_TONES)[number]
  ) => {
    setRewritingKey(key)
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: snapshot.texts[key], tone, field: key }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'AI rewrite failed')
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
    setMobileActionsOpen(false)
    toast.success('Exported portfolio JSON snapshot')
  }

  if (!isAdmin) {
    return (
      <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-x-hidden bg-[#181C2E] px-4 py-8 text-[#F5EFE2]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(224,109,67,0.16),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.12),_transparent_45%)]"
        />
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#E6DEC8]/15 bg-[#1F243B]/92 p-5 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E06D43]/20 text-[#F2A65A] ring-1 ring-[#E06D43]/40">
                <Lock className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-[17px] font-bold leading-snug tracking-tight sm:text-xl">
                  Admin Command Vault
                </h1>
                <p className="font-mono text-[11px] text-[#A39E93]">
                  Mohamed Datt • Portfolio CMS
                </p>
              </div>
            </div>
            <img src="/logo.svg" alt="MD Logo" className="h-9 w-9 shrink-0 rounded-xl" />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {['SCRYPT-64 SALTED VAULT', 'RATE-LIMITED 5/15M', 'HTTP-ONLY SESSION'].map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center gap-1 rounded-full border border-[#2DD4BF]/25 bg-[#2DD4BF]/10 px-2.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-[#5EEAD4]"
              >
                <ShieldCheck className="h-2.5 w-2.5 shrink-0" />
                {pill}
              </span>
            ))}
          </div>

          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="admin-vault-passcode"
                  className="font-mono text-[11px] uppercase tracking-wider text-[#B8B2A6]"
                >
                  Vault Passcode
                </label>
                <button
                  type="button"
                  onClick={() => setShowPasscode((prev) => !prev)}
                  className="font-mono text-[11px] text-[#5EEAD4] hover:underline cursor-pointer"
                >
                  {showPasscode ? 'Hide Digits' : 'Show Digits'}
                </button>
              </div>
              <input
                id="admin-vault-passcode"
                type={showPasscode ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={12}
                autoFocus
                required
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter vault passcode..."
                className="min-h-[48px] w-full rounded-xl border border-[#E6DEC8]/20 bg-[#121625] px-4 py-3 font-mono text-base tracking-[0.2em] placeholder:tracking-normal text-white outline-none transition focus:border-[#E06D43] sm:text-sm"
              />
            </div>

            {authError && (
              <p
                role="alert"
                className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200"
              >
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E06D43] to-[#C85A32] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
            >
              {isAuthenticating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
              {isAuthenticating ? 'Verifying Digest...' : 'Unlock Admin Command Center'}
            </button>
          </form>

          <div className="mt-5 grid grid-cols-1 gap-2.5 border-t border-[#E6DEC8]/10 pt-4 min-[360px]:grid-cols-2">
            <Link
              href="/"
              className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#E6DEC8]/20 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-[#F5EFE2] transition hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              Terrestrial Home
            </Link>
            <Link
              href="/?mode=space"
              className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#2DD4BF]/35 bg-[#2DD4BF]/10 px-3 py-2 text-xs font-semibold text-[#5EEAD4] transition hover:bg-[#2DD4BF]/20"
            >
              <Rocket className="h-3.5 w-3.5 shrink-0" />
              3D Space View
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const activePlanet = snapshot.planets[selectedPlanetIdx] || snapshot.planets[0]

  const navTabs = [
    { id: 'planets', shortLabel: 'Planets', label: 'Planets & Layout', count: snapshot.planets.length, icon: Globe },
    { id: 'projects', shortLabel: 'Projects', label: 'Projects & SaaS', count: snapshot.projects.length, icon: FolderGit2 },
    { id: 'media', shortLabel: 'Media', label: 'Images & Media', count: snapshot.mediaGallery.length, icon: ImageIcon },
    { id: 'copy', shortLabel: 'AI Copy', label: 'Copy & Gemini AI', count: Object.keys(snapshot.texts).length, icon: Type },
  ] as const

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-[#181C2E] text-[#F5EFE2]">
      {/* Compact Sticky Top Bar */}
      <header className="sticky top-0 z-30 border-b border-[#E6DEC8]/15 bg-[#15192B]/92 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-3.5 py-2.5 sm:px-6 sm:py-3.5">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <img src="/logo.svg" alt="MD Logo" className="h-8 w-8 shrink-0 rounded-lg sm:h-9 sm:w-9" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate font-display text-sm font-bold sm:text-lg">
                    Horizon Command Center
                  </h1>
                  <span className="hidden items-center gap-1 rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase text-[#5EEAD4] sm:inline-flex">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Unlocked
                  </span>
                </div>
                <p className="truncate font-mono text-[10px] text-[#2DD4BF]">
                  {persistence} • {snapshot.planets.length} Planets • {snapshot.projects.length} Projects •{' '}
                  {snapshot.mediaGallery.length} Media
                </p>
              </div>
            </div>

            {/* Mobile (< lg) compact action cluster */}
            <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
              <Link
                href="/"
                className="flex min-h-[40px] items-center gap-1 rounded-xl border border-[#E6DEC8]/20 px-2.5 text-xs font-semibold hover:bg-white/10"
                title="Back to Terrestrial Home"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden xs:inline sm:inline">Home</span>
              </Link>
              <button
                type="button"
                disabled={isSaving}
                onClick={saveSnapshot}
                className="hidden min-h-[40px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E06D43] to-[#C85A32] px-3 text-xs font-bold text-white shadow-md sm:inline-flex disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {isSaving ? 'Saving...' : 'Publish'}
              </button>
              <button
                type="button"
                aria-expanded={mobileActionsOpen}
                aria-label="Toggle quick actions drawer"
                onClick={() => setMobileActionsOpen((prev) => !prev)}
                className={cn(
                  'flex min-h-[40px] min-w-[40px] items-center justify-center gap-1 rounded-xl border px-2.5 text-xs font-semibold transition cursor-pointer',
                  mobileActionsOpen
                    ? 'border-[#E06D43] bg-[#E06D43]/20 text-white'
                    : 'border-[#E6DEC8]/20 bg-white/[0.04] text-[#E6DEC8]'
                )}
              >
                {mobileActionsOpen ? <X className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
              </button>
            </div>

            {/* Desktop (lg+) full action bar */}
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
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
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
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

          {/* Expandable Mobile/Tablet Quick-Actions Drawer */}
          {mobileActionsOpen && (
            <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-[#E6DEC8]/10 pt-2.5 lg:hidden">
              <Link
                href="/?mode=space"
                onClick={() => setMobileActionsOpen(false)}
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#2DD4BF]/40 bg-[#2DD4BF]/15 px-3 py-2 text-xs font-semibold text-[#5EEAD4]"
              >
                <Rocket className="h-3.5 w-3.5" />
                3D Space View
              </Link>
              <button
                type="button"
                onClick={handleExportJson}
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#E6DEC8]/20 bg-white/[0.04] px-3 py-2 text-xs font-medium hover:bg-white/10 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => {
                  resetSnapshot()
                  setMobileActionsOpen(false)
                }}
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#E6DEC8]/20 bg-white/[0.04] px-3 py-2 text-xs font-medium hover:bg-white/10 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleLock}
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-rose-400/35 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-200 cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5" />
                Lock Vault
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-3.5 pb-36 pt-4 sm:space-y-6 sm:px-6 sm:pb-16 sm:pt-6">
        {/* Desktop & Tablet Tab Switcher (mobile uses Sticky Bottom Dock) */}
        <div className="hidden flex-wrap gap-2 border-b border-[#E6DEC8]/10 pb-3 sm:flex">
          {navTabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex min-h-[42px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer',
                  active
                    ? 'bg-[#E06D43] text-white shadow-md'
                    : 'border border-[#E6DEC8]/15 bg-white/[0.03] text-[#D5CFC2] hover:bg-white/[0.08]'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 font-mono text-[10px]',
                    active ? 'bg-black/25 text-white' : 'bg-white/10 text-[#A39E93]'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* TAB 1: PLANETS, 3D GLOBES & LAYOUT */}
        {activeTab === 'planets' && (
          <div className="space-y-4 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
            {/* Mobile Horizontal Planet Pill Strip */}
            <div className="space-y-2 lg:hidden">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#B8B2A6]">
                  Quick Planet Switcher ({snapshot.planets.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddPlanetForm((prev) => !prev)}
                  className="inline-flex min-h-[32px] items-center gap-1 rounded-full border border-[#2DD4BF]/40 bg-[#2DD4BF]/10 px-2.5 font-mono text-[10px] font-bold text-[#5EEAD4] cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  {showAddPlanetForm ? 'Close New' : 'New Planet'}
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {snapshot.planets.map((p, idx) => {
                  const selected = selectedPlanetIdx === idx
                  return (
                    <button
                      key={`pill-${p.code}-${idx}`}
                      type="button"
                      onClick={() => setSelectedPlanetIdx(idx)}
                      className={cn(
                        'flex min-h-[40px] shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer',
                        selected
                          ? 'border-[#E06D43] bg-[#E06D43]/20 text-white shadow-sm'
                          : 'border-[#E6DEC8]/15 bg-[#1E2336]/80 text-[#D5CFC2]'
                      )}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: p.accentColor }}
                      />
                      <span className="font-mono text-[10px] text-[#F2A65A]">{p.code}</span>
                      <span>{p.shortName}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Left Column: Prime Preset, Star System List (Desktop/Tablet) & Collapsible New Planet Form */}
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
                        'min-h-[42px] rounded-xl border px-1.5 py-2 font-mono text-[11px] font-semibold leading-tight cursor-pointer',
                        snapshot.avatarMode === mode.id
                          ? 'border-[#E06D43] bg-[#E06D43]/25 text-[#F2A65A]'
                          : 'border-[#E6DEC8]/15 text-[#B8B2A6] hover:bg-white/5'
                      )}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vertical list visible on lg+ */}
              <div className="hidden rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-4 space-y-2.5 lg:block">
                <h2 className="font-display text-sm font-bold">
                  3D Star System Planets ({snapshot.planets.length})
                </h2>
                <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
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
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: p.accentColor }}
                        />
                        <span className="font-mono text-[10px] text-[#F2A65A]">{p.code}</span>
                        <span className="truncate font-semibold">{p.planetName}</span>
                      </button>
                      {p.isCustom && (
                        <button
                          type="button"
                          onClick={() => deletePlanet(idx)}
                          aria-label={`Delete ${p.planetName}`}
                          className="ml-2 rounded p-1 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Collapsible Add New 3D Planet Card */}
              <div className="rounded-2xl border border-[#2DD4BF]/30 bg-[#1E2336]/75 p-4">
                <button
                  type="button"
                  aria-expanded={showAddPlanetForm}
                  onClick={() => setShowAddPlanetForm((prev) => !prev)}
                  className="flex min-h-[40px] w-full items-center justify-between gap-2 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#2DD4BF]" />
                    <h3 className="font-display text-sm font-bold">Add New 3D Planet</h3>
                  </div>
                  {showAddPlanetForm ? (
                    <ChevronUp className="h-4 w-4 text-[#A39E93]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#A39E93]" />
                  )}
                </button>

                {showAddPlanetForm && (
                  <form onSubmit={handleAddPlanet} className="mt-3 space-y-3 border-t border-white/10 pt-3">
                    <input
                      type="text"
                      required
                      value={newPlanetName}
                      onChange={(e) => setNewPlanetName(e.target.value)}
                      placeholder="Planet Name (e.g., Quantum Lab World)"
                      className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <input
                        type="text"
                        value={newPlanetCode}
                        onChange={(e) => setNewPlanetCode(e.target.value)}
                        placeholder="Code (09)"
                        className="min-h-[44px] rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-2 font-mono text-base text-white sm:text-xs"
                      />
                      <input
                        type="text"
                        value={newPlanetShort}
                        onChange={(e) => setNewPlanetShort(e.target.value)}
                        placeholder="Short (NOVA)"
                        className="min-h-[44px] rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-2 font-mono text-base text-white sm:text-xs"
                      />
                      <select
                        value={newPlanetStyle}
                        onChange={(e) =>
                          setNewPlanetStyle(e.target.value as PlanetDefinition['customStyle'])
                        }
                        className="col-span-2 min-h-[44px] rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-2 text-base text-white sm:col-span-1 sm:text-xs"
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
                      className="min-h-[44px] w-full rounded-xl bg-[#2DD4BF] py-2.5 text-xs font-bold text-[#111827] hover:brightness-110 cursor-pointer"
                    >
                      + Spawn Planet in Star System
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column: Active Planet Editor & Touch Section Rearrangement */}
            <div className="space-y-5 lg:col-span-7">
              {activePlanet && (
                <div className="rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-4 space-y-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-white/15"
                        style={{ backgroundColor: activePlanet.accentColor }}
                      />
                      <h3 className="truncate font-display text-sm font-bold sm:text-base">
                        Planet {activePlanet.code}: {activePlanet.planetName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-0.5 font-mono text-[10px] text-[#B8B2A6]">
                        {activePlanet.sectionKey}
                      </span>
                      {activePlanet.isCustom && (
                        <button
                          type="button"
                          onClick={() => {
                            const removeIdx = selectedPlanetIdx
                            deletePlanet(removeIdx)
                            setSelectedPlanetIdx(Math.max(0, removeIdx - 1))
                            toast.info(`Deleted custom planet ${activePlanet.planetName}`)
                          }}
                          className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-rose-400/35 bg-rose-500/15 px-2.5 text-[11px] font-semibold text-rose-200 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#B8B2A6]">Planet Display Name</label>
                      <input
                        type="text"
                        value={activePlanet.planetName}
                        onChange={(e) =>
                          upsertPlanet({ ...activePlanet, planetName: e.target.value })
                        }
                        className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
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
                        className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 font-mono text-base text-white sm:text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-[#B8B2A6]">Planet Mission Description</label>
                    <textarea
                      rows={2}
                      value={activePlanet.description || ''}
                      placeholder="Brief planetary summary displayed on HUD & telemetry..."
                      onChange={(e) =>
                        upsertPlanet({ ...activePlanet, description: e.target.value })
                      }
                      className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] p-3 text-base text-white sm:text-xs"
                    />
                  </div>

                  {/* Coordinates Grid: 3 Columns */}
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-3 gap-2.5">
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
                            className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-2 font-mono text-base text-white sm:text-xs"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Color Pickers: 2 Columns with Hex Preview */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] text-[#B8B2A6]">
                          Accent ({activePlanet.accentColor.toUpperCase()})
                        </label>
                        <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-1">
                          <input
                            type="color"
                            value={activePlanet.accentColor}
                            onChange={(e) =>
                              upsertPlanet({ ...activePlanet, accentColor: e.target.value })
                            }
                            className="h-8 w-10 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                          />
                          <span className="truncate font-mono text-[11px] text-[#E6DEC8]">
                            {activePlanet.accentColor.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] text-[#B8B2A6]">
                          Secondary ({activePlanet.secondaryColor.toUpperCase()})
                        </label>
                        <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-1">
                          <input
                            type="color"
                            value={activePlanet.secondaryColor}
                            onChange={(e) =>
                              upsertPlanet({ ...activePlanet, secondaryColor: e.target.value })
                            }
                            className="h-8 w-10 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                          />
                          <span className="truncate font-mono text-[11px] text-[#E6DEC8]">
                            {activePlanet.secondaryColor.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Orbiting Moons Tags */}
                  {activePlanet.moons.length > 0 && (
                    <div className="space-y-1.5 border-t border-white/10 pt-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#B8B2A6]">
                        Orbiting Moon Nodes ({activePlanet.moons.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activePlanet.moons.map((moon) => (
                          <span
                            key={moon.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#121625] px-2.5 py-1 font-mono text-[10px] text-[#E6DEC8]"
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: moon.color }}
                            />
                            {moon.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Touch-Friendly Section Reordering */}
              <div className="rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-4 space-y-3 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-sm font-bold sm:text-base">
                      Rearrange Sections & Bento Widths
                    </h3>
                    <p className="font-mono text-[10px] text-[#A39E93]">
                      Tap Up/Down arrows on mobile or drag handle to reorder
                    </p>
                  </div>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={snapshot.sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {snapshot.sections.map((sec, idx) => (
                        <SortableSectionItem
                          key={sec.id}
                          section={sec}
                          index={idx}
                          total={snapshot.sections.length}
                          onToggle={() => toggleSectionVisibility(sec.sectionKey)}
                          onSpanChange={(span) => updateSectionSpan(sec.sectionKey, span)}
                          onMoveUp={() => handleMoveSection(idx, -1)}
                          onMoveDown={() => handleMoveSection(idx, 1)}
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
          <div className="grid gap-5 lg:grid-cols-12">
            {/* Collapsible Creation Form */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-4 sm:p-5">
                <button
                  type="button"
                  aria-expanded={showAddProjectForm}
                  onClick={() => setShowAddProjectForm((prev) => !prev)}
                  className="flex min-h-[42px] w-full items-center justify-between gap-2 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#E06D43]" />
                    <h2 className="font-display text-sm font-bold sm:text-base">
                      Add New Project / Sold SaaS
                    </h2>
                  </div>
                  {showAddProjectForm ? (
                    <ChevronUp className="h-4 w-4 text-[#A39E93]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#A39E93]" />
                  )}
                </button>

                {showAddProjectForm && (
                  <form
                    onSubmit={handleAddProject}
                    className="mt-3 space-y-3 border-t border-white/10 pt-3"
                  >
                    <input
                      type="text"
                      required
                      value={newProjTitle}
                      onChange={(e) => setNewProjTitle(e.target.value)}
                      placeholder="Project Title"
                      className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
                    />
                    <input
                      type="text"
                      value={newProjTagline}
                      onChange={(e) => setNewProjTagline(e.target.value)}
                      placeholder="Tagline"
                      className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
                    />
                    <textarea
                      rows={3}
                      value={newProjDesc}
                      onChange={(e) => setNewProjDesc(e.target.value)}
                      placeholder="Project Description & Impact"
                      className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] p-3 text-base text-white sm:text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newProjCat}
                        onChange={(e) => setNewProjCat(e.target.value as ProjectItem['category'])}
                        className="min-h-[44px] rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-2 text-base text-white sm:text-xs"
                      >
                        <option value="AI & SaaS">AI & SaaS</option>
                        <option value="ODU Research">ODU Research</option>
                        <option value="Mobile & Systems">Mobile & Systems</option>
                        <option value="Sold & Client">Sold & Client</option>
                      </select>
                      <select
                        value={newProjStatus}
                        onChange={(e) => setNewProjStatus(e.target.value as ProjectItem['status'])}
                        className="min-h-[44px] rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-2.5 py-2 text-base text-white sm:text-xs"
                      >
                        <option value="live">live</option>
                        <option value="sold">sold</option>
                        <option value="research">research</option>
                        <option value="beta">beta</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={newProjBadge}
                      onChange={(e) => setNewProjBadge(e.target.value)}
                      placeholder="Optional Sale / Award Badge (e.g., ACQUIRED)"
                      className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
                    />
                    <input
                      type="text"
                      value={newProjStack}
                      onChange={(e) => setNewProjStack(e.target.value)}
                      placeholder="Tech stack (comma separated)"
                      className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        type="url"
                        value={newProjGithub}
                        onChange={(e) => setNewProjGithub(e.target.value)}
                        placeholder="GitHub Repo URL"
                        className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
                      />
                      <input
                        type="url"
                        value={newProjLiveUrl}
                        onChange={(e) => setNewProjLiveUrl(e.target.value)}
                        placeholder="Live URL (Optional)"
                        className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
                      />
                    </div>
                    <select
                      value={newProjImage}
                      onChange={(e) => setNewProjImage(e.target.value)}
                      className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
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
                      className="min-h-[44px] w-full rounded-xl bg-[#E06D43] py-2.5 text-xs font-bold text-white cursor-pointer"
                    >
                      + Add Project to Portfolio
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Filterable Project List with Inline Edit Mode */}
            <div className="space-y-3 lg:col-span-7">
              <div className="space-y-2.5 rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/60 p-3.5">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="search"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Filter projects by title, stack, or tagline..."
                    className="min-h-[42px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] pl-9 pr-3 text-base text-white sm:text-xs"
                  />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {PROJECT_CATEGORIES.map((cat) => {
                    const active = projectCatFilter === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setProjectCatFilter(cat)}
                        className={cn(
                          'min-h-[34px] shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] font-semibold transition cursor-pointer',
                          active
                            ? 'border-[#E06D43] bg-[#E06D43] text-white'
                            : 'border-[#E6DEC8]/15 bg-[#121625] text-[#B8B2A6] hover:text-white'
                        )}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E6DEC8]/15 bg-[#1E2336]/40 p-6 text-center text-xs text-[#A39E93]">
                  No projects match your current filter.
                </div>
              ) : (
                filteredProjects.map((proj) => {
                  const isEditing = editingProjectId === proj.id
                  return (
                    <div
                      key={proj.id}
                      className="rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded bg-[#E06D43]/20 px-2 py-0.5 font-mono text-[10px] text-[#F2A65A]">
                              {proj.category}
                            </span>
                            <span
                              className={cn(
                                'rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase',
                                STATUS_BADGE_STYLES[proj.status]
                              )}
                            >
                              {proj.status}
                            </span>
                            {proj.saleBadge && (
                              <span className="rounded bg-amber-400/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-300">
                                {proj.saleBadge}
                              </span>
                            )}
                          </div>
                          <h3 className="font-display text-sm font-bold text-white sm:text-base">
                            {proj.title}
                          </h3>
                          <p className="text-xs text-[#D5CFC2]">{proj.tagline}</p>
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {proj.techStack.map((t) => (
                              <span
                                key={t}
                                className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-[#E6DEC8]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingProjectId(isEditing ? null : proj.id)}
                            aria-label={`Edit ${proj.title}`}
                            className={cn(
                              'flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border px-2.5 text-xs font-semibold transition cursor-pointer',
                              isEditing
                                ? 'border-[#2DD4BF] bg-[#2DD4BF]/20 text-[#5EEAD4]'
                                : 'border-[#E6DEC8]/20 bg-[#121625] text-[#E6DEC8] hover:bg-white/10'
                            )}
                          >
                            {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteProject(proj.id)
                              if (isEditing) setEditingProjectId(null)
                            }}
                            aria-label={`Delete ${proj.title}`}
                            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {isEditing && (
                        <InlineProjectEditor
                          project={proj}
                          mediaGallery={snapshot.mediaGallery}
                          onSave={(updated) => {
                            upsertProject(updated)
                            setEditingProjectId(null)
                            toast.success(`Updated "${updated.title}"`)
                          }}
                          onCancel={() => setEditingProjectId(null)}
                        />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: IMAGES & MEDIA LIBRARY */}
        {activeTab === 'media' && (
          <div className="space-y-5">
            <div className="grid gap-4 rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-4 sm:p-5 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="font-display text-sm font-bold sm:text-base">
                  Upload Image File (Camera / Gallery)
                </h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    value={newMediaLabel}
                    onChange={(e) => setNewMediaLabel(e.target.value)}
                    placeholder="Image Caption / Label"
                    className="min-h-[44px] rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
                  />
                  <select
                    value={newMediaCategory}
                    onChange={(e) =>
                      setNewMediaCategory(e.target.value as 'portrait' | 'project' | 'planet')
                    }
                    className="min-h-[44px] rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
                  >
                    <option value="portrait">Portrait / Story Gallery</option>
                    <option value="project">Project Screenshot</option>
                    <option value="planet">Planet Texture</option>
                  </select>
                </div>
                <label className="flex min-h-[56px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#E06D43]/50 bg-[#E06D43]/10 px-4 py-4 text-center text-xs font-semibold text-[#F2A65A] hover:bg-[#E06D43]/20">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 shrink-0" />
                  )}
                  <span>
                    {uploading ? 'Uploading...' : 'Select PNG / JPG / WEBP / GIF — Max 5MB'}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-sm font-bold sm:text-base">Add Image via URL</h2>
                <input
                  type="text"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://... or /images/..."
                  className="min-h-[44px] w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] px-3 py-2 text-base text-white sm:text-xs"
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
                  className="min-h-[44px] w-full rounded-xl bg-[#2DD4BF] py-2.5 text-xs font-bold text-[#111827] hover:brightness-110 cursor-pointer"
                >
                  + Add Image URL
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {MEDIA_CATEGORIES.map((cat) => {
                const active = mediaFilter === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMediaFilter(cat)}
                    className={cn(
                      'min-h-[36px] shrink-0 rounded-full border px-3.5 py-1 font-mono text-[11px] font-semibold capitalize transition cursor-pointer',
                      active
                        ? 'border-[#2DD4BF] bg-[#2DD4BF] text-[#111827]'
                        : 'border-[#E6DEC8]/15 bg-[#1E2336]/75 text-[#D5CFC2]'
                    )}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {filteredMedia.map((img) => {
                const copied = copiedMediaId === img.id
                return (
                  <div
                    key={img.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75"
                  >
                    <div className="aspect-video bg-[#121625]">
                      <img src={img.url} alt={img.label} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-2 p-2.5 sm:p-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-white">{img.label}</p>
                        <p className="font-mono text-[10px] text-[#2DD4BF]">{img.category}</p>
                      </div>
                      <div className="flex items-center justify-end gap-1.5 border-t border-white/10 pt-2">
                        <button
                          type="button"
                          onClick={() => handleCopyMediaUrl(img.id, img.url)}
                          aria-label={`Copy URL for ${img.label}`}
                          className="flex min-h-[36px] flex-1 items-center justify-center gap-1 rounded-lg border border-white/15 bg-[#121625] px-2 text-[10px] font-semibold text-[#E6DEC8] hover:bg-white/10 cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 text-[#2DD4BF]" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy URL
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMediaAsset(img.id)}
                          aria-label={`Delete ${img.label}`}
                          className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-rose-400/25 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 4: GLOBAL COPY & GEMINI REWRITE */}
        {activeTab === 'copy' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                value={copySearch}
                onChange={(e) => setCopySearch(e.target.value)}
                placeholder="Search copy fields (e.g., Hero, ODU, Contact)..."
                className="min-h-[44px] w-full rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 pl-10 pr-4 text-base text-white sm:text-xs"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {filteredTextKeys.map((key) => {
                const meta = TEXT_FIELD_LABELS[key]
                const val = snapshot.texts[key]
                const isRewriting = rewritingKey === key
                return (
                  <div
                    key={key}
                    className="space-y-3 rounded-2xl border border-[#E6DEC8]/15 bg-[#1E2336]/75 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] font-bold uppercase text-[#F2A65A]">
                          {meta.group} • {key}
                        </span>
                        <h3 className="text-xs font-bold text-white sm:text-sm">{meta.label}</h3>
                      </div>
                      <span className="shrink-0 rounded bg-black/30 px-2 py-0.5 font-mono text-[10px] text-[#A39E93]">
                        {val.length} chars
                      </span>
                    </div>

                    <textarea
                      rows={3}
                      value={val}
                      onChange={(e) => updateText(key, e.target.value)}
                      className="w-full rounded-xl border border-[#E6DEC8]/15 bg-[#121625] p-3 text-base text-white outline-none focus:border-[#E06D43] sm:text-xs"
                    />

                    <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
                      {AI_TONES.map((tone) => (
                        <button
                          key={tone}
                          type="button"
                          disabled={isRewriting}
                          onClick={() => handleRewriteWithGemini(key, tone)}
                          className="flex min-h-[36px] items-center justify-center gap-1.5 rounded-xl border border-[#2DD4BF]/35 bg-[#2DD4BF]/10 px-3 font-mono text-[10px] font-semibold text-[#5EEAD4] hover:bg-[#2DD4BF]/25 disabled:opacity-50 cursor-pointer"
                        >
                          {isRewriting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Mobile Navigation & One-Thumb Publish Bar */}
      <nav
        aria-label="Mobile Admin Dock"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E6DEC8]/15 bg-[#15192B]/95 px-3 pt-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-2xl sm:hidden"
      >
        <button
          type="button"
          disabled={isSaving}
          onClick={saveSnapshot}
          className="mb-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E06D43] to-[#C85A32] px-4 py-2 text-xs font-bold text-white shadow-lg transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? 'Publishing Changes...' : 'Publish All Changes'}
        </button>

        <div className="grid grid-cols-4 gap-1.5">
          {navTabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={`mobile-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-bold transition cursor-pointer',
                  active
                    ? 'bg-[#E06D43]/20 text-[#F2A65A] ring-1 ring-[#E06D43]/50'
                    : 'text-[#B8B2A6] hover:bg-white/5'
                )}
              >
                <span className="relative">
                  <Icon className="h-4 w-4" />
                  <span
                    className={cn(
                      'absolute -right-2.5 -top-1 rounded-full px-1 font-mono text-[8px] leading-tight',
                      active ? 'bg-[#E06D43] text-white' : 'bg-white/15 text-[#D5CFC2]'
                    )}
                  >
                    {tab.count}
                  </span>
                </span>
                <span>{tab.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </nav>
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
