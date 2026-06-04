import { Resend } from 'resend'
import { supabase } from './_supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }
  const { email, firstName, lastName } = await req.json()
  let { data, error } = await supabase.rpc('upsert_user', {
    p_first_name: firstName,
    p_last_name: lastName,
    p_email: email,
  })
  if (error) return Response.json({ error: 'Failed to create user' }, { status: 500 })

  const token = data.token
  if (!email || !token || !firstName || !lastName) {
    return Response.json({ error: 'Request malformed' }, { status: 400 })
  }

  const res = await sendEmail(email, token)
  if (!res.ok) throw new Error('Failed to send email')
  return Response.json({ success: true })
}

async function sendEmail(email: string, token: string): Promise<Response> {
  const loginUrl = `${process.env.VITE_APP_URL}/predict?token=${token}`
  let { error } = await resend.emails.send({
    from: "That's Offside! <noreply@thatsoffside.com",
    to: email,
    subject: "Welcome to That's Offside!",
    html: `
      <p> You're now registered at That's Offside! Here's your login link:</p>
      <a href="${loginUrl}">${loginUrl}</a>
      <p>This link will take you directly to your logged-in experience.</p>
      <p>You can reuse this link to sign-in every time - but keep it to yourself!</p>
    `
  })
  if (error) {
    console.error('Resend error: ', error)
    return Response.json({ error: 'Failed to send email' }, { status: 500 })
  }
  return Response.json({ success: true })
}