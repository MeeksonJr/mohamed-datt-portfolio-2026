import { PLANET_STATIONS } from './planets'
import type {
  MediaAsset,
  PortfolioStateSnapshot,
  ProjectItem,
  SectionConfig,
  SkillCluster,
  ServiceTier,
  TestimonialItem,
  TimelineMilestone,
} from './types'

export const PERSONAL_PROFILE = {
  name: 'Mohamed Datt',
  handle: '@MeeksonJr',
  title: 'Full-Stack AI Engineer & Spatial Web Architect',
  location: 'Norfolk, Virginia, USA',
  origin: 'Conakry, Guinea -> New York City -> Norfolk, VA',
  email: 'd.mohamed1504@gmail.com',
  phone: '+1 518-704-9000',
  github: 'https://github.com/MeeksonJr',
  linkedin: 'https://www.linkedin.com/in/mohamed-datt-b60907296',
  website: 'https://mohameddatt.com',
  resumeUrl: '/resume-Mohamed-Datt-Full-Stack-Developer.pdf',
  avatarImage: '/images/mohamed-datt-professional.png',
  portraitImage: '/images/Photo.jpg',
  galleryImages: ['/images/standing-shot.jpg', '/images/sitting-shot.jpg'],
  tracks: [
    { id: 'dreamin', title: "Dreamin'", artist: 'Portfolio Studio Mix', src: '/songs/Dreamin.mp3' },
    { id: 'driftwood', title: 'Driftwood Dreams', artist: 'Portfolio Studio Mix', src: '/songs/DriftwoodDreams.mp3' },
  ],
  quickStats: [
    { id: 'repos', label: 'GitHub Repositories', value: '50+', detail: 'Polyglot TS, Python, Dart, C++' },
    { id: 'sold', label: 'Production SaaS Sold', value: '2', detail: 'Commercial client acquisitions' },
    { id: 'award', label: 'Internship Competition', value: '1st Place', detail: 'Out of 13 engineering teams' },
    { id: 'gpa', label: 'Academic Excellence', value: '3.8 GPA', detail: 'B.S. CS @ ODU • Dean’s List' },
  ],
}

export const DEFAULT_TEXTS = {
  heroEyebrow: '2026–2027 EDITION • AVAILABLE FOR AI & FULL-STACK ROLES',
  heroHeadline: 'Engineering Spatial Web Apps, AI Agents & Clinical Edge Systems.',
  heroSubheadline:
    'Born in Guinea, raised in NYC, building in Norfolk, VA. I architect production Next.js + Three.js platforms, Gemini multimodal copilots, and ODU Hands-On Lab Edge-AI research systems.',
  heroPrimaryCta: 'Talk to 3D AI Twin',
  heroSecondaryCta: 'Tailor Resume with AI',
  aboutTitle: 'Guinea -> NYC -> Norfolk: Built Through Resilience',
  aboutBio:
    'From navigating a new language in New York City to winning 1st Place among 13 teams and leading grant-ready biomedical & defense AI research at Old Dominion University, every product I ship balances deep systems engineering with human-centered craft.',
  projectsTitle: 'Flagship Systems, Sold SaaS & Polyglot Builds',
  projectsSubtitle:
    'Curated across my 2024–2027 GitHub repositories—spanning multi-tenant SaaS products, Flutter mobile apps, SEO engines, and C++/Python infrastructure.',
  researchTitle: 'ODU Hands-On Lab & Brock Health Sciences Research',
  researchSubtitle:
    'Engineering real-time clinical and defense Edge-AI demonstrators under Prof. Ajay K. Gupta, targeting NIH, NSF, and Sentara Health initiatives.',
  skillsTitle: 'Technical Stack & Architecture Matrix',
  servicesTitle: 'SaaS Architecture & Freelance Studio',
  contactTitle: 'Launch Something Extraordinary for 2026–2027',
  contactSubtitle:
    'Open to Full-Stack / AI Engineer roles, research collaborations, and custom SaaS builds. Summon the Voice Concierge or send a direct brief below.',
}

