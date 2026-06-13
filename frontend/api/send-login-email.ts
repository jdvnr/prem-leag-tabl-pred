import { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { supabase } from './_supabase'
import { checkRateLimit, genVerificationCode } from './_verification'

export type LoginResponse = {
  user_id: string
  token: string
}
const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { email } = req.body



  if (!email) {
    return res.status(400).json({ error: 'Request malformed' })
  }

  const allowed = await checkRateLimit(email)
  if (!allowed) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 10 minutes' })
  }
  const userData = await loginAttempt(email)
  if (!userData) return res.status(500).json({ error: 'Failed user look-up' })

  const code = await genVerificationCode(email, userData.token)
  const { error } = await resend.emails.send({
    from: "That's Offside! <onboarding@resend.dev>",
    to: email,
    subject: "Here's your verification code: ",
    html: `
      <p> Here's your verification code for That's Offside:</p>
      <h2 style="letter-spacing: 0.3em; font-size: 2rem;">${code}</h2>
      <p>This code will expire in 2 minutes.</p>
      <p>If you didn't request this, fret not, no one can access your account.</p>
    `
  })
  if (error) {
    console.error('Resend error: ', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }
  return res.status(200).json({ success: true })
}

async function loginAttempt(email: string): Promise<LoginResponse | null> {
  const { data, error } = await supabase.rpc('login', {
    p_email: email
  })
  if (error) return null
  return data as LoginResponse
}