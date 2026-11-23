import type { SectionKey } from './types'

export interface PlanetMoonNode {
  id: string
  label: string
  color: string
  radius: number
  speed: number
  offset: number
  y: number
}

export interface PlanetDefinition {
  index: number
  sectionKey: SectionKey
  code: string
  shortName: string
  planetName: string
  coordsLabel: string
  position: [number, number, number]
  accentColor: string
  secondaryColor: string
  description?: string
  customStyle?: 'terracotta' | 'teal-pulsar' | 'dyson-ring' | 'golden-crystal' | 'mars-globe'
  isCustom?: boolean
  visible?: boolean
  moons: PlanetMoonNode[]
}

export const PLANET_STATIONS: PlanetDefinition[] = [
  {
    index: 0,
    sectionKey: 'hero',
    code: '01',
    shortName: 'PRIME',
    planetName: 'Prime Monolith & AI Twin',
    coordsLabel: '0.00 / 0.00 / 0.00',
    position: [0, 0, 0],
    accentColor: '#E06D43',
    secondaryColor: '#2DD4BF',
    moons: [
      { id: 'voice-twin', label: 'Voice AI Twin', color: '#2DD4BF', radius: 2.55, speed: 0.34, offset: 0.2, y: 0.75 },
      { id: 'tailor-resume', label: 'AI Resume Tailor', color: '#F2A65A', radius: 2.75, speed: 0.28, offset: 1.8, y: -0.45 },
      { id: 'repos-50', label: '50+ GitHub Repos', color: '#E6DEC8', radius: 2.45, speed: 0.38, offset: 3.4, y: 0.9 },
      { id: 'award-1st', label: '1st Place / 13', color: '#F59E0B', radius: 2.65, speed: 0.31, offset: 4.9, y: -0.2 },
    ],
  },
  {
    index: 1,
    sectionKey: 'story',
    code: '02',
    shortName: 'ORIGIN',
    planetName: 'Terra Origin Globe',
    coordsLabel: '+16.0 / +2.5 / -14.0',
    position: [16, 2.5, -14],
    accentColor: '#2DD4BF',
    secondaryColor: '#F2A65A',
    moons: [
      { id: 'ms-guinea', label: 'Conakry, Guinea', color: '#F2A65A', radius: 2.4, speed: 0.3, offset: 0.0, y: 0.7 },
      { id: 'ms-nyc', label: 'New York City', color: '#38BDF8', radius: 2.6, speed: 0.25, offset: 1.5, y: -0.3 },
      { id: 'ms-tcc', label: 'TCC 3.8 GPA', color: '#F59E0B', radius: 2.5, speed: 0.33, offset: 3.1, y: 0.85 },
      { id: 'ms-odu', label: 'ODU Norfolk', color: '#2DD4BF', radius: 2.7, speed: 0.27, offset: 4.7, y: -0.5 },
    ],
  },
  {
    index: 2,
    sectionKey: 'projects',
    code: '03',
    shortName: 'FORGE',
    planetName: 'Forge Nexus (Projects)',
    coordsLabel: '-18.0 / -1.5 / -30.0',
    position: [-18, -1.5, -30],
    accentColor: '#E06D43',
    secondaryColor: '#F2A65A',
    moons: [
      { id: 'proj-resumeforge', label: 'ResumeForge AI', color: '#2DD4BF', radius: 2.7, speed: 0.3, offset: 0.0, y: 0.9 },
      { id: 'proj-seospace', label: 'AuditPulse SEOSPACE', color: '#38BDF8', radius: 2.95, speed: 0.24, offset: 1.05, y: -0.35 },
      { id: 'proj-neuroshield', label: 'NeuroShield-ADRD', color: '#E06D43', radius: 2.6, speed: 0.35, offset: 2.1, y: 0.55 },
      { id: 'proj-interviewprep', label: 'InterviewPrep (SOLD)', color: '#F59E0B', radius: 3.05, speed: 0.22, offset: 3.15, y: -0.65 },
      { id: 'proj-edusphere', label: 'EduSphere (1st)', color: '#F2A65A', radius: 2.8, speed: 0.28, offset: 4.2, y: 0.25 },
      { id: 'proj-clarivisit', label: 'ClariVisit + Trust', color: '#E6DEC8', radius: 2.9, speed: 0.26, offset: 5.25, y: -0.15 },
    ],
  },
  {
    index: 3,
    sectionKey: 'research',
    code: '04',
    shortName: 'PULSAR',
    planetName: 'Biomedical Pulsar (ODU Lab)',
    coordsLabel: '+20.0 / +3.0 / -46.0',
    position: [20, 3.0, -46],
    accentColor: '#2DD4BF',
    secondaryColor: '#38BDF8',
    moons: [
      { id: 'calm', label: 'Calm Homeostasis', color: '#2DD4BF', radius: 2.5, speed: 0.32, offset: 0.3, y: 0.75 },
      { id: 'pacing', label: 'Restless Pacing', color: '#F2A65A', radius: 2.7, speed: 0.28, offset: 2.4, y: -0.25 },
      { id: 'prodrome', label: 'Pre-Agitation T-15m', color: '#E06D43', radius: 2.6, speed: 0.36, offset: 4.5, y: 0.45 },
    ],
  },
  {
    index: 4,
    sectionKey: 'skills',
    code: '05',
    shortName: 'DYSON',
    planetName: 'Arsenal Dyson Sphere',
    coordsLabel: '-16.0 / +2.0 / -62.0',
    position: [-16, 2.0, -62],
    accentColor: '#F2A65A',
    secondaryColor: '#38BDF8',
    moons: [
      { id: 'frontend-spatial', label: 'Next.js 16 & R3F', color: '#E06D43', radius: 2.65, speed: 0.31, offset: 0.0, y: 0.8 },
      { id: 'backend-data', label: 'Drizzle & Postgres', color: '#2DD4BF', radius: 2.8, speed: 0.26, offset: 1.55, y: -0.35 },
      { id: 'ai-agents', label: 'Gemini Multimodal', color: '#F2A65A', radius: 2.55, speed: 0.35, offset: 3.1, y: 0.45 },
      { id: 'mobile-polyglot', label: 'Flutter & C++', color: '#38BDF8', radius: 2.75, speed: 0.29, offset: 4.7, y: -0.55 },
    ],
  },
  {
    index: 5,
    sectionKey: 'services',
    code: '06',
    shortName: 'CITADEL',
    planetName: 'Citadel Studio Station',
    coordsLabel: '+18.0 / -2.0 / -78.0',
    position: [18, -2.0, -78],
    accentColor: '#E06D43',
    secondaryColor: '#E6DEC8',
    moons: [
      { id: 'quick-fix', label: 'Quick Fix ($150+)', color: '#2DD4BF', radius: 2.5, speed: 0.28, offset: 0.4, y: 0.7 },
      { id: 'starter-site', label: 'Spatial Brand ($350+)', color: '#E06D43', radius: 2.7, speed: 0.32, offset: 2.5, y: -0.2 },
      { id: 'saas-setup', label: 'Full AI SaaS ($1.5k+)', color: '#F2A65A', radius: 2.6, speed: 0.25, offset: 4.6, y: 0.5 },
    ],
  },
  {
    index: 6,
    sectionKey: 'testimonials',
    code: '07',
    shortName: 'ECHO',
    planetName: 'Echo Constellation',
    coordsLabel: '-15.0 / +2.5 / -94.0',
    position: [-15, 2.5, -94],
    accentColor: '#F59E0B',
    secondaryColor: '#E06D43',
    moons: [
      { id: 't1', label: '1st Place / 13 Teams', color: '#F59E0B', radius: 2.45, speed: 0.3, offset: 0.2, y: 0.75 },
      { id: 't2', label: '2 SaaS Acquired', color: '#E06D43', radius: 2.65, speed: 0.26, offset: 2.3, y: -0.3 },
      { id: 't3', label: 'ODU R1 Research', color: '#2DD4BF', radius: 2.55, speed: 0.33, offset: 4.4, y: 0.35 },
    ],
  },
  {
    index: 7,
    sectionKey: 'contact',
    code: '08',
    shortName: 'RELAY',
    planetName: 'Horizon Signal Relay',
    coordsLabel: '0.00 / +1.0 / -110.0',
    position: [0, 1.0, -110],
    accentColor: '#2DD4BF',
    secondaryColor: '#E06D43',
    moons: [
      { id: 'pdf-resume', label: 'Download Resume PDF', color: '#F2A65A', radius: 2.5, speed: 0.3, offset: 0.3, y: 0.75 },
      { id: 'tailor-fit', label: 'Score Job Fit AI', color: '#2DD4BF', radius: 2.65, speed: 0.27, offset: 2.4, y: -0.25 },
      { id: 'send-signal', label: 'Transmit Brief', color: '#E06D43', radius: 2.55, speed: 0.34, offset: 4.5, y: 0.45 },
    ],
  },
]
