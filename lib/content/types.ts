import type { PlanetDefinition } from './planets'

export type PersonaId = 'all' | 'recruiter' | 'engineer' | 'research' | 'client'

export type AvatarMode = 'companion' | 'neural' | 'workstation'

export type AvatarMood = 'idle' | 'listening' | 'speaking' | 'coding' | 'celebrating'

export type BentoSpan = '1x1' | '2x1' | '2x2' | 'full'

export type SectionKey =
  | 'hero'
  | 'story'
  | 'projects'
  | 'research'
  | 'skills'
  | 'services'
  | 'testimonials'
  | 'contact'

export interface SectionConfig {
  id: string
  sectionKey: SectionKey
  title: string
  subtitle: string
  badge: string
  visible: boolean
  order: number
  bentoSpan: BentoSpan
  accentHex?: string
}

export interface ProjectItem {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  category: 'AI & SaaS' | 'ODU Research' | 'Mobile & Systems' | 'Sold & Client'
  status: 'live' | 'sold' | 'research' | 'beta'
  techStack: string[]
  metrics: string[]
  githubUrl: string
  liveUrl?: string
  imageUrl?: string
  featured: boolean
  saleBadge?: string
  architectureNotes: string
}

export interface TimelineMilestone {
  id: string
  year: string
  location: string
  title: string
  summary: string
  highlight: string
  iconName: 'globe' | 'plane' | 'terminal' | 'trophy' | 'rocket' | 'brain'
}

export interface SkillCluster {
  id: string
  category: string
  iconName: 'layers' | 'database' | 'cpu' | 'smartphone'
  accent: string
  skills: Array<{
    name: string
    level: number // 0-100
    tag: string
  }>
}

export interface ServiceTier {
  id: string
  tier: string
  price: string
  deliveryTime: string
  description: string
  features: string[]
  popular?: boolean
  baseUsd: number
  stripePaymentLinkUrl?: string
  stripeProductLabel?: string
}

export interface TestimonialItem {
  id: string
  name: string
  role: string
  quote: string
  tag: string
}

export interface PortfolioTextMap {
  heroEyebrow: string
  heroHeadline: string
  heroSubheadline: string
  heroPrimaryCta: string
  heroSecondaryCta: string
  aboutTitle: string
  aboutBio: string
  projectsTitle: string
  projectsSubtitle: string
  researchTitle: string
  researchSubtitle: string
  skillsTitle: string
  servicesTitle: string
  contactTitle: string
  contactSubtitle: string
}

export interface MediaAsset {
  id: string
  url: string
  label: string
  category: 'portrait' | 'project' | 'planet'
}

export interface PortfolioStateSnapshot {
  version: number
  updatedAt: string
  avatarMode: AvatarMode
  texts: PortfolioTextMap
  sections: SectionConfig[]
  planets: PlanetDefinition[]
  projects: ProjectItem[]
  milestones: TimelineMilestone[]
  mediaGallery: MediaAsset[]
}

export interface AgentUIAction {
  type:
    | 'scrollTo'
    | 'setPersona'
    | 'filterProjects'
    | 'setAvatarMode'
    | 'setAvatarMood'
    | 'openResumeTailor'
    | 'toggleStudio'
    | 'toggleTheme'
  payload?: string
}
