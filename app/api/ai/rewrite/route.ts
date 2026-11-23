import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getGeminiClient } from '@/lib/ai/portfolio-context'
import { isAdminAuthenticated } from '@/lib/auth/admin-auth'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'

const RewriteSchema = z.object({
  text: z.string().min(3).max(2000),
  tone: z.enum(['Executive', 'Technical', 'Punchy', 'Academic']),
  field: z.string().max(80).optional(),
})

function offlineRewrite(text: string, tone: string): string {
  const clean = text.trim()
  if (tone === 'Punchy') {
    return clean.length > 110
      ? `${clean.slice(0, 105).replace(/[.,;:\s]+$/, '')}. Built to ship.`
      : `${clean}`
  }
  if (tone === 'Executive') {
    return `${clean} Proven across commercial SaaS acquisitions and award-winning engineering delivery.`
  }
  if (tone === 'Technical') {
    return `${clean} Powered by Next.js App Router, Three.js WebGL, Drizzle ORM, and @google/genai.`
  }
  return `${clean} Grounded in R1 biomedical & systems computing research at Old Dominion University.`
}

export async function POST(request: NextRequest) {
  const isAuthed = await isAdminAuthenticated()
  if (!isAuthed) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin Vault authentication required.' },
      { status: 401 }
    )
  }

  const ip = getClientIp(request)
  const rl = checkRateLimit(`ai-rewrite:${ip}`, 20, 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait briefly.' },
      { status: 429, headers: { 'Retry-After': rl.retryAfterSeconds.toString() } }
    )
  }

  try {
    const body = await request.json()
    const parsed = RewriteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid rewrite request' }, { status: 400 })
    }

    const { text, tone, field } = parsed.data
    const ai = getGeminiClient()

    if (!ai) {
      return NextResponse.json({
        rewritten: offlineRewrite(text, tone),
        provider: 'local-rewrite',
      })
    }

    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following portfolio copy (${field || 'section text'}) in a crisp ${tone} tone. Preserve all factual metrics and keep a similar length. Return only the rewritten text with no quotes or markdown wrapping.\n\nOriginal:\n${text}`,
      config: { temperature: 0.6 },
    })

    return NextResponse.json({
      rewritten: (res.text || text).trim(),
      provider: 'gemini-2.5-flash',
    })
  } catch {
    return NextResponse.json({ error: 'Rewrite failed' }, { status: 500 })
  }
}
