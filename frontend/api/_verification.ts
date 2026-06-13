import { redis } from './_redis'

const CODE_TTL = 120
const RATE_LIMIT_TTL = 600
const MAX_ATTEMPT = 3

export async function checkRateLimit(email: string): Promise<boolean> {
  const key = `ratelimit:${email}`
  const attempts = await redis.get<number>(key)
  if (attempts && attempts >= MAX_ATTEMPT) return false
  await redis.set(key, (attempts ?? 0) + 1, { ex: RATE_LIMIT_TTL })
  return true
}

function genCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

type VerificationPayload = {
  code: string,
  token: string
}

export async function genVerificationCode(email: string, token: string): Promise<string> {
  const key = `verify:${email}`
  const code = genCode()
  const payload: VerificationPayload = { code, token }
  await redis.set(key, payload, { ex: CODE_TTL })
  return code
}

// Settling for storing the token in Redis for now. May want to consider transition
// away from it, if this becomes a bigger deal.
export async function verifyCode(email: string, code: string): Promise<string | null> {
  const key = `verify:${email}`
  const stored = await redis.get<string>(key)
  if (!stored) return null
  const payload: VerificationPayload = typeof stored === 'string' ? JSON.parse(stored) : stored
  if (!payload || payload.code !== code) return null
  await redis.del(key)
  return payload.token
}