import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getGeminiClient, PORTFOLIO_SYSTEM_CONTEXT } from '@/lib/ai/portfolio-context'
import { logAiInteraction } from '@/lib/db/cms-service'
import type { AgentUIAction } from '@/lib/content/types'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'

const RequestSchema = z.object({
  message: z.string().min(1).max(1500),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
})

interface SmartResponse {
  reply: string
  speakText: string
  uiAction?: AgentUIAction
}

function matchesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term))
}

function buildOfflineSmartResponse(
  query: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): SmartResponse {
  const q = query.toLowerCase().trim()
  const lastAssistantMsg =
    [...history].reverse().find((m) => m.role === 'assistant')?.content || ''

  // 1. Specific Flagship Project Queries
  if (matchesAny(q, ['resumeforge', 'resume builder', 'resume forge'])) {
    return {
      reply:
        'ResumeForge AI is Mohamed’s cross-platform Next.js 16 + Flutter career ecosystem featuring drag-and-drop @dnd-kit section assembly, Gemini ATS job-fit scoring, Stripe subscriptions, and live @react-pdf/renderer generation—just like the Per-Part Resume Hub on this portfolio.',
      speakText:
        'ResumeForge AI is Mohamed’s cross-platform Next.js 16 and Flutter resume builder with Gemini job-fit scoring and live PDF generation.',
      uiAction: { type: 'scrollTo', payload: 'projects' },
    }
  }

  if (matchesAny(q, ['auditpulse', 'seospace', 'seo crawler'])) {
    return {
      reply:
        'AuditPulse AI (SEOSPACE) is a Next.js 15 + Puppeteer technical SEO and AI-search readiness SaaS that crawls live sites, scores Core Web Vitals & Schema.org markup, and exports executive Gemini remediation reports via Stripe-billed plans.',
      speakText:
        'AuditPulse AI, also known as SEOSPACE, is a Puppeteer crawler and Gemini SaaS generating executive SEO and AI search audits.',
      uiAction: { type: 'scrollTo', payload: 'projects' },
    }
  }

  if (matchesAny(q, ['neuroshield', 'vocalpulse', 'dementia', 'rppg', 'edafe', 'oncopareto'])) {
    return {
      reply:
        'In the ODU Hands-On Lab under Prof. Ajay K. Gupta, NeuroShield-ADRD fuses 10Hz EDA/PPG biometrics with UWB spatial entropy to intercept dementia agitation 20 minutes pre-crisis, while VocalPulse-Edge extracts contactless webcam rPPG pulse within ±1.5 BPM.',
      speakText:
        'NeuroShield ADRD and VocalPulse Edge are Mohamed’s real-time biomedical Edge-AI systems developed with the ODU Hands-On Lab.',
      uiAction: { type: 'scrollTo', payload: 'research' },
    }
  }

  if (matchesAny(q, ['interviewprep', 'edusphere', 'clarivisit', 'trustpulse', 'sold'])) {
    return {
      reply:
        'Mohamed has commercialized and sold 2 platforms including InterviewPrep AI (Vapi voice mock interviews + Gemini feedback + PostgreSQL), and won 1st Place out of 13 competing teams with EduSphere AI alongside recent Next.js 16 SaaS builds like ClariVisit and TrustPulse AI.',
      speakText:
        'Mohamed sold InterviewPrep AI to a private client and led EduSphere AI to 1st Place out of 13 competing engineering teams.',
      uiAction: { type: 'scrollTo', payload: 'projects' },
    }
  }

  // 2. Skills, Tech Stack & Languages ("what are your skills", "stack", "what do you use")
  if (
    matchesAny(q, [
      'skill',
      'stack',
      'tech',
      'language',
      'framework',
      'frontend',
      'backend',
      'database',
      'typescript',
      'react',
      'next',
      'python',
      'c++',
      'flutter',
      'drizzle',
      'supabase',
      'postgres',
    ])
  ) {
    return {
      reply:
        'Mohamed’s core stack spans 4 pillars: Frontend & 3D (Next.js 15/16, React 19, TypeScript, Three.js / React Three Fiber, Tailwind v4), Backend & Data (PostgreSQL, Drizzle ORM, Supabase RLS, Node.js, Stripe), AI & Edge Research (Google Gemini @google/genai, voice agents, PyTorch/Python, 10Hz clinical telemetry), and Mobile & Systems (Flutter/Dart, C++, Playwright, Vitest).',
      speakText:
        'Mohamed specializes in Next.js 16, React 19, TypeScript, Three.js WebGL, PostgreSQL with Drizzle ORM, Google Gemini AI, Python, C++, and Flutter.',
      uiAction: { type: 'scrollTo', payload: 'skills' },
    }
  }

  // 3. What Mohamed is Doing Now ("what do you do now?", "currently working on", "today")
  if (
    matchesAny(q, [
      'do now',
      'right now',
      'currently',
      'working on',
      'these days',
      'present',
      'what do you do',
      'about you',
      'who is',
      'who are you',
    ])
  ) {
    return {
      reply:
        'Right now (2026–2027), Mohamed is pursuing his B.S. in Computer Science at Old Dominion University in Norfolk, VA, leading biomedical & defense Edge-AI demonstrators at ODU’s Hands-On Lab (10 grant proposals), and shipping full-stack AI SaaS products like ResumeForge AI and AuditPulse AI while taking select freelance engineering builds.',
      speakText:
        'Right now Mohamed is studying Computer Science at ODU, building clinical Edge-AI systems in the Hands-On Lab, and shipping AI SaaS platforms.',
      uiAction: { type: 'scrollTo', payload: 'story' },
    }
  }

  // 4. Education, University & GPA
  if (matchesAny(q, ['education', 'gpa', 'school', 'college', 'university', 'odu', 'tcc', 'degree', 'major', 'study'])) {
    if (matchesAny(q, ['research', 'lab', 'grant'])) {
      return {
        reply:
          'At Old Dominion University’s Hands-On Lab (with Prof. Ajay K. Gupta & Brock Virginia Health Sciences), Mohamed architects NeuroShield-ADRD and VocalPulse-Edge and has co-authored 10 federal grant-ready proposals targeting NIH, NSF, and DoD initiatives.',
        speakText:
          'Scrolling to Mohamed’s ODU Hands-On Lab section showcasing NeuroShield ADRD and VocalPulse Edge.',
        uiAction: { type: 'scrollTo', payload: 'research' },
      }
    }
    return {
      reply:
        'Mohamed earned his A.S. in Computer Science from Tidewater Community College with a 3.8 GPA and Dean’s List honors (Dec 2024), and is completing his B.S. in Computer Science at Old Dominion University (Norfolk, VA), focusing on AI, Operating Systems, Algorithms, and Database Systems.',
      speakText:
        'Mohamed graduated from Tidewater Community College with a 3.8 GPA on the Dean’s List and is pursuing his B.S. in Computer Science at Old Dominion University.',
      uiAction: { type: 'scrollTo', payload: 'story' },
    }
  }

  // 5. Experience, Internship & Awards
  if (matchesAny(q, ['experience', 'intern', 'job history', 'work history', 'award', '1st place', 'competition', 'win', 'achieve'])) {
    return {
      reply:
        'Key milestones include: Undergraduate Edge-AI Researcher at ODU Hands-On Lab (2025–Present), Independent AI SaaS Founder with 2 commercial sales (2024–Present), and 1st Place out of 13 competing engineering teams as Software Developer Intern at Product Manager Accelerator leading EduSphere AI.',
      speakText:
        'Mohamed won 1st Place out of 13 teams during his software engineering internship, sold 2 commercial SaaS platforms, and researches Edge-AI at ODU.',
      uiAction: { type: 'scrollTo', payload: 'testimonials' },
    }
  }

  // 6. Research & Lab
  if (matchesAny(q, ['research', 'lab', 'grant', 'clinical', 'health'])) {
    return {
      reply:
        'At Old Dominion University’s Hands-On Lab under Prof. Ajay K. Gupta, Mohamed engineered NeuroShield-ADRD (10Hz EDA/PPG + UWB spatial dementia agitation interception) and VocalPulse-Edge (contactless facial rPPG pulse within ±1.5 BPM), supporting 10 grant-ready NIH/NSF proposals.',
      speakText:
        'Let me show you Mohamed’s ODU Hands-On Lab research, featuring NeuroShield ADRD and contactless VocalPulse Edge.',
      uiAction: { type: 'scrollTo', payload: 'research' },
    }
  }

  // 7. Recruiter / Resume / Job Fit / Hire
  if (matchesAny(q, ['recruiter', 'resume', 'cv', 'fit', 'pdf', 'hire', 'role', 'interview'])) {
    return {
      reply:
        'I switched the view to Recruiter mode and opened the AI Resume Tailor. Mohamed also has an on-page Per-Part Resume Hub (#section-resume) with 5 tailored tracks (Recruiter SWE, Systems & 3D, ODU Lab, SaaS Founder, Master) and instant PDF export.',
      speakText:
        'Switching to Recruiter mode and launching the AI Resume Tailor so you can score job fit right away.',
      uiAction: { type: 'openResumeTailor' },
    }
  }

  // 8. Contact / Email / Phone / GitHub / LinkedIn
  if (matchesAny(q, ['contact', 'email', 'phone', 'reach', 'call', 'linkedin', 'github', 'connect', 'message'])) {
    return {
      reply:
        'You can reach Mohamed directly at d.mohamed1504@gmail.com or +1 518-704-9000, inspect his 50+ repos at github.com/MeeksonJr, or send a direct brief in the Contact section below.',
      speakText:
        'You can email Mohamed directly at d dot mohamed 1504 at gmail dot com or scroll to the Contact section.',
      uiAction: { type: 'scrollTo', payload: 'contact' },
    }
  }

  // 9. Projects Overview
  if (matchesAny(q, ['project', 'saas', 'build', 'portfolio', 'app', 'work', 'repo'])) {
    return {
      reply:
        'Across 50+ repositories, standout builds include ResumeForge AI (Next.js 16 + Flutter), AuditPulse AI / SEOSPACE (Puppeteer SEO SaaS), InterviewPrep AI (sold to private client), 1st-Place winner EduSphere AI, NeuroShield-ADRD, and C++/Python systems tools.',
      speakText:
        'Scrolling to the Selected Work vault featuring ResumeForge AI, AuditPulse, InterviewPrep AI, and EduSphere AI.',
      uiAction: { type: 'scrollTo', payload: 'projects' },
    }
  }

  // 10. Origin Story / Languages
  if (matchesAny(q, ['story', 'guinea', 'nyc', 'new york', 'norfolk', 'origin', 'french', 'background'])) {
    return {
      reply:
        'Born in Conakry, Guinea, Mohamed moved to New York City where he taught himself English before relocating to Norfolk, VA. Fluent in French and English, he pairs resilience with full-stack & Edge-AI engineering.',
      speakText:
        'Jumping to Mohamed’s journey from Conakry, Guinea, to New York City, and now Norfolk, Virginia.',
      uiAction: { type: 'scrollTo', payload: 'story' },
    }
  }

  // 11. 3D Space Odyssey / Avatar
  if (matchesAny(q, ['neural', 'desk', 'avatar', '3d', 'space', 'planet', 'rocket', 'odyssey'])) {
    const mode = q.includes('neural') ? 'neural' : q.includes('desk') ? 'workstation' : 'companion'
    return {
      reply:
        'Click any "Launch 3D Space" rocket button to fly into the 8-Planet Three.js Space Odyssey (with tethered Hologram Console and orbiting 3D moons), or stay here on the Dribbble Editorial Terrestrial Home.',
      speakText: `Updating the Three.js stage to the ${mode} view.`,
      uiAction: { type: 'setAvatarMode', payload: mode },
    }
  }

  // 12. Pricing / Studio / Stripe
  if (matchesAny(q, ['price', 'pricing', 'service', 'freelance', 'cost', 'stripe', 'package', 'tier'])) {
    return {
      reply:
        'Studio packages on live Stripe Checkout include Quick Fix & Audit ($276), Spatial Landing / Brand ($756, most popular), and Full AI SaaS Platform ($1,800+), plus an interactive add-on Scope Estimator.',
      speakText: 'Scrolling to Mohamed’s Stripe-connected SaaS Architecture & Freelance Studio packages.',
      uiAction: { type: 'scrollTo', payload: 'services' },
    }
  }

  // Conversational Anti-Repeat Rotation for greetings / vague follow-ups ("tell me more", "hello", etc.)
  const rotatingHighlights: SmartResponse[] = [
    {
      reply:
        'I’m Mo-Twin, Mohamed Datt’s AI concierge. Ask me directly about his tech skills ("Next.js, TypeScript, Python, C++"), what he’s building right now at ODU, his sold SaaS products, GPA/education, or say "Open Resume Tailor".',
      speakText:
        'Hi! Ask me about Mohamed’s skills, what he builds at ODU, his sold SaaS platforms, or open his interactive resume.',
    },
    {
      reply:
        'Quick highlights: Mohamed maintains 50+ repos across TypeScript, Python, C++, and Dart/Flutter, holds a 3.8 GPA (TCC -> ODU Computer Science), won 1st Place out of 13 internship teams, and sold 2 commercial SaaS products. Want to see his Projects, Research Lab, or Per-Part Resume?',
      speakText:
        'Mohamed maintains over 50 repositories, won 1st place in his internship competition, and sold two commercial SaaS platforms.',
      uiAction: { type: 'scrollTo', payload: 'projects' },
    },
    {
      reply:
        'At Old Dominion University’s Hands-On Lab, Mohamed builds real-time 10Hz clinical biometric software (NeuroShield-ADRD) and contactless webcam heart-rate extraction (VocalPulse-Edge) alongside NIH/NSF grant architectures.',
      speakText:
        'In the ODU Hands-On Lab, Mohamed engineers real-time biomedical Edge-AI systems including NeuroShield ADRD.',
      uiAction: { type: 'scrollTo', payload: 'research' },
    },
  ]

  const nonRepeating = rotatingHighlights.find((item) => item.reply !== lastAssistantMsg)
  return nonRepeating || rotatingHighlights[1]
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = checkRateLimit(`ai-agent:${ip}`, 25, 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit reached. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429, headers: { 'Retry-After': rl.retryAfterSeconds.toString() } }
    )
  }

  let safeMessage = ''
  let safeHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []

  try {
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid prompt payload' }, { status: 400 })
    }

    const { message, history } = parsed.data
    safeMessage = message
    safeHistory = history

    const ai = getGeminiClient()

    if (!ai) {
      const offline = buildOfflineSmartResponse(message, history)
      return NextResponse.json({
        ...offline,
        provider: 'local-knowledge-engine',
      })
    }

    const systemInstruction = `${PORTFOLIO_SYSTEM_CONTEXT}

Respond strictly as a JSON object matching this schema:
{
  "reply": "Concise, helpful 2-4 sentence markdown-free response answering the visitor's exact question using Mohamed's real facts.",
  "speakText": "Natural 1-2 sentence spoken summary optimized for voice output.",
  "uiAction": {
    "type": "scrollTo" | "setPersona" | "filterProjects" | "setAvatarMode" | "setAvatarMood" | "openResumeTailor" | "toggleStudio",
    "payload": "optional string: sectionKey (hero|story|projects|research|skills|services|testimonials|contact), persona (all|recruiter|engineer|research|client), category (All|AI & SaaS|ODU Research|Mobile & Systems|Sold & Client), avatarMode (companion|neural|workstation), or avatarMood (idle|listening|speaking|coding|celebrating)"
  }
}
Omit uiAction if no navigation or UI change is relevant.`

    const conversation = history
      .slice(-6)
      .map((h) => `${h.role === 'user' ? 'Visitor' : 'Mo-Twin'}: ${h.content}`)
      .join('\n')

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${conversation ? `${conversation}\n` : ''}Visitor: ${message}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    })

    const rawText = response.text || ''
    try {
      const json = JSON.parse(rawText) as {
        reply: string
        speakText: string
        uiAction?: AgentUIAction
      }
      await logAiInteraction({
        feature: 'agent-concierge',
        model: 'gemini-2.5-flash',
        prompt: message,
        response: json.reply,
      })
      return NextResponse.json({
        reply: json.reply,
        speakText: json.speakText || json.reply,
        uiAction: json.uiAction,
        provider: 'gemini-2.5-flash',
      })
    } catch {
      const fallback = buildOfflineSmartResponse(message, history)
      return NextResponse.json({
        reply: rawText || fallback.reply,
        speakText: rawText ? rawText.slice(0, 220) : fallback.speakText,
        uiAction: fallback.uiAction,
        provider: 'gemini-2.5-flash',
      })
    }
  } catch (error) {
    console.warn('[AI Agent] Falling back to offline engine:', error)
    return NextResponse.json({
      ...buildOfflineSmartResponse(safeMessage, safeHistory),
      provider: 'fallback',
    })
  }
}
