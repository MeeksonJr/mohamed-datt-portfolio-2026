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

function buildOfflineSmartResponse(query: string): {
  reply: string
  speakText: string
  uiAction?: AgentUIAction
} {
  const q = query.toLowerCase()

  if (q.includes('research') || q.includes('odu') || q.includes('neuro') || q.includes('lab')) {
    return {
      reply:
        'At Old Dominion University’s Hands-On Lab under Prof. Ajay K. Gupta, Mohamed engineered NeuroShield-ADRD (10Hz EDA/PPG + UWB spatial dementia agitation interception) and VocalPulse-Edge (contactless facial rPPG pulse detection within ±1.5 BPM), supporting 10 grant-ready NIH/NSF clinical proposals.',
      speakText:
        'Let me show you Mohamed’s ODU Hands-On Lab research, featuring NeuroShield ADRD and contactless VocalPulse Edge.',
      uiAction: { type: 'scrollTo', payload: 'research' },
    }
  }

  if (q.includes('recruiter') || q.includes('resume') || q.includes('hire') || q.includes('fit')) {
    return {
      reply:
        'I’ve switched the view to Recruiter mode and opened the AI Resume Tailor. Mohamed brings a 3.8 GPA, 1st Place out of 13 internship teams, 2 commercial SaaS sales, and 50+ repos across Next.js 16, Three.js, Drizzle ORM, Gemini AI, Python, and Flutter.',
      speakText:
        'Switching to Recruiter mode and launching the AI Resume Tailor so you can score job fit right away.',
      uiAction: { type: 'openResumeTailor' },
    }
  }

  if (q.includes('sold') || q.includes('saas') || q.includes('project') || q.includes('seospace')) {
    return {
      reply:
        'Mohamed has built and shipped 50+ repositories, including 2 sold commercial platforms like InterviewPrep AI, plus 2026–2027 flagships: ResumeForge AI + Flutter Mobile, AuditPulse AI (SEOSPACE), ClariVisit, TrustPulse AI, and 1st-Place winner EduSphere AI.',
      speakText:
        'Scrolling to the Projects Vault. Highlights include InterviewPrep AI which was sold to a private client, ResumeForge AI, and AuditPulse SEOSPACE.',
      uiAction: { type: 'scrollTo', payload: 'projects' },
    }
  }

  if (q.includes('story') || q.includes('guinea') || q.includes('nyc') || q.includes('norfolk')) {
    return {
      reply:
        'Mohamed was born in Conakry, Guinea, moved to New York City where he taught himself English, and now studies Computer Science at Old Dominion University in Norfolk, VA while shipping full-stack AI platforms.',
      speakText:
        'Jumping to Mohamed’s journey from Conakry, Guinea, to New York City, and now Norfolk, Virginia.',
      uiAction: { type: 'scrollTo', payload: 'story' },
    }
  }

  if (q.includes('neural') || q.includes('desk') || q.includes('avatar') || q.includes('3d')) {
    const mode = q.includes('neural') ? 'neural' : q.includes('desk') ? 'workstation' : 'companion'
    return {
      reply: `Switched the Three.js WebGL stage to the ${mode} preset. You can drag the 3D scene or click any orbiting tech satellite to explore.`,
      speakText: `Updating the Three.js 3D stage to the ${mode} view.`,
      uiAction: { type: 'setAvatarMode', payload: mode },
    }
  }

  if (q.includes('price') || q.includes('service') || q.includes('freelance') || q.includes('cost')) {
    return {
      reply:
        'Studio tiers range from Quick Fix & Audit ($150–$300, 1–3 days), Spatial Landing / Brand ($350–$750, 1–2 weeks), to Full AI SaaS Platform ($1,500+, 4–8 weeks with Drizzle/Supabase, Stripe & Gemini).',
      speakText: 'Here is Mohamed’s studio pricing and scope estimator.',
      uiAction: { type: 'scrollTo', payload: 'services' },
    }
  }

  return {
    reply:
      'I’m Mo-Twin, Mohamed Datt’s 2026–2027 AI concierge. Ask me about his sold SaaS apps, ODU Edge-AI research, Three.js + Next.js architecture, or say "Switch to Recruiter view" or "Open Resume Tailor".',
    speakText:
      'Hi! I am Mo-Twin, Mohamed Datt’s spatial AI concierge. Ask about his ODU research, shipped SaaS projects, or say open Resume Tailor.',
  }
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

  try {
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid prompt payload' }, { status: 400 })
    }

    const { message, history } = parsed.data
    const ai = getGeminiClient()

    if (!ai) {
      const offline = buildOfflineSmartResponse(message)
      return NextResponse.json({
        ...offline,
        provider: 'local-knowledge-engine',
      })
    }

    const systemInstruction = `${PORTFOLIO_SYSTEM_CONTEXT}

Respond strictly as a JSON object matching this schema:
{
  "reply": "Concise, helpful 2-4 sentence markdown-free response grounded strictly in Mohamed's facts.",
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
      return NextResponse.json({
        reply: rawText || buildOfflineSmartResponse(message).reply,
        speakText: rawText.slice(0, 220),
        provider: 'gemini-2.5-flash',
      })
    }
  } catch (error) {
    console.warn('[AI Agent] Falling back to offline engine:', error)
    return NextResponse.json({
      ...buildOfflineSmartResponse('projects'),
      provider: 'fallback',
    })
  }
}
