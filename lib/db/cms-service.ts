import fs from 'node:fs/promises'
import path from 'node:path'
import { asc, desc, eq } from 'drizzle-orm'
import { getDb, schema } from './index'
import { createInitialSnapshot } from '@/lib/content/default-portfolio-data'
import type { PortfolioStateSnapshot, SectionConfig, BentoSpan, SectionKey } from '@/lib/content/types'

const STATE_FILE = path.join(process.cwd(), 'data', 'portfolio-state.json')

async function readLocalStateFile(): Promise<PortfolioStateSnapshot | null> {
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as PortfolioStateSnapshot
    if (parsed && Array.isArray(parsed.sections) && parsed.texts) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

async function writeLocalStateFile(snapshot: PortfolioStateSnapshot): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true })
    await fs.writeFile(STATE_FILE, JSON.stringify(snapshot, null, 2), 'utf8')
    return true
  } catch {
    return false
  }
}

export async function loadPortfolioSnapshot(): Promise<{
  snapshot: PortfolioStateSnapshot
  persistence: 'drizzle' | 'local-file' | 'fallback'
}> {
  const fallback = createInitialSnapshot()
  const localOverride = await readLocalStateFile()
  const base = localOverride
    ? {
        ...fallback,
        ...localOverride,
        texts: { ...fallback.texts, ...localOverride.texts },
        planets: localOverride.planets?.length ? localOverride.planets : fallback.planets,
        projects: localOverride.projects?.length ? localOverride.projects : fallback.projects,
        milestones: localOverride.milestones?.length ? localOverride.milestones : fallback.milestones,
        mediaGallery: localOverride.mediaGallery?.length
          ? localOverride.mediaGallery
          : fallback.mediaGallery,
      }
    : fallback

  const db = getDb()
  if (!db) {
    return {
      snapshot: base,
      persistence: localOverride ? 'local-file' : 'fallback',
    }
  }

  try {
    const [sectionRows, textRows] = await Promise.all([
      db.select().from(schema.portfolioSections).orderBy(asc(schema.portfolioSections.sortOrder)),
      db.select().from(schema.contentBlocks),
    ])

    const sections: SectionConfig[] =
      sectionRows.length > 0
        ? sectionRows.map((row) => ({
            id: row.id,
            sectionKey: row.sectionKey as SectionKey,
            title: row.title,
            subtitle: row.subtitle,
            badge: row.badge,
            visible: row.visible,
            order: row.sortOrder,
            bentoSpan: (row.bentoSpan as BentoSpan) || 'full',
            accentHex: row.customStyles?.accentHex,
          }))
        : base.sections

    const texts = { ...base.texts }
    let fullSnapshotRow: PortfolioStateSnapshot | null = null
    for (const row of textRows) {
      if (row.blockKey === '__full_snapshot_json') {
        try {
          fullSnapshotRow = JSON.parse(row.value) as PortfolioStateSnapshot
        } catch {
          // Ignore malformed override JSON
        }
      } else if (row.blockKey in texts) {
        ;(texts as Record<string, string>)[row.blockKey] = row.value
      }
    }

    if (fullSnapshotRow) {
      return {
        snapshot: {
          ...base,
          ...fullSnapshotRow,
          sections,
          texts,
          updatedAt: new Date().toISOString(),
        },
        persistence: 'drizzle',
      }
    }

    return {
      snapshot: {
        ...base,
        sections,
        texts,
        updatedAt: new Date().toISOString(),
      },
      persistence: 'drizzle',
    }
  } catch {
    return {
      snapshot: base,
      persistence: localOverride ? 'local-file' : 'fallback',
    }
  }
}

