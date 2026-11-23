import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getGeminiClient, PORTFOLIO_SYSTEM_CONTEXT } from '@/lib/ai/portfolio-context'
import { DEFAULT_PROJECTS } from '@/lib/content/default-portfolio-data'
import { logAiInteraction } from '@/lib/db/cms-service'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'

const TailorSchema = z.object({
  jobDescription: z.string().min(12).max(6000),
})

function buildOfflineTailorResult(jd: string) {
  const lower = jd.toLowerCase()
  const keywords = [
    { token: 'next', label: 'Next.js 15/16 App Router' },
    { token: 'react', label: 'React 19 & TypeScript' },
    { token: 'three', label: 'Three.js / WebGL 3D' },
    { token: 'ai', label: 'Gemini AI & Agentic Systems' },
    { token: 'gemini', label: 'Google @google/genai SDK' },
    { token: 'python', label: 'Python & FastAPI / ML' },
    { token: 'flutter', label: 'Flutter / Dart Cross-Platform' },
    { token: 'postgres', label: 'PostgreSQL & Drizzle ORM' },
    { token: 'supabase', label: 'Supabase RLS & Auth' },
    { token: 'c++', label: 'C++ Systems & Data Pipelines' },
  ]

  const matchedSkills = keywords
    .filter((k) => lower.includes(k.token))
    .map((k) => k.label)

  const resolvedSkills =
    matchedSkills.length > 0
      ? matchedSkills
      : ['Next.js 16 & React 19', 'TypeScript & Drizzle ORM', 'Gemini AI Multimodal Integration']

  const matchedProjects = DEFAULT_PROJECTS.filter((p) => {
    const hay = `${p.title} ${p.description} ${p.techStack.join(' ')}`.toLowerCase()
    return resolvedSkills.some((sk) => hay.includes(sk.split(' ')[0].toLowerCase()))
  }).slice(0, 3)

  const projectsOut =
    matchedProjects.length > 0 ? matchedProjects.map((p) => p.title) : ['ResumeForge AI + Mobile', 'AuditPulse AI (SEOSPACE)', 'NeuroShield-ADRD']

  const score = Math.min(97, 82 + resolvedSkills.length * 3)

  return {
    matchScore: score,
    roleTitle: lower.includes('research')
      ? 'AI & Edge Systems Researcher'
      : lower.includes('frontend')
        ? 'Senior Frontend / Spatial Web Engineer'
        : 'Full-Stack AI Engineer',
    tailoredSummary:
      'Full-Stack AI Engineer (3.8 GPA, 1st Place Internship Winner, 2 commercial SaaS sales) with deep production expertise across Next.js 16, React 19, TypeScript, PostgreSQL/Drizzle ORM, and Google Gemini multimodal agent systems.',
    executivePitch:
      'Mohamed combines commercial shipping velocity (InterviewPrep AI sold to a private client, ResumeForge AI across web & Flutter) with rigorous R1 Edge-AI engineering at Old Dominion University.',
    matchedProjects: projectsOut,
    matchedSkills: resolvedSkills,
    talkingPoints: [
      'Shipped 50+ polyglot repositories across TypeScript, Python, Dart/Flutter, and C++.',
      'Won 1st Place out of 13 competing teams at Product Manager Accelerator (Fall 2024).',
      'Built real-time multimodal voice & clinical Edge-AI telemetry systems (NeuroShield-ADRD, VocalPulse-Edge).',
    ],
    provider: 'local-matcher',
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = checkRateLimit(`ai-tailor:${ip}`, 15, 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit reached. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429, headers: { 'Retry-After': rl.retryAfterSeconds.toString() } }
    )
  }

  try {
    const body = await request.json()
    const parsed = TailorSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please paste at least a short job description or project brief (12+ chars).' },
        { status: 400 }
      )
    }

    const { jobDescription } = parsed.data
    const ai = getGeminiClient()

    if (!ai) {
      return NextResponse.json(buildOfflineTailorResult(jobDescription))
    }

    const prompt = `Analyze this job description or project brief against Mohamed Datt's exact background and output strictly valid JSON:
{
  "matchScore": number between 75 and 98,
  "roleTitle": "concise role title tailored to the JD",
  "tailoredSummary": "2-3 sentence tailored resume summary",
  "executivePitch": "2 sentence pitch explaining why Mohamed is an immediate high-impact fit",
  "matchedProjects": ["up to 3 exact project names from Mohamed's portfolio"],
  "matchedSkills": ["up to 6 matched technologies from Mohamed's actual stack"],
  "talkingPoints": ["3 concrete bullet highlights backed strictly by his real achievements"]
}

Job Description / Brief:
${jobDescription}`

    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: PORTFOLIO_SYSTEM_CONTEXT,
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    })

    const parsedJson = JSON.parse(res.text || '{}')
    await logAiInteraction({
      feature: 'resume-tailor',
      model: 'gemini-2.5-flash',
      prompt: jobDescription.slice(0, 400),
      response: parsedJson.executivePitch || '',
    })

    return NextResponse.json({
      ...parsedJson,
      provider: 'gemini-2.5-flash',
    })
  } catch (error) {
    console.warn('[Resume Tailor] Fallback used:', error)
    return NextResponse.json(buildOfflineTailorResult('fullstack nextjs ai'))
  }
}
