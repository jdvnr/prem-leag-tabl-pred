import { supabase } from './_supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }
  const { email } = await req.json()
  const { data, error } = await supabase.rpc('login', {
    p_email: email
  })
  if (error) throw error

  const token = data.token
  if (!email || !token) {
    return Response.json({ error: 'Request malformed' }, { status: 400 })
  }

  const res = await sendEmail(email, token)
  if (!res.ok) throw new Error('Failed to send login email')
  return Response.json({ success: true })
}

async function sendEmail(email: string, token: string): Promise<Response> {
  const loginUrl = `${process.env.VITE_APP_URL}/predict?token=${token}`
  const { error } = await resend.emails.send({
    from: "That's Offside! <noreply@thatsoffside.com",
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
    return Response.json({ error: 'Failed to send email' }, { status: 500 })
  }
  return Response.json({ success: true })
}