import { supabase } from "./supabaseClient";

// ---- Types ---- //
export type UpsertUserResponse = {
  user_id: string,
  token: string,
  is_new: boolean
}

export type Team = {
  name: string,
  short_name: string,
  badge_url: string
}

export type Prediction = {
  id: string
  usr_id: string
  season: string
  prediction: string[]
  is_locked: boolean
  submitted_at: string
  updated_at: string
}

export type PublicPrediction = {
  prediction_id: string
  first_name: string
  last_name: string
  prediction: string[]
  is_locked: boolean
  submitted_at: string
}

export type LoginResponse = {
  found: false
} | {
  found: true
  user_id: string
  token: string
}

// ---- User Tables ---- // 
export async function upsertUser(
  firstName: string,
  lastName: string,
  email: string
): Promise<UpsertUserResponse> {
  const { data, error } = await supabase.rpc('upsert_user', {
    'p_first_name': firstName,
    'p_last_name': lastName,
    'p_email': email,
  })
  if (error) throw error
  return data as UpsertUserResponse
}

export async function login_attempt(email: string): Promise<LoginResponse> {
  const { data, error } = await supabase.rpc('login', {
    p_email: email
  })
  if (error) throw error
  return data as LoginResponse
}

// ---- Teams ---- //
export async function getTeams(season: string): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select(
      'name, short_name, badge_url'
    )
    .eq('season', season)
    .order('name')
  if (error) throw error
  return data as Team[]
}

// ---- Predictions ---- //
export async function getMyPrediction(
  userId: string,
  season: string,
): Promise<Prediction | null> {
  const { data, error } = await supabase.from('predictions')
    .select('*')
    .eq('usr_id', userId)
    .eq('season', season)
    .single()
  if (error && error.code !== 'PGSRT116') throw error
  return data as Prediction | null
}

export async function submitMyPrediction(
  token: string,
  season: string,
  prediction: string[]
): Promise<void> {
  const { error } = await supabase.rpc('submit_prediction', {
    p_token: token,
    p_season: season,
    p_prediction: prediction,
  })
  if (error) throw error
}

export async function getAllPredictions(
  season: string,
): Promise<PublicPrediction[]> {
  const { data, error } = await supabase.rpc('get_all_predictions', {
    p_season: season,
  })
  if (error) throw error
  return data as PublicPrediction[]
}

// ---- Login / Signup ---- //
// export async function sendLoginEmail(email: string, token: string): Promise<void> {
//   const res = await fetch('/api/send-login-email', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, token })
//   })
//   if (!res.ok) throw new Error('Failed to send login email')
// }

// export async function sendSignUpEmail(email: string, firstName: string, lastName: string, token: string): Promise<void> {
//   const res = await fetch('/api/send-signup-email', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, firstName, lastName, token })
//   })
//   if (!res.ok) throw new Error('Failed to send signup email')
// }