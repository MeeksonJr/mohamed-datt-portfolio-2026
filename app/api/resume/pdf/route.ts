import React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { pdf } from '@react-pdf/renderer'
import { z } from 'zod'
import { ResumePdfDocument } from '@/components/resume/ResumePdfDocument'
import { buildPersonaResume } from '@/lib/resume/resume-presets'
import type { PersonaId } from '@/lib/content/types'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PostPdfSchema = z.object({
  persona: z.enum(['all', 'recruiter', 'engineer', 'research', 'client']).optional(),
  overrides: z
    .object({
      roleTitle: z.string().max(140).optional(),
      summary: z.string().max(900).optional(),
    })
    .optional(),
})

function normalizePersona(val?: string | null): PersonaId {
  if (
    val === 'recruiter' ||
    val === 'engineer' ||
    val === 'research' ||
    val === 'client' ||
    val === 'all'
  ) {
    return val
  }
  return 'all'
}

async function generatePdfResponse(
  persona: PersonaId,
  disposition: 'inline' | 'attachment',
  overrides?: { roleTitle?: string; summary?: string }
) {
  const resumeData = buildPersonaResume(persona, overrides)
  const doc = React.createElement(ResumePdfDocument, { data: resumeData })
  const blob = await pdf(doc as never).toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${disposition}; filename="Mohamed-Datt-Resume-${persona}-2026.pdf"`,
      'Content-Length': buffer.length.toString(),
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = checkRateLimit(`resume-pdf:${ip}`, 25, 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many PDF requests. Please wait briefly.' },
      { status: 429, headers: { 'Retry-After': rl.retryAfterSeconds.toString() } }
    )
  }

  try {
    const persona = normalizePersona(request.nextUrl.searchParams.get('persona'))
    const dispParam = request.nextUrl.searchParams.get('disposition')
    const disposition = dispParam === 'inline' ? 'inline' : 'attachment'
    return await generatePdfResponse(persona, disposition)
  } catch (error) {
    console.error('[RESUME_PDF_GET]', error)
    return NextResponse.json({ error: 'Failed to render resume PDF' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = checkRateLimit(`resume-pdf:${ip}`, 25, 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many PDF requests. Please wait briefly.' },
      { status: 429, headers: { 'Retry-After': rl.retryAfterSeconds.toString() } }
    )
  }

  try {
    const body = await request.json()
    const parsed = PostPdfSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid PDF request payload' }, { status: 400 })
    }
    const persona = normalizePersona(parsed.data.persona)
    return await generatePdfResponse(persona, 'attachment', parsed.data.overrides)
  } catch (error) {
    console.error('[RESUME_PDF_POST]', error)
    return NextResponse.json({ error: 'Failed to render tailored resume PDF' }, { status: 500 })
  }
}