export const DEFAULT_SECTIONS: SectionConfig[] = [
  {
    id: 'sec-hero',
    sectionKey: 'hero',
    title: 'Spatial 3D Hero & Voice Twin',
    subtitle: 'Interactive Three.js Avatar synced to Gemini AI',
    badge: '01 / CORE',
    visible: true,
    order: 0,
    bentoSpan: 'full',
  },
  {
    id: 'sec-story',
    sectionKey: 'story',
    title: 'Journey & Identity Bento',
    subtitle: 'Guinea to Norfolk timeline + Live Telemetry',
    badge: '02 / ORIGIN',
    visible: true,
    order: 1,
    bentoSpan: 'full',
  },
  {
    id: 'sec-projects',
    sectionKey: 'projects',
    title: 'Projects & Sold SaaS Vault',
    subtitle: '2024–2027 Production & Polyglot Portfolio',
    badge: '03 / SHIPPED',
    visible: true,
    order: 2,
    bentoSpan: 'full',
  },
  {
    id: 'sec-research',
    sectionKey: 'research',
    title: 'ODU Edge-AI Research Lab',
    subtitle: 'NeuroShield-ADRD, VocalPulse rPPG & 10 Grant Pitches',
    badge: '04 / R1 LAB',
    visible: true,
    order: 3,
    bentoSpan: 'full',
  },
  {
    id: 'sec-skills',
    sectionKey: 'skills',
    title: 'Capabilities & Stack Matrix',
    subtitle: 'Next.js 16, Three.js, Drizzle ORM, Gemini & Flutter',
    badge: '05 / STACK',
    visible: true,
    order: 4,
    bentoSpan: '2x1',
  },
  {
    id: 'sec-services',
    sectionKey: 'services',
    title: 'Services & Scope Estimator',
    subtitle: 'Transparent tiers from Quick Fix to AI SaaS',
    badge: '06 / STUDIO',
    visible: true,
    order: 5,
    bentoSpan: '2x1',
  },
  {
    id: 'sec-testimonials',
    sectionKey: 'testimonials',
    title: 'Proof, Awards & Guestbook',
    subtitle: 'Endorsements & interactive visitor wall',
    badge: '07 / PROOF',
    visible: true,
    order: 6,
    bentoSpan: 'full',
  },
  {
    id: 'sec-contact',
    sectionKey: 'contact',
    title: 'Contact & Resume Hub',
    subtitle: 'Direct outreach, PDF resume & AI fit scorer',
    badge: '08 / CONNECT',
    visible: true,
    order: 7,
    bentoSpan: 'full',
  },
]

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-resumeforge',
    slug: 'resumeforge-suite',
    title: 'ResumeForge AI + Mobile',
    tagline: 'Cross-platform AI career & portfolio ecosystem (Web + Flutter)',
    description:
      'Full-stack Next.js 16 + Flutter mobile platform featuring drag-and-drop @dnd-kit section assembly, Tiptap rich editing, Gemini job-fit scoring, Stripe subscriptions, and high-DPI PDF/DOCX export.',
    category: 'AI & SaaS',
    status: 'live',
    techStack: ['Next.js 16', 'Flutter / Dart', 'Gemini API', 'Supabase', 'Stripe', 'dnd-kit'],
    metrics: ['Web + iOS/Android parity', 'Real-time ATS match scoring', 'PDF & DOCX engine'],
    githubUrl: 'https://github.com/MeeksonJr/resume-builder-plan',
    liveUrl: 'https://github.com/MeeksonJr/resumeforge_mobile',
    featured: true,
    architectureNotes:
      'Monorepo-aligned data contracts with Zustand state synchronization, Playwright E2E coverage, Vitest unit specs, and Nodemailer/Resend transactional hooks.',
  },
  {
    id: 'proj-seospace',
    slug: 'seospace-auditpulse',
    title: 'AuditPulse AI (SEOSPACE)',
    tagline: 'Automated Technical SEO & AI Search Readiness Crawler',
    description:
      'Serverless Next.js + Puppeteer inspection SaaS that crawls live sites, evaluates Core Web Vitals, schema markup, and LLM discoverability, and generates executive PDF/DOCX audits via Gemini.',
    category: 'AI & SaaS',
    status: 'live',
    techStack: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Puppeteer', '@google/genai', 'Stripe'],
    metrics: ['Automated headless DOM audits', 'Multi-format report exports', 'Stripe billing'],
    githubUrl: 'https://github.com/MeeksonJr/SEOSPACE',
    featured: true,
    architectureNotes:
      'Combines headless browser scraping with structured Gemini JSON outputs and PostgreSQL audit snapshots.',
  },
  {
    id: 'proj-neuroshield',
    slug: 'neuroshield-adrd',
    title: 'NeuroShield-ADRD & VocalPulse Edge',
    tagline: 'Pre-Emptive Multimodal Edge-AI Dementia Agitation Interception',
    description:
      'Built for ODU Hands-On Lab & Brock Health Sciences: fuses 10Hz EDA/PPG biometric telemetry, UWB spatial floorplan entropy, and contactless webcam rPPG pulse extraction to intercept agitation 20 minutes pre-crisis.',
    category: 'ODU Research',
    status: 'research',
    techStack: ['Node.js Telemetry', 'Python / PyTorch', 'D3.js', 'SQLite', 'WebSockets', 'Edge AI'],
    metrics: ['10Hz live oscilloscope', '±1.5 BPM rPPG sync', '10 Federal Grant Proposals'],
    githubUrl: 'https://github.com/MeeksonJr/cmai-agitation-video-generator',
    featured: true,
    architectureNotes:
      'Zero-dependency real-time Node telemetry server driving multi-channel physiological oscillators and caregiver non-pharmacological triggers.',
  },
  {
    id: 'proj-interviewprep',
    slug: 'interviewprep-ai',
    title: 'InterviewPrep AI',
    tagline: 'Voice & Text AI Mock Interview SaaS — Acquired by Client',
    description:
      'Full-stack interview coaching platform combining real-time voice mock interviews, resume parsing, adaptive technical questioning, and job-fit feedback.',
    category: 'Sold & Client',
    status: 'sold',
    saleBadge: 'SOLD • Commercial Client',
    techStack: ['Next.js', 'PostgreSQL', 'Gemini', 'Firebase', 'Vapi Voice', 'PayPal'],
    metrics: ['Acquired by private client', 'Voice + text mock loops', 'Contracted maintenance'],
    githubUrl: 'https://github.com/MeeksonJr',
    featured: true,
    architectureNotes:
      'Low-latency conversational voice loop backed by PostgreSQL session transcripts and structured scoring rubrics.',
  },
  {
    id: 'proj-edusphere',
    slug: 'edusphere-ai',
    title: 'EduSphere AI',
    tagline: '1st Place Internship Winner — K-University Academic SaaS',
    description:
      'Award-winning dark-themed academic productivity SaaS offering AI assignment guidance, study planning, calendar orchestration, and collaborative blogs.',
    category: 'Sold & Client',
    status: 'live',
    saleBadge: '1st Place / 13 Teams',
    techStack: ['Next.js', 'Supabase', 'Gemini', 'Hugging Face', 'TailwindCSS', 'PayPal'],
    metrics: ['1st Place out of 13 teams', 'Multi-provider AI router', 'Full auth & subscriptions'],
    githubUrl: 'https://github.com/MeeksonJr/edusphere-ai',
    imageUrl: '/projects/edusphere.png',
    featured: true,
    architectureNotes:
      'Led full-stack integration across Next.js App Router, Supabase RLS, and multi-model inference.',
  },
  {
    id: 'proj-contentgen',
    slug: 'ai-content-generator',
    title: 'AI Content & Sentiment Suite',
    tagline: 'Multi-channel Content Generation + Hugging Face Sentiment Analytics',
    description:
      'SaaS marketing platform automating SEO blogs, social copy, and customer sentiment scoring with interactive Recharts telemetry dashboards.',
    category: 'AI & SaaS',
    status: 'live',
    techStack: ['Next.js', 'Supabase', 'Gemini', 'Hugging Face', 'Recharts'],
    metrics: ['Sentiment classification', 'SEO scoring pipeline', 'Analytics dashboard'],
    githubUrl: 'https://github.com/MeeksonJr/ai-content-generator',
    imageUrl: '/projects/content-gen.png',
    featured: false,
    architectureNotes:
      'Hybrid inference pipeline chaining Gemini generative prose with Hugging Face sentiment transformers.',
  },
  {
    id: 'proj-clarivisit',
    slug: 'clarivisit-trustpulse',
    title: 'ClariVisit & TrustPulse AI',
    tagline: 'Next.js 16 + Tailwind v4 Healthcare & Trust Intelligence Apps',
    description:
      'Pair of modern Next.js 16 / React 19 SaaS builds leveraging @google/genai, Supabase, Zod validation, and automated transactional email workflows.',
    category: 'AI & SaaS',
    status: 'beta',
    techStack: ['Next.js 16', 'React 19', 'Tailwind v4', '@google/genai', 'Supabase', 'Resend'],
    metrics: ['React 19 server actions', 'Strict Zod schemas', 'Instant Resend dispatch'],
    githubUrl: 'https://github.com/MeeksonJr/clarivisit',
    featured: false,
    architectureNotes:
      'Engineered for rapid client onboarding with edge-validated schemas and zero-latency Tailwind v4 styling.',
  },
  {
    id: 'proj-polyglot',
    slug: 'polyglot-systems',
    title: 'Builders Mech Royale & Systems Lab',
    tagline: 'Python, C++ & Infrastructure Engineering (Databricks / RWX)',
    description:
      'Recent 2026 systems projects spanning Python simulation engines (builders-mech-royale, rwx-blast-radius), C++ analytics (databricks-shopping-sessions), and LegalFlow e-signature automation.',
    category: 'Mobile & Systems',
    status: 'live',
    techStack: ['Python', 'C++', 'TypeScript', 'Flutter', 'Algorithms'],
    metrics: ['C++ high-throughput sessions', 'Blast-radius graph analysis', 'Multi-language fluency'],
    githubUrl: 'https://github.com/MeeksonJr/builders-mech-royale',
    featured: false,
    architectureNotes:
      'Demonstrates systems-level versatility beyond web UI: graph blast-radius tracing, C++ data pipelines, and real-time game loops.',
  },
]

