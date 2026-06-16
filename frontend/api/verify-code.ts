import { verifyCode } from "./_verification";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, code } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  if (!email || !code) return res.status(400).json({ error: 'Missing email or code' })

  const token = await verifyCode(email, code)

  if (!token) return res.status(401).json({ error: 'Invalid or expired code' })

  return res.status(200).json({ token })
}