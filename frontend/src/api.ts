import { supabase } from "./supabaseClient"

// ---- Types ---- //

export type Team = {
  name: string,
  short_name: string,
  badge_url: string
}

export type Prediction = {
  found: boolean
  prediction?: string[]
  is_locked?: boolean
}

export type PublicPrediction = {
  prediction_id: string
  first_name: string
  last_name: string
  prediction: string[]
  is_locked: boolean
  submitted_at: string
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
  token: string,
  season: string,
): Promise<Prediction | null> {
  const { data, error } = await supabase.rpc('get_my_prediction', {
    p_token: token,
    p_season: season
  })
  if (error) throw error
  if (!data.found) return null
  return data as Prediction
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