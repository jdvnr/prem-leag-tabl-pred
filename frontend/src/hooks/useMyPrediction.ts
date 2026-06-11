import { useEffect, useState } from "react";
import { getToken } from "../auth";
import { getMyPrediction } from "../api";

const SEASON = '2026-27'

type State = {
  loading: boolean
  prediction: string[] | null
  isLocked: boolean
  error: string | null
}

export function useMyPrediction() {
  const [state, setState] = useState<State>({
    loading: true,
    prediction: null,
    isLocked: false,
    error: null,
  })
  useEffect(() => {
    async function fetch() {
      const token = getToken()
      if (!token) {
        setState(s => ({ ...s, loading: false, error: 'No session found' }))
      }
      try {
        const result = await getMyPrediction(token as string, SEASON)

        if (!result) {
          setState({
            loading: false,
            prediction: null,
            isLocked: false,
            error: null
          })
        } else {
          setState({
            loading: false,
            prediction: result.prediction as string[],
            isLocked: result.is_locked as boolean,
            error: null
          })
        }
      } catch (err) {
        setState(s => ({ ...s, loading: false, error: 'Failed to load prediction' }))
      }
    }
    fetch()
  }, [])
  return state
}