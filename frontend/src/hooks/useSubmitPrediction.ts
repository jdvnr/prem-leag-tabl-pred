import { useState } from "react";
import { submitMyPrediction } from "../api";
import { getToken } from "../auth";

const SEASON = '2026-27'
export function useSubmitPrediction() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function submit(teams: string[]) {
    const token = getToken()
    if (!token) {
      return
    }
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      await submitMyPrediction(token, SEASON, teams)
      setSaved(true)
    } catch (err) {
      setError('Failed to save prediction')
    } finally {
      setSaving(false)
    }
  }
  return { submit, saving, saved, error }
}