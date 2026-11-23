import type { PersonaId } from '@/lib/content/types'

export interface ResumeDocumentData {
  personaLabel: string
  name: string
  roleTitle: string
  email: string
  phone: string
  location: string
  github: string
  linkedin: string
  website: string
  summary: string
  skillsGroups: Array<{ label: string; items: string[] }>
  experience: Array<{
    role: string
    company: string
    period: string
    bullets: string[]
  }>
  projects: Array<{
    name: string
    stack: string
    bullets: string[]
  }>
  education: Array<{
    degree: string
    school: string
    period: string
    details: string
  }>
}

const BASE_EXPERIENCE = [
  {
    role: 'Undergraduate Edge-AI Researcher & Systems Builder',
    company: 'ODU Hands-On Lab (Prof. Ajay K. Gupta) • Norfolk, VA',
    period: '2025 – Present',
    bullets: [
      'Engineered NeuroShield-ADRD, a 10Hz real-time EDA/PPG + UWB spatial telemetry demonstrator predicting dementia agitation 20 minutes pre-crisis.',
      'Built VocalPulse-Edge contactless facial video rPPG prototype achieving ±1.5 BPM parity with WearOS smartwatches and contributing to 10 NIH/NSF grant proposals.',
    ],
  },
  {
    role: 'Independent Full-Stack & AI SaaS Founder',
    company: 'Commercial Client Acquisitions & Open Source • Norfolk, VA',
    period: '2024 – Present',
    bullets: [
      'Built and sold 2 commercial web/SaaS platforms including InterviewPrep AI (Vapi voice mock interviews, Gemini feedback, PostgreSQL & PayPal).',
      'Architected ResumeForge AI (Next.js 16 + Flutter mobile + Stripe) and AuditPulse AI / SEOSPACE (Puppeteer SEO crawler + Gemini audit engine).',
    ],
  },
  {
    role: 'Software Developer Intern (1st Place / 13 Teams)',
    company: 'Product Manager Accelerator • Norfolk, VA',
    period: 'Sep 2024 – Dec 2024',
    bullets: [
      'Led full-stack development of EduSphere AI using Next.js, TypeScript, Supabase RLS, Gemini & Hugging Face APIs, winning 1st Place out of 13 competing teams.',
      'Delivered multi-tenant authentication, AI academic workflows, and responsive Tailwind architecture ahead of schedule.',
    ],
  },
]

const BASE_EDUCATION = [
  {
    degree: 'B.S. in Computer Science',
    school: 'Old Dominion University (Norfolk, VA)',
    period: 'Jan 2025 – Present',
    details: 'Coursework: Data Structures & Algorithms, Operating Systems, Database Systems, Computer Architecture, C++, Software Engineering.',
  },
  {
    degree: 'A.S. in Computer Science (3.8 GPA • Dean’s List)',
    school: 'Tidewater Community College (Norfolk, VA)',
    period: 'Sep 2022 – Dec 2024',
    details: 'Honors: 3.8 GPA, Dean’s List, 1st Place Fall 2024 Internship Competition.',
  },
]

