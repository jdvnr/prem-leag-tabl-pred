const TOKEN_KEY = 'predictor_token'
const USER_ID_KEY = 'predictor_user_id'

export function saveSession(token: string, userId: string) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_ID_KEY, userId)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_ID_KEY)
}

export function hasSession(): boolean {
  return !!getToken() && !!getUserId()
}