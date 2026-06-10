import { useMemo, useState, useEffect } from 'preact/hooks'
import { useLocation } from 'wouter-preact'
import { Board } from '@/components/Board'
import { GameOverMulti } from '@/components/GameOverMulti'
import { NicknameEntry } from '@/components/NicknameEntry'
import { useHostGame } from './useHostGame'
import { useElapsedTimer } from '@/hooks/useElapsedTimer'
import { createTransport } from '@/multiplayer/transportFactory'
import { getNickname, getUserId } from '@/auth'
import { saveSession, getSession, clearSession } from '@/session'

interface HostProps {
  gameId?: string
}

function GameCreation({
  myName,
  onCreate,
}: {
  myName: string
  onCreate: (title: string) => void
}) {
  const [title, setTitle] = useState(`${myName}'s game`)

  function handleSubmit(e: Event) {
    e.preventDefault()
    onCreate(title)
  }

  return (
    <div class="container bg-light-purple mt-3 mt-md-5 p-4">
      <h3 class="text-center mb-4">Create Your Game</h3>
      <form onSubmit={handleSubmit}>
        <div class="row justify-content-center">
          <div class="col-md-6">
            <input
              autoFocus
              class="form-control form-control-lg text-center mb-3"
              placeholder={`${myName}'s game`}
              value={title}
              onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
            />
            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary btn-lg">
                Create Game
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function Lobby({
  players,
  gameId,
  onStart,
  onBack,
}: {
  players: Record<string, any>
  gameId?: string
  onStart: () => void
  onBack: () => void
}) {
  const entries = Object.entries(players || {})

  function copyJoinUrl() {
    const url = `${window.location.origin}${window.location.pathname}#/join/${encodeURIComponent(gameId || '')}`
    navigator.clipboard.writeText(url).catch(() => {})
  }

  return (
    <div class="container bg-light-purple mt-3 mt-md-5 p-4">
      <h3 class="text-center mb-4">Game Lobby</h3>
      <h5 class="text-center mb-3">Players ({entries.length}):</h5>
      <ul class="list-unstyled">
        {entries.map(([name, info]) => (
          <li key={name} class="card mb-2 p-2 text-center">
            <span style="font-weight: 600">{name}</span>
            {info.host && <span class="badge bg-purple ms-2">Host</span>}
          </li>
        ))}
      </ul>
      <div class="d-grid gap-2 col-md-6 mx-auto mt-4">
        <button class="btn btn-primary btn-lg" onClick={onStart}>
          Start Game
        </button>
        {gameId && (
          <button class="btn btn-outline-primary" onClick={copyJoinUrl}>
            Copy Join Link
          </button>
        )}
        <button class="btn btn-outline-secondary" onClick={onBack}>
          Back
        </button>
      </div>
      {entries.length < 2 && (
        <p class="text-center text-muted mt-3">Waiting for players to join...</p>
      )}
    </div>
  )
}

function GameResumePrompt({
  game,
  onResume,
  onDelete,
}: {
  game: any
  onResume: (gameId: string) => void
  onDelete: () => void
}) {
  return (
    <div class="container bg-light-purple mt-3 mt-md-5 p-4 text-center">
      <h3 class="mb-4">Resume Game?</h3>
      <p class="mb-3">
        You have a game in progress: <strong>{game.gameTitle || game.id}</strong>
      </p>
      <div class="d-flex justify-content-center gap-3">
        <button class="btn btn-primary" onClick={() => onResume(game.gameTitle || game.id)}>
          Resume
        </button>
        <button class="btn btn-outline-danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  )
}

export function Host({ gameId }: HostProps) {
  const [, navigate] = useLocation()
  const transport = useMemo(() => createTransport(), [])
  const uid = getUserId()

  const persisted = getSession()

  const { state, gameInProgress, handlers } = useHostGame({ transport, uid })
  const {
    board,
    deck,
    selected,
    declarer,
    players,
    setFound,
    gameOver,
    myName,
    created,
    gameStarted,
    gameTitle,
  } = state

  function clearAndLeave() {
    clearSession()
    navigate('/')
  }

  // Persist session + update URL when game is created
  useEffect(() => {
    if (created && gameTitle && myName) {
      saveSession({ gameId: gameTitle, myName, role: 'host' })
      navigate('/host/' + encodeURIComponent(gameTitle))
    }
  }, [created, gameTitle, myName])

  // Rejoin by URL code on mount
  useEffect(() => {
    if (gameId) {
      const hostName = persisted?.myName || getNickname()
      if (hostName) {
        handlers.rejoinGame(gameId, hostName)
      }
    }
  }, [gameId])

  const elapsed = useElapsedTimer(gameStarted, !!gameOver)

  if (!myName) {
    return (
      <NicknameEntry
        onSetName={handlers.handleSetName}
        onBack={clearAndLeave}
        title="Host: Enter Nickname"
      />
    )
  }

  // Show resume prompt for findResumable matches (firebase compat)
  if (gameInProgress && !created && !gameId) {
    return (
      <GameResumePrompt
        game={gameInProgress}
        onResume={handlers.reloadGame}
        onDelete={() => {
          handlers.handleRejectResume()
          clearSession()
        }}
      />
    )
  }

  if (!created) {
    return <GameCreation myName={myName} onCreate={handlers.handleCreateGame} />
  }

  if (!gameStarted) {
    return (
      <Lobby
        players={players}
        gameId={gameTitle}
        onStart={handlers.startGame}
        onBack={() => {
          handlers.handleRejectResume()
          clearAndLeave()
        }}
      />
    )
  }

  if (gameOver) {
    return (
      <GameOverMulti
        winner={gameOver}
        players={players as any}
        isHost={true}
        onPlayAgain={() => {
          handlers.startNewGame()
          if (gameTitle) {
            saveSession({ gameId: gameTitle, myName, role: 'host' })
          }
        }}
        onMainMenu={() => {
          transport.deleteGame(gameTitle)
          clearAndLeave()
        }}
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
      onCardClick={handlers.handleCardClick}
      elapsedTime={elapsed}
    />
  )
}
