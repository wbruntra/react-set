import { useState, useEffect, useMemo } from 'preact/hooks'
import { Board } from '@/components/Board'
import { GameOverMulti } from '@/components/GameOverMulti'
import { NicknameEntry } from '@/components/NicknameEntry'
import { useGuestGame } from './useGuestGame'
import { createFirebaseTransport } from '@/multiplayer/firebaseTransport'
import { getNickname } from '@/auth'
import type { GameSummary } from '@/multiplayer/transport'

interface GuestProps {
  onNavigateHome: () => void
  initialGameId?: string
}

function JoinGame({ onJoin, onBack }: { onJoin: (gameId: string) => void; onBack: () => void }) {
  const [games, setGames] = useState<GameSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [showNameInput, setShowNameInput] = useState(false)
  const [gameId, setGameId] = useState('')

  useEffect(() => {
    const t = createFirebaseTransport()
    t.listJoinableGames().then((list) => {
      setGames(list)
      setLoading(false)
    })
  }, [])

  function handleSubmit(e: Event) {
    e.preventDefault()
    const trimmed = gameId.trim()
    if (!trimmed) return
    onJoin(trimmed)
  }

  return (
    <div class="container bg-light-purple mt-3 mt-md-5 p-4">
      <h3 class="text-center mb-4">Join a Game</h3>

      {loading ? (
        <p class="text-center text-muted">Loading games...</p>
      ) : games.length > 0 ? (
        <div class="mb-4">
          <h5 class="text-center mb-3">Available Games</h5>
          {games.map((g) => (
            <div key={g.id} class="card mb-2 p-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{g.id}</strong>
                  <div class="text-muted small">
                    {Object.keys(g.players || {}).length} player(s):{' '}
                    {Object.values(g.players || {})
                      .map((p: any) => p.name)
                      .join(', ')}
                  </div>
                </div>
                <button class="btn btn-primary btn-sm" onClick={() => onJoin(g.id)}>
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p class="text-center text-muted mb-4">No open games right now.</p>
      )}

      {!showNameInput ? (
        <div class="text-center">
          <button class="btn btn-outline-secondary btn-sm" onClick={() => setShowNameInput(true)}>
            Join by name instead
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <hr />
          <div class="row justify-content-center">
            <div class="col-md-6">
              <input
                autoFocus
                class="form-control text-center mb-2"
                placeholder="Enter game name"
                value={gameId}
                onInput={(e) => setGameId((e.target as HTMLInputElement).value)}
              />
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-outline-primary btn-sm">
                  Join by name
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div class="text-center mt-4">
        <button class="btn btn-outline-secondary btn-sm" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  )
}

function WaitingForStart({ onBack }: { onBack: () => void }) {
  return (
    <div class="container bg-light-purple mt-3 mt-md-5 p-4 text-center">
      <h3 class="mb-4">Joined!</h3>
      <p class="text-muted">Waiting for the host to start the game...</p>
      <div class="mt-4">
        <span class="badge bg-purple px-3 py-2" style="font-size: 1rem">
          Waiting...
        </span>
      </div>
      <div class="mt-4">
        <button class="btn btn-outline-secondary btn-sm" onClick={onBack}>
          Leave
        </button>
      </div>
    </div>
  )
}

export function Guest({ onNavigateHome, initialGameId }: GuestProps) {
  const [gameId, setGameId] = useState<string | null>(initialGameId || null)
  const [myName, setMyName] = useState(() => getNickname())
  const [showNickname, setShowNickname] = useState(!getNickname())

  const transport = useMemo(() => createFirebaseTransport(), [])

  const { state, handleCardClick } = useGuestGame({
    transport,
    gameId: gameId || '',
    myName,
  })
  const { board, selected, declarer, players, setFound, gameOver, gameStarted } = state

  if (!gameId) {
    return <JoinGame onJoin={(id) => setGameId(id)} onBack={onNavigateHome} />
  }

  if (showNickname || !myName) {
    return (
      <NicknameEntry
        onSetName={(name) => {
          setMyName(name)
          setShowNickname(false)
        }}
        onBack={onNavigateHome}
        title="Enter Nickname"
      />
    )
  }

  if (!gameStarted) {
    return <WaitingForStart onBack={onNavigateHome} />
  }

  if (gameOver) {
    return (
      <GameOverMulti
        winner={gameOver}
        players={players as any}
        isHost={false}
        onMainMenu={onNavigateHome}
      />
    )
  }

  return (
    <Board
      board={board}
      selected={selected}
      setFound={setFound}
      gameOver={!!gameOver}
      score={players[myName]?.score ?? 0}
      declarer={declarer}
      gameMode="versus"
      players={players as any}
      onCardClick={handleCardClick}
    />
  )
}
