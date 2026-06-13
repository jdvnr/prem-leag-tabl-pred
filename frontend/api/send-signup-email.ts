import { Resend } from 'resend'
import { supabase } from './_supabase'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { checkRateLimit, genVerificationCode } from './_verification'

export type UpsertUserResponse = {
  user_id: string,
  token: string,
  is_new: boolean
}

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, firstName, lastName } = req.body

  if (!email || !firstName || !lastName) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const allowed = await checkRateLimit(email)
  if (!allowed) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' })
  }

  const userData = await upsertUser(firstName, lastName, email)

  if (!userData) return res.status(500).json({ error: 'Failed to create user' })

  const code = await genVerificationCode(email, userData.token)
  console.log('Attempting to send email to: ', email)
  const { data: emailData, error: emailError } = await resend.emails.send({
    from: "That's Offside! <onboarding@resend.dev>",
    to: 'nair.jayadev@gmail.com',
    subject: "Welcome to That's Offside!",
    html: `
      <p> You're now registered at That's Offside! Here's your verification code:</p>
      <h2 style="letter-spacing: 0.3em; font-size: 2rem;">${code}</h2>
      <p> Use this code within 2 minutes to login and get predicting.</p>
    `
  })
  console.log('Resend data:', JSON.stringify(emailData))
  console.log('Resend error:', JSON.stringify(emailError))
  if (emailError) {
    return res.status(500).json({ error: 'Failed to send email' })
  }
  return res.status(200).json({ success: true })
}

async function upsertUser(
  firstName: string,
  lastName: string,
  email: string
): Promise<UpsertUserResponse | null> {
  const { data, error } = await supabase.rpc('upsert_user', {
    'p_first_name': firstName,
    'p_last_name': lastName,
    'p_email': email,
  })
  if (error) return null
  return data as UpsertUserResponse
}