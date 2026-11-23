import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  isAdminAuthenticated,
  verifyAdminPasscode,
} from '@/lib/auth/admin-auth'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'

export async function GET() {
  const authenticated = await isAdminAuthenticated()
  return NextResponse.json({ authenticated })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = checkRateLimit(`admin-auth:${ip}`, 5, 15 * 60 * 1000)

  if (!rl.allowed) {
    return NextResponse.json(
      {
        authenticated: false,
        error: `Too many login attempts. Please wait ${rl.retryAfterSeconds}s before retrying.`,
      },
      {
        status: 429,
        headers: { 'Retry-After': rl.retryAfterSeconds.toString() },
      }
    )
  }

  try {
    const body = await request.json()
    const passcode = typeof body?.passcode === 'string' ? body.passcode : ''

    if (!verifyAdminPasscode(passcode)) {
      return NextResponse.json(
        {
          authenticated: false,
          error: 'Invalid vault passcode',
        },
        { status: 401 }
      )
    }

    const token = createAdminSessionToken()
    const response = NextResponse.json({ authenticated: true })
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
    })
    return response
  } catch {
    return NextResponse.json(
      { authenticated: false, error: 'Authentication failed' },
      { status: 400 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false })
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