export async function persistPortfolioSnapshot(
  snapshot: PortfolioStateSnapshot
): Promise<{ savedToDb: boolean; savedToFile: boolean }> {
  const savedToFile = await writeLocalStateFile(snapshot)
  const db = getDb()
  if (!db) {
    return { savedToDb: false, savedToFile }
  }

  try {
    for (const sec of snapshot.sections) {
      await db
        .insert(schema.portfolioSections)
        .values({
          sectionKey: sec.sectionKey,
          title: sec.title,
          subtitle: sec.subtitle,
          badge: sec.badge,
          visible: sec.visible,
          sortOrder: sec.order,
          bentoSpan: sec.bentoSpan,
          customStyles: sec.accentHex ? { accentHex: sec.accentHex } : {},
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.portfolioSections.sectionKey,
          set: {
            title: sec.title,
            subtitle: sec.subtitle,
            badge: sec.badge,
            visible: sec.visible,
            sortOrder: sec.order,
            bentoSpan: sec.bentoSpan,
            customStyles: sec.accentHex ? { accentHex: sec.accentHex } : {},
            updatedAt: new Date(),
          },
        })
    }

    for (const [blockKey, value] of Object.entries(snapshot.texts)) {
      await db
        .insert(schema.contentBlocks)
        .values({
          sectionKey: 'global',
          blockKey,
          contentType: 'text',
          value,
          version: snapshot.version,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.contentBlocks.blockKey,
          set: { value, version: snapshot.version, updatedAt: new Date() },
        })
    }

    await db
      .insert(schema.contentBlocks)
      .values({
        sectionKey: 'system',
        blockKey: '__full_snapshot_json',
        contentType: 'json',
        value: JSON.stringify(snapshot),
        version: snapshot.version,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.contentBlocks.blockKey,
        set: {
          value: JSON.stringify(snapshot),
          version: snapshot.version,
          updatedAt: new Date(),
        },
      })

    return { savedToDb: true, savedToFile }
  } catch {
    return { savedToDb: false, savedToFile }
  }
}

export async function listGuestbookEntries() {
  const db = getDb()
  const seeded = [
    {
      id: 'gb-1',
      authorName: 'Alex Chen',
      roleOrCompany: 'Staff Engineer',
      message: 'The 3D rocket launch into the 8-planet system is genuinely unforgettable.',
      accentColor: '#E06D43',
      createdAt: new Date('2026-11-18T14:00:00Z').toISOString(),
    },
    {
      id: 'gb-2',
      authorName: 'Sarah Jenkins',
      roleOrCompany: 'Technical Recruiter',
      message: 'ResumeForge tailored Mohamed’s 2026–2027 resume to our AI stack in seconds.',
      accentColor: '#2DD4BF',
      createdAt: new Date('2026-11-20T09:30:00Z').toISOString(),
    },
  ]

  if (!db) {
    return { entries: seeded, persistence: 'fallback' as const }
  }

  try {
    const rows = await db
      .select()
      .from(schema.guestbookEntries)
      .orderBy(desc(schema.guestbookEntries.createdAt))
      .limit(20)

    if (rows.length === 0) {
      return { entries: seeded, persistence: 'drizzle' as const }
    }

    return {
      entries: rows.map((r) => ({
        id: r.id,
        authorName: r.authorName,
        roleOrCompany: r.roleOrCompany,
        message: r.message,
        accentColor: r.accentColor,
        createdAt: r.createdAt.toISOString(),
      })),
      persistence: 'drizzle' as const,
    }
  } catch {
    return { entries: seeded, persistence: 'fallback' as const }
  }
}

export async function createGuestbookEntry(input: {
  authorName: string
  roleOrCompany: string
  message: string
  accentColor?: string
}) {
  const db = getDb()
  const entry = {
    id: `gb-${Date.now()}`,
    authorName: input.authorName,
    roleOrCompany: input.roleOrCompany || 'Visitor',
    message: input.message,
    accentColor: input.accentColor || '#E06D43',
    createdAt: new Date().toISOString(),
  }

  if (!db) {
    return { entry, savedToDb: false }
  }

  try {
    const [inserted] = await db
      .insert(schema.guestbookEntries)
      .values({
        authorName: entry.authorName,
        roleOrCompany: entry.roleOrCompany,
        message: entry.message,
        accentColor: entry.accentColor,
      })
      .returning()

    return {
      entry: {
        id: inserted.id,
        authorName: inserted.authorName,
        roleOrCompany: inserted.roleOrCompany,
        message: inserted.message,
        accentColor: inserted.accentColor,
        createdAt: inserted.createdAt.toISOString(),
      },
      savedToDb: true,
    }
  } catch {
    return { entry, savedToDb: false }
  }
}

export async function logAiInteraction(entry: {
  feature: string
  model: string
  prompt: string
  response: string
}) {
  const db = getDb()
  if (!db) return
  try {
    await db.insert(schema.aiLogs).values({
      feature: entry.feature,
      model: entry.model,
      prompt: entry.prompt.slice(0, 2000),
      response: entry.response.slice(0, 4000),
    })
  } catch {
    // Non-blocking audit log
  }
}

export async function resetPortfolioDb() {
  try {
    await fs.unlink(STATE_FILE)
  } catch {
    // Ignore if absent
  }

  const db = getDb()
  if (!db) return { resetDb: false, resetFile: true }
  try {
    await db.delete(schema.portfolioSections)
    await db.delete(schema.contentBlocks)
    return { resetDb: true, resetFile: true }
  } catch {
    return { resetDb: false, resetFile: true }
  }
}

export { eq }