export const DEFAULT_MILESTONES: TimelineMilestone[] = [
  {
    id: 'ms-guinea',
    year: 'Origin',
    location: 'Conakry, Guinea',
    title: 'Born in Guinea',
    summary: 'Early roots defined by curiosity, community, and resourcefulness under constraints.',
    highlight: 'Foundation of resilience & French fluency',
    iconName: 'globe',
  },
  {
    id: 'ms-nyc',
    year: 'Chapter 2',
    location: 'New York City, NY',
    title: 'Moved to NYC & Learned English',
    summary: 'Immersed in fast-paced diversity, teaching myself English and discovering problem-solving through technology.',
    highlight: 'Bilingual adaptability & grit',
    iconName: 'plane',
  },
  {
    id: 'ms-code',
    year: '2021–2023',
    location: 'Virginia',
    title: 'First Lines of Code to Full-Stack',
    summary: 'Self-taught JavaScript, React, Python, and C++, shipping early web apps while pursuing Computer Science.',
    highlight: '50+ GitHub repositories built',
    iconName: 'terminal',
  },
  {
    id: 'ms-tcc',
    year: 'Fall 2024',
    location: 'Norfolk, VA',
    title: '1st Place Internship & TCC Honors',
    summary: 'Graduated A.S. CS (3.8 GPA, Dean’s List) and won 1st Place out of 13 teams at Product Manager Accelerator.',
    highlight: '3.8 GPA • 1st Place / 13 Teams',
    iconName: 'trophy',
  },
  {
    id: 'ms-saas',
    year: '2025',
    location: 'Norfolk, VA',
    title: 'Shipped & Sold Commercial SaaS',
    summary: 'Sold InterviewPrep AI to a private client and expanded into ResumeForge AI, LegalFlow, AutoFlow, and SEOSPACE.',
    highlight: '2 Commercial Sites Sold',
    iconName: 'rocket',
  },
  {
    id: 'ms-odu',
    year: '2026–2027',
    location: 'Old Dominion University',
    title: 'B.S. CS & ODU Hands-On Lab AI Research',
    summary: 'Architecting spatial 3D AI apps, multi-agent systems, and clinical Edge-AI prototypes (NeuroShield-ADRD, VocalPulse).',
    highlight: 'NIH / NSF Grant Research Squad',
    iconName: 'brain',
  },
]