export function buildPersonaResume(
  persona: PersonaId,
  overrides?: Partial<ResumeDocumentData>
): ResumeDocumentData {
  const presets: Record<
    PersonaId,
    {
      personaLabel: string
      roleTitle: string
      summary: string
      skillsGroups: Array<{ label: string; items: string[] }>
      projects: Array<{ name: string; stack: string; bullets: string[] }>
    }
  > = {
    all: {
      personaLabel: 'Master 2026–2027 Edition',
      roleTitle: 'Full-Stack AI Engineer & Spatial Web Architect',
      summary:
        'Full-Stack & AI Engineer (3.8 GPA, 1st Place Internship Winner, 2 commercial SaaS sales) with 50+ repositories spanning Next.js 16, React 19, Three.js WebGL, Drizzle/PostgreSQL, Gemini multimodal agents, Flutter mobile, and ODU R1 Edge-AI research.',
      skillsGroups: [
        { label: 'Frontend & 3D', items: ['Next.js 16', 'React 19', 'TypeScript', 'Three.js / R3F', 'Tailwind CSS v4'] },
        { label: 'Backend & DB', items: ['PostgreSQL', 'Drizzle ORM', 'Supabase RLS', 'Node.js', 'Stripe & Resend'] },
        { label: 'AI & Systems', items: ['Google @google/genai', 'Voice Agents', 'Python / PyTorch', 'Flutter / Dart', 'C++'] },
      ],
      projects: [
        {
          name: 'ResumeForge AI + Mobile',
          stack: 'Next.js 16 • Flutter/Dart • Gemini API • Stripe • dnd-kit',
          bullets: [
            'Cross-platform web & mobile resume builder featuring drag-and-drop editing, ATS match scoring, and server-side PDF/DOCX export.',
          ],
        },
        {
          name: 'AuditPulse AI (SEOSPACE)',
          stack: 'Next.js 15 • TypeScript • Puppeteer • PostgreSQL • Gemini',
          bullets: [
            'Automated headless technical SEO & AI-search readiness crawler generating executive DOCX/PDF remediation reports.',
          ],
        },
        {
          name: 'NeuroShield-ADRD & VocalPulse-Edge (ODU Lab)',
          stack: 'Node.js 10Hz Telemetry • Python • WebSockets • D3.js',
          bullets: [
            'Real-time multimodal dementia agitation prediction and contactless webcam rPPG vitals matching WearOS within ±1.5 BPM.',
          ],
        },
      ],
    },
    recruiter: {
      personaLabel: 'Recruiter / Software Engineer Track',
      roleTitle: 'Full-Stack Software Engineer (TypeScript • Next.js • AI)',
      summary:
        'Results-driven Full-Stack Engineer (3.8 GPA, 1st Place out of 13 internship teams, 2 commercial SaaS products sold). Proven ability to ship scalable TypeScript, React/Next.js, PostgreSQL/Drizzle, and AI-powered applications with automated E2E/unit test coverage.',
      skillsGroups: [
        { label: 'Core Stack', items: ['TypeScript', 'React 19', 'Next.js 15/16', 'Node.js', 'PostgreSQL', 'Drizzle ORM'] },
        { label: 'Cloud & QA', items: ['Supabase', 'Stripe', 'Playwright E2E', 'Vitest', 'Docker', 'Vercel CI/CD'] },
        { label: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'C++', 'Dart/Flutter', 'SQL'] },
      ],
      projects: [
        {
          name: 'InterviewPrep AI (Commercial Acquisition)',
          stack: 'Next.js • PostgreSQL • Gemini • Vapi Voice • Firebase • PayPal',
          bullets: [
            'Built and sold full-stack voice + text AI mock interview SaaS platform to a private client with ongoing maintenance contract.',
          ],
        },
        {
          name: 'ResumeForge AI (Web + Flutter)',
          stack: 'Next.js 16 • Zustand • Stripe • Playwright • Vitest',
          bullets: [
            'Implemented drag-and-drop resume studio, real-time ATS keyword scoring, Stripe subscriptions, and high-DPI PDF rendering.',
          ],
        },
        {
          name: 'EduSphere AI (1st Place / 13 Teams)',
          stack: 'Next.js • Supabase RLS • Gemini • TailwindCSS',
          bullets: [
            'Architected multi-tenant K-University SaaS platform winning 1st Place out of 13 competing engineering teams.',
          ],
        },
      ],
    },
    engineer: {
      personaLabel: 'Systems & Architecture Track',
      roleTitle: 'Systems, Spatial Web & Polyglot Engineer',
      summary:
        'Polyglot engineer shipping across TypeScript, Python, C++, and Dart/Flutter. Experienced in WebGL/Three.js graphics, PostgreSQL/Drizzle schema design, headless Puppeteer crawlers, and graph blast-radius tooling across 50+ repositories.',
      skillsGroups: [
        { label: 'Architecture', items: ['Next.js App Router', 'Three.js / WebGL', 'Drizzle ORM', 'PostgreSQL', 'REST / Server Actions'] },
        { label: 'Polyglot Systems', items: ['C++ Pipelines', 'Python Simulation', 'Flutter / Dart', 'Linux / Docker'] },
      ],
      projects: [
        {
          name: 'Databricks Shopping Sessions & RWX Blast Radius',
          stack: 'C++ • Python • Graph Analysis',
          bullets: [
            'Engineered high-throughput C++ session pipelines and dependency blast-radius graph tracers.',
          ],
        },
        {
          name: 'AuditPulse AI (SEOSPACE)',
          stack: 'Next.js • Puppeteer • PostgreSQL • Gemini',
          bullets: [
            'Built headless DOM crawler capturing Core Web Vitals, schema markup, and structured LLM search scores.',
          ],
        },
        {
          name: 'Horizon Observatory 3D Portfolio Engine',
          stack: 'Three.js / R3F • Drizzle ORM • Salted Scrypt Auth • Stripe',
          bullets: [
            'Constructed an 8-planet 3D WebGL star system synced to an authenticated admin CMS and dynamic PDF engine.',
          ],
        },
      ],
    },
    research: {
      personaLabel: 'ODU R1 Research & Edge-AI Track',
      roleTitle: 'Edge-AI, Multimodal Sensing & Clinical Computing Researcher',
      summary:
        'Computer Science researcher at Old Dominion University’s Hands-On Lab under Prof. Ajay K. Gupta. Specializing in real-time physiological telemetry (EDA, PPG, rPPG), spatial UWB tracking, and multi-agent AI pipelines targeting NIH, NSF, and DoD clinical grants.',
      skillsGroups: [
        { label: 'Clinical & Edge AI', items: ['10Hz Biometric Telemetry', 'Webcam rPPG', 'PyTorch / Python', 'Gemini Multimodal', 'D3.js'] },
        { label: 'Systems & Compute', items: ['C++', 'Node.js Real-Time', 'SQLite / Postgres', 'WebSockets', 'Edge Sensors'] },
      ],
      projects: [
        {
          name: 'NeuroShield-ADRD (Virginia ARDRAF / NIH NIA R21)',
          stack: 'Node.js 10Hz Engine • EDA/PPG • UWB Spatial Entropy',
          bullets: [
            'Real-time multi-channel physiological oscilloscope and caregiver trigger engine for 20-minute pre-crisis agitation interception.',
          ],
        },
        {
          name: 'VocalPulse-Edge (Sentara Student Pilot)',
          stack: 'Computer Vision rPPG • Dual-Mic Biomarkers • WearOS',
          bullets: [
            'Contactless facial video pulse extraction matching smartwatch R-R intervals within ±1.5 BPM.',
          ],
        },
        {
          name: 'ODU Hands-On Lab 10-Grant Dossier',
          stack: 'NIH / NSF / DoD CDMRP Proposals • Hardware BOM',
          bullets: [
            'Co-authored architectures across OncoPareto-Prostate, FedCare-Mesh, and SynthoTrial-Agent.',
          ],
        },
      ],
    },
    client: {
      personaLabel: 'SaaS Founder & Client Partner Track',
      roleTitle: 'Full-Stack AI SaaS Architect & Product Partner',
      summary:
        'Commercial product builder who takes ideas from zero to live paying SaaS—having shipped and sold 2 commercial platforms. Specializing in Next.js 16, Drizzle/Supabase databases, Stripe subscriptions, and custom Gemini AI voice/text copilots.',
      skillsGroups: [
        { label: 'SaaS Delivery', items: ['Next.js 16', 'Stripe Checkout & Webhooks', 'Supabase Auth & RLS', 'Drizzle Postgres', 'Resend Email'] },
        { label: 'Differentiation', items: ['Gemini Voice & Chat Agents', 'Three.js 3D Experiences', 'SEO & Analytics'] },
      ],
      projects: [
        {
          name: 'InterviewPrep AI (Sold to Private Client)',
          stack: 'Next.js • Vapi Voice • Gemini • PostgreSQL • PayPal',
          bullets: [
            'End-to-end commercial acquisition delivering AI mock interviews, payment processing, and contracted maintenance.',
          ],
        },
        {
          name: 'ResumeForge AI + ClariVisit + TrustPulse AI',
          stack: 'Next.js 16 • Stripe • Zod • Resend • Tailwind v4',
          bullets: [
            'Production-ready multi-tenant SaaS builds with subscription billing, automated emails, and AI document workflows.',
          ],
        },
        {
          name: 'AI Content & Sentiment SaaS',
          stack: 'Next.js • Supabase • Gemini • Hugging Face • Recharts',
          bullets: [
            'Automated SEO blog generation with sentiment analytics dashboards for marketing teams.',
          ],
        },
      ],
    },
  }

  const chosen = presets[persona] || presets.all

  return {
    personaLabel: chosen.personaLabel,
    name: 'Mohamed Datt',
    roleTitle: chosen.roleTitle,
    email: 'd.mohamed1504@gmail.com',
    phone: '+1 518-704-9000',
    location: 'Norfolk, Virginia, USA',
    github: 'https://github.com/MeeksonJr',
    linkedin: 'https://linkedin.com/in/mohamed-datt-b60907296',
    website: 'https://meekson.me',
    summary: chosen.summary,
    skillsGroups: chosen.skillsGroups,
    experience: BASE_EXPERIENCE,
    projects: chosen.projects,
    education: BASE_EDUCATION,
    ...overrides,
  }
}
