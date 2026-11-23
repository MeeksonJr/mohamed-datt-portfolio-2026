import fs from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin-auth'

// Exclude SVG from arbitrary disk upload to mitigate stored XSS
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])

function matchesRasterMagicBytes(buf: Buffer, ext: string): boolean {
  if (buf.length < 12) return false
  if (ext === '.png') {
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  }
  if (ext === '.gif') {
    const hdr = buf.subarray(0, 6).toString('ascii')
    return hdr === 'GIF87a' || hdr === 'GIF89a'
  }
  if (ext === '.webp') {
    return (
      buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buf.subarray(8, 12).toString('ascii') === 'WEBP'
    )
  }
  return false
}

export async function POST(request: NextRequest) {
  const isAuthed = await isAdminAuthenticated()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be 5MB or smaller' }, { status: 400 })
    }

    const ext = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { error: 'Unsupported image type. Use PNG, JPG, WEBP, or GIF.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buf = Buffer.from(bytes)
    if (!matchesRasterMagicBytes(buf, ext)) {
      return NextResponse.json(
        { error: 'File signature does not match declared image format.' },
        { status: 400 }
      )
    }

    const baseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 40)
    const fileName = `${Date.now()}-${baseName || 'asset'}${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })

    await fs.writeFile(path.join(uploadDir, fileName), buf)

    return NextResponse.json({
      url: `/uploads/${fileName}`,
      name: file.name,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