export const SKILL_CLUSTERS: SkillCluster[] = [
  {
    id: 'frontend-spatial',
    category: 'Frontend & Spatial 3D',
    iconName: 'layers',
    accent: '#06B6D4',
    skills: [
      { name: 'Next.js 15 / 16 App Router', level: 96, tag: 'Production' },
      { name: 'React 19 & TypeScript', level: 95, tag: 'Strict' },
      { name: 'Three.js / React Three Fiber', level: 88, tag: 'WebGL 3D' },
      { name: 'Tailwind CSS v4 & Framer Motion', level: 96, tag: 'UI Craft' },
    ],
  },
  {
    id: 'backend-data',
    category: 'Backend, Drizzle & Cloud',
    iconName: 'database',
    accent: '#10B981',
    skills: [
      { name: 'PostgreSQL & Drizzle ORM', level: 92, tag: 'Type-Safe' },
      { name: 'Supabase (Auth, RLS, Storage)', level: 93, tag: 'Multi-Tenant' },
      { name: 'Node.js, REST & Server Actions', level: 92, tag: 'Edge/API' },
      { name: 'Stripe, PayPal & Resend Email', level: 90, tag: 'Monetization' },
    ],
  },
  {
    id: 'ai-agents',
    category: 'Gemini AI & Edge Research',
    iconName: 'cpu',
    accent: '#6366F1',
    skills: [
      { name: 'Google Gemini (@google/genai)', level: 95, tag: 'Multimodal' },
      { name: 'Voice Agents & Web Audio API', level: 90, tag: 'Real-Time' },
      { name: 'Groq, Hugging Face & RAG Swarms', level: 88, tag: 'Orchestration' },
      { name: 'Clinical Biometrics (EDA / rPPG)', level: 85, tag: 'ODU R1 Lab' },
    ],
  },
  {
    id: 'mobile-polyglot',
    category: 'Mobile & Polyglot Systems',
    iconName: 'smartphone',
    accent: '#F59E0B',
    skills: [
      { name: 'Flutter & Dart Mobile Apps', level: 86, tag: 'Cross-Platform' },
      { name: 'Python (FastAPI / AI Pipelines)', level: 89, tag: 'ML / Tooling' },
      { name: 'C++ & Data Structures', level: 84, tag: 'Systems' },
      { name: 'Playwright & Vitest QA', level: 85, tag: 'Reliability' },
    ],
  },
]

