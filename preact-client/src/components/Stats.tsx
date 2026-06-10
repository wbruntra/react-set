import { useState, useEffect } from 'preact/hooks'
import { getUserId, currentUser, handleGoogleSignIn, handleSignOut } from '../auth'

interface StatRow {
  difficulty_level: number
  games_played: number
  games_won: number
}

interface StatsProps {
  onNavigateHome: () => void
}

export function Stats({ onNavigateHome }: StatsProps) {
  const [stats, setStats] = useState<StatRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const user = currentUser.value
  const uid = user ? user.uid : getUserId()
  const isAnonymous = user ? user.isAnonymous : true

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/user/stats/${uid}`)
        if (!response.ok) {
          throw new Error('Failed to fetch statistics')
        }
        const data = await response.json()
        setStats(data as StatRow[])
        setError(null)
      } catch (err) {
        console.error('Error fetching statistics:', err)
        setError('Could not load statistics. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [uid])

  const onGoogleSignIn = async () => {
    try {
      await handleGoogleSignIn()
    } catch (err) {
      console.error('Google Sign-in failed:', err)
    }
  }

  const onSignOut = async () => {
    try {
      await handleSignOut()
    } catch (err) {
      console.error('Sign-out failed:', err)
    }
  }

  const hasStats = stats && stats.length > 0

  return (
    <div class="container bg-light-purple mt-3 mt-md-5 p-4">
      <h3 class="mb-4 text-center">Your Statistics</h3>

      {/* Profile/Auth Section */}
      <div class="row justify-content-center mb-4">
        <div class="col-12 col-md-10 col-lg-8">
          <div
            class="card p-3 d-flex flex-row align-items-center justify-content-between"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div class="d-flex align-items-center gap-3">
              {user && user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  class="rounded-circle"
                  style={{ width: '48px', height: '48px', border: '2px solid #a855f7' }}
                />
              ) : (
                <div
                  class="rounded-circle bg-dark d-flex align-items-center justify-content-center"
                  style={{
                    width: '48px',
                    height: '48px',
                    border: '2px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <span class="text-white fw-bold">{isAnonymous ? '👤' : 'G'}</span>
                </div>
              )}
              <div class="text-start">
                <div class="fw-bold text-white">
                  {!isAnonymous
                    ? user?.displayName
                    : localStorage.getItem('nickname') || 'Guest Player'}
                </div>
                <div class="small text-muted">
                  {!isAnonymous ? user?.email : 'Anonymous Account'}
                </div>
              </div>
            </div>

            <div>
              {isAnonymous ? (
                <button class="btn btn-info btn-sm" onClick={onGoogleSignIn}>
                  Sign in with Google
                </button>
              ) : (
                <button class="btn btn-outline-danger btn-sm" onClick={onSignOut}>
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div class="p-5 text-center">
          <div class="text-white mb-2 fs-5">Loading statistics...</div>
        </div>
      ) : error ? (
        <div class="p-4 text-center">
          <h4 class="text-danger mb-3">Error</h4>
          <p class="text-muted">{error}</p>
        </div>
      ) : !hasStats ? (
        <div class="mb-4 text-center">
          <p class="text-muted">
            No games played yet on this account. Play a Solo game against the CPU to start tracking
            your stats!
          </p>
          <a href="#/solo" class="btn btn-primary mt-3">
            Play Solo Mode
          </a>
        </div>
      ) : (
        <div class="row justify-content-center mb-4">
          <div class="col-12 col-md-10 col-lg-8">
            <div class="card p-3 mb-4">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Difficulty</th>
                    <th>Games Played</th>
                    <th>Winning Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((row, i) => {
                    const winPct =
                      row.games_played > 0
                        ? Math.round(100 * (row.games_won / row.games_played))
                        : 0
                    return (
                      <tr key={`stats-${i}`}>
                        <td>Level {row.difficulty_level}</td>
                        <td>{row.games_played}</td>
                        <td class="fw-bold text-success">{winPct}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div class="d-flex justify-content-center gap-3 mt-3">
        <button class="btn btn-outline-secondary" onClick={onNavigateHome}>
          Main Menu
        </button>
      </div>
    </div>
  )
}
