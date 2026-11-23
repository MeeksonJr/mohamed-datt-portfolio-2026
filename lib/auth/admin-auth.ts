import crypto from 'node:crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE_NAME = 'mo_admin_session'

const PASSCODE_SALT = 'mo-horizon-v1-salt-2026'
// Salted 64-byte scrypt digest; raw passcode is never stored in source or logs
const EXPECTED_SCRYPT_HEX =
  'b2b94bcdeccab196b0d879cfe4f53f60d5eaa6b1ed5aaf3fe81b7bfa40c5703cdf8911b92cf1bbf70e132a469f4e4b8a70b66a3a58738bc24da5b8863021bdf9'

function getSigningSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    `${EXPECTED_SCRYPT_HEX.slice(0, 32)}:${process.env.DATABASE_URL || 'local-vault'}`
  )
}

export function verifyAdminPasscode(candidate: string): boolean {
  if (!candidate || typeof candidate !== 'string') return false
  try {
    const derived = crypto.scryptSync(candidate.trim(), PASSCODE_SALT, 64)
    const expected = Buffer.from(EXPECTED_SCRYPT_HEX, 'hex')
    if (derived.length !== expected.length) return false
    return crypto.timingSafeEqual(derived, expected)
  } catch {
    return false
  }
}

export function createAdminSessionToken(): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24 // 24 hours
  const nonce = crypto.randomBytes(12).toString('hex')
  const payload = `${exp}.${nonce}`
  const sig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('hex')
  return `${payload}.${sig}`
}

export function verifyAdminSessionToken(token?: string | null): boolean {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [expStr, nonce, sig] = parts
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp < Date.now()) return false

  const payload = `${expStr}.${nonce}`
  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('hex')

  const sigBuf = Buffer.from(sig, 'hex')
  const expectedBuf = Buffer.from(expectedSig, 'hex')
  if (sigBuf.length !== expectedBuf.length) return false
  return crypto.timingSafeEqual(sigBuf, expectedBuf)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const store = await cookies()
    const token = store.get(ADMIN_COOKIE_NAME)?.value
    return verifyAdminSessionToken(token)
  } catch {
    return false
  }
}