export const SERVICE_TIERS: ServiceTier[] = [
  {
    id: 'quick-fix',
    tier: 'Quick Fix & Audit',
    price: '$276',
    deliveryTime: '1–3 days',
    baseUsd: 276,
    stripePaymentLinkUrl: 'https://buy.stripe.com/7sYdR96XS2tF2QF2T79k401',
    stripeProductLabel: 'Stripe Plink • Audit & Retainer',
    description: 'Rapid bug squashing, Lighthouse speed tuning, or Gemini API feature drop-ins.',
    features: [
      'Same-day architecture triage',
      'Core Web Vitals & SEO diagnostics',
      'Clean PR with TypeScript checks',
      'Live Stripe Payment Link enabled',
    ],
  },
  {
    id: 'starter-site',
    tier: 'Spatial Landing / Brand',
    price: '$756',
    deliveryTime: '1–2 weeks',
    baseUsd: 756,
    popular: true,
    stripePaymentLinkUrl: 'https://buy.stripe.com/aFafZh81Wb0bezn1P39k403',
    stripeProductLabel: 'Stripe Plink • Studio & White-Label',
    description: 'Interactive Next.js + Three.js flagship site with CMS control, Stripe & analytics.',
    features: [
      'Custom Dribbble Editorial + Three.js 3D',
      'Zero-leak /admin CMS & media vault',
      'SEO metadata & OG card automation',
      'Vercel deploy + 30 days support',
    ],
  },
  {
    id: 'saas-setup',
    tier: 'Full AI SaaS Platform',
    price: '$1,800+',
    deliveryTime: '4–8 weeks',
    baseUsd: 1800,
    stripePaymentLinkUrl: 'https://buy.stripe.com/3cI6oH3LG6JVdvj2T79k402',
    stripeProductLabel: 'Stripe Plink • Studio Retainer ($79/mo kick-off)',
    description: 'End-to-end multi-tenant SaaS with auth, Drizzle/Supabase DB, Stripe & Gemini AI.',
    features: [
      'Full-stack Next.js 16 + Drizzle Postgres',
      'Gemini multimodal text/voice workflows',
      'Stripe subscriptions & Resend emails',
      '90 days support & observability',
    ],
  },
]

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't1',
    name: 'Product Manager Accelerator Panel',
    role: 'Fall 2024 Internship Judging Committee',
    quote:
      'Mohamed led full-stack engineering and AI architecture on EduSphere AI, delivering 1st Place out of 13 competing teams with production polish.',
    tag: '1st Place Winner',
  },
  {
    id: 't2',
    name: 'Private SaaS Acquisition Client',
    role: 'Buyer — InterviewPrep AI Platform',
    quote:
      'From voice mock interviews to payment integration and database stability, Mohamed shipped a commercial-grade product ready for real customers.',
    tag: 'Commercial Acquisition',
  },
  {
    id: 't3',
    name: 'ODU Hands-On Lab Collaboration',
    role: 'Department of Computer Science • Norfolk, VA',
    quote:
      'Applying software engineering rigor to real-time 10Hz biomedical telemetry, spatial tracking, and multi-agent grant tooling.',
    tag: 'R1 Research',
  },
]

