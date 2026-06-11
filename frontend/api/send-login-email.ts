import { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { supabase } from './_supabase'

export type LoginResponse = {
  user_id: string
  token: string
}
const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { email } = await req.body
  const userData = await loginAttempt(email)
  if (!userData) return res.status(500).json({ error: 'Failed user look-up' })

  const token = userData.token
  if (!email || !token) {
    return res.status(400).json({ error: 'Request malformed' })
  }

  const loginUrl = `${process.env.VITE_APP_URL}/predict?token=${token}`
  const { error } = await resend.emails.send({
    from: "That's Offside! <onboarding@resend.dev>",
    to: email,
    subject: "Your login link - That's Offside!",
    html: `
      <p> Here's your login link for That's Offside:</p>
      <a href="${loginUrl}">${loginUrl}</a>
      <p>This link will take you directly to your logged-in experience.</p>
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