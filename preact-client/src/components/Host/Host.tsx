import { useState } from 'preact/hooks'
import { Board } from '@/components/Board'
import { NicknameEntry } from '@/components/NicknameEntry'
import { useHostGame, type HostState } from './useHostGame'
import { createFirebaseTransport } from '@/multiplayer/firebaseTransport'
import { getNickname, getUserId } from '@/auth'

interface HostProps {
  onNavigateHome: () => void
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
  onStart,
  onBack,
}: {
  players: Record<string, any>
  onStart: () => void
  onBack: () => void
}) {
  const entries = Object.entries(players || {})

  return (
    <div class="container bg-light-purple mt-3 mt-md-5 p-4">
      <h3 class="text-center mb-4">Game Lobby</h3>
      <h5 class="text-center mb-3">Players:</h5>
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

export function Host({ onNavigateHome }: HostProps) {
  const transport = createFirebaseTransport()
  const uid = getUserId()

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

  if (!myName) {
    return (
      <NicknameEntry
        onSetName={handlers.handleSetName}
        onBack={onNavigateHome}
        title="Host: Enter Nickname"
      />
    )
  }

  if (gameInProgress && !created) {
    return (
      <GameResumePrompt
        game={gameInProgress}
        onResume={handlers.reloadGame}
        onDelete={handlers.handleRejectResume}
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
        onStart={handlers.startGame}
        onBack={() => {
          handlers.handleRejectResume()
          onNavigateHome()
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
    />
  )
}