export const DEFAULT_MEDIA_GALLERY: MediaAsset[] = [
  { id: 'img-prof', url: '/images/mohamed-datt-professional.png', label: 'Studio Portrait', category: 'portrait' },
  { id: 'img-photo', url: '/images/Photo.jpg', label: 'Norfolk VA', category: 'portrait' },
  { id: 'img-stand', url: '/images/standing-shot.jpg', label: 'Campus Field', category: 'portrait' },
  { id: 'img-sit', url: '/images/sitting-shot.jpg', label: 'Builder Mode', category: 'portrait' },
  { id: 'img-edusphere', url: '/projects/edusphere.png', label: 'EduSphere AI UI', category: 'project' },
  { id: 'img-contentgen', url: '/projects/content-gen.png', label: 'AI Content Gen UI', category: 'project' },
  { id: 'img-plansmart', url: '/projects/plansmart.png', label: 'PlanSmart AI UI', category: 'project' },
]

export function createInitialSnapshot(): PortfolioStateSnapshot {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    avatarMode: 'companion',
    texts: { ...DEFAULT_TEXTS },
    sections: DEFAULT_SECTIONS.map((s) => ({ ...s })),
    planets: PLANET_STATIONS.map((p) => ({
      ...p,
      position: [...p.position] as [number, number, number],
      moons: p.moons.map((m) => ({ ...m })),
    })),
    projects: DEFAULT_PROJECTS.map((p) => ({ ...p })),
    milestones: DEFAULT_MILESTONES.map((m) => ({ ...m })),
    mediaGallery: DEFAULT_MEDIA_GALLERY.map((m) => ({ ...m })),
  }
}
