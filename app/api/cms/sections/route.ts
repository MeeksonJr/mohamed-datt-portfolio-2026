import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isAdminAuthenticated } from '@/lib/auth/admin-auth'
import {
  loadPortfolioSnapshot,
  persistPortfolioSnapshot,
  resetPortfolioDb,
} from '@/lib/db/cms-service'
import type { PortfolioStateSnapshot } from '@/lib/content/types'

const UpdateSnapshotSchema = z.object({
  snapshot: z.object({
    version: z.number(),
    updatedAt: z.string(),
    avatarMode: z.enum(['companion', 'neural', 'workstation']),
    texts: z.record(z.string(), z.string()),
    sections: z.array(z.any()),
    planets: z.array(z.any()),
    projects: z.array(z.any()),
    milestones: z.array(z.any()),
    mediaGallery: z.array(z.any()),
  }),
})

export async function GET() {
  const data = await loadPortfolioSnapshot()
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const isAuthed = await isAdminAuthenticated()
  if (!isAuthed) {
    return NextResponse.json(
      { error: 'Unauthorized: Please unlock the Admin Vault at /admin first.' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const parsed = UpdateSnapshotSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid layout snapshot payload', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await persistPortfolioSnapshot(
      parsed.data.snapshot as unknown as PortfolioStateSnapshot
    )
    return NextResponse.json({
      ...result,
      message: result.savedToDb
        ? 'Persisted to PostgreSQL (Drizzle) & local server backup'
        : result.savedToFile
          ? 'Saved to server portfolio state (persists for all visitors)'
          : 'Updated snapshot',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save snapshot' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const isAuthed = await isAdminAuthenticated()
  if (!isAuthed) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required.' },
      { status: 401 }
    )
  }
  const result = await resetPortfolioDb()
  return NextResponse.json(result)
}
