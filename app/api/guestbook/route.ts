import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createGuestbookEntry, listGuestbookEntries } from '@/lib/db/cms-service'
import { checkRateLimit, getClientIp, stripHtmlTags } from '@/lib/security/rate-limit'

const EntrySchema = z.object({
  authorName: z.string().min(2).max(60),
  roleOrCompany: z.string().max(80).optional().default('Visitor'),
  message: z.string().min(4).max(280),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export async function GET() {
  const data = await listGuestbookEntries()
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = checkRateLimit(`guestbook:${ip}`, 5, 10 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit reached. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429, headers: { 'Retry-After': rl.retryAfterSeconds.toString() } }
    )
  }

  try {
    const body = await request.json()
    const parsed = EntrySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please enter your name and a short note (4-280 chars).' },
        { status: 400 }
      )
    }
    const cleanData = {
      ...parsed.data,
      authorName: stripHtmlTags(parsed.data.authorName),
      roleOrCompany: stripHtmlTags(parsed.data.roleOrCompany),
      message: stripHtmlTags(parsed.data.message),
    }
    const result = await createGuestbookEntry(cleanData)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to post entry' },
      { status: 500 }
    )
  }
}
