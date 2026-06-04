import { Resend } from 'resend'
import { supabase } from './_supabase'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { log } from 'console'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, firstName, lastName } = req.body

  if (!email || !firstName || !lastName) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const { data, error: dbError } = await supabase.rpc('upsert_user', {
    p_first_name: firstName,
    p_last_name: lastName,
    p_email: email,
  })
  if (dbError) return res.status(500).json({ error: 'Failed to create user' })

  const token = data.token
  if (!email || !token || !firstName || !lastName) {
    return Response.json({ error: 'Request malformed' }, { status: 400 })
  }

  const loginUrl = `${process.env.VITE_APP_URL}/predict?token=${token}`
  console.log('Creating url: %s - attempting email', loginUrl)
  const { error: emailError } = await resend.emails.send({
    from: "That's Offside! <onboarding@resend.dev>",
    to: 'nair.jayadev@gmail.com',
    subject: "Welcome to That's Offside!",
    html: `
      <p> You're now registered at That's Offside! Here's your login link:</p>
      <a href="${loginUrl}">${loginUrl}</a>
      <p>This link will take you directly to your logged-in experience.</p>
      <p>You can reuse this link to sign-in every time - but keep it to yourself!</p>
    `
  })
  if (emailError) {
    return res.status(500).json({ error: 'Failed to send email' })
  }
  return res.status(200).json({ success: true })
}