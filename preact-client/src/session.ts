export interface GameSession {
  gameId: string
  myName: string
  role: 'host' | 'guest'
  savedAt: number
}

const KEY = 'activeGameSession'

export function saveSession(session: Omit<GameSession, 'savedAt'>): void {
  localStorage.setItem(KEY, JSON.stringify({ ...session, savedAt: Date.now() }))
}

export function getSession(): GameSession | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as GameSession
    if (!parsed.gameId || !parsed.myName || !parsed.role) return null
    if (Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) {
      clearSession()
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(KEY)
}
