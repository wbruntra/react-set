import { useMemo } from 'preact/hooks'
import { countSets, GAME_CONFIG } from '@react-set/common'
import { Board } from '@/components/Board'
import { useSharedDevice } from './useSharedDevice'

interface SharedDeviceProps {
  onNavigateHome: () => void
}

interface PlayerRowProps {
  players: Array<{ name: string; color: string; score: number }>
  declarer: string | null
  onDeclare: (name: string) => void
  position: 'top' | 'bottom'
}

function PlayerRow({ players, declarer, onDeclare, position }: PlayerRowProps) {
  const isTop = position === 'top'
  return (
    <div
      class={`player-row ${isTop ? 'player-row--top' : 'player-row--bottom'}`}
      style={`padding: ${isTop ? '8px 8px 4px' : '4px 8px 8px'}`}
    >
      <div class="d-flex justify-content-center gap-3 flex-wrap">
        {players.map((p) => {
          const isActive = declarer === p.name
          return (
            <button
              key={p.name}
              class={`player-chip ${isActive ? 'player-chip--active' : ''}`}
              style={`background-color: ${p.color}; color: white`}
              onClick={() => onDeclare(p.name)}
              disabled={declarer !== null && !isActive}
            >
              <span class="player-chip__name">{p.name}</span>
              <span class="player-chip__score">{p.score}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function SharedDevice({ onNavigateHome }: SharedDeviceProps) {
  const { state, actions } = useSharedDevice()
  const { board, selected, declarer, players, numPlayers, setFound, gameOver, gameStarted } = state

  const playersArray = Object.entries(players).map(([key, info]) => ({
    ...info,
  }))
  const topBoxes = Math.ceil(playersArray.length / 2)
  const topPlayers = playersArray.slice(0, topBoxes)
  const bottomPlayers = playersArray.slice(topBoxes)

  if (!numPlayers || !gameStarted) {
    return (
      <div class="container bg-light-purple mt-3 mt-md-5 p-4">
        <h3 class="text-center mb-3">Local Multiplayer</h3>
        <p class="text-muted text-center mb-4">Choose the number of players sharing this device</p>

        <div class="row justify-content-center mb-4">
          <div class="col-md-8">
            <h5 class="text-center mb-3">Number of Players:</h5>
            <div class="d-flex justify-content-center gap-3 flex-wrap">
              {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  class="btn btn-outline-primary btn-lg"
                  style="width: 64px; height: 64px; font-size: 1.5rem"
                  onClick={() => actions.startGame(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div class="text-center mt-4">
          <p class="text-muted small">
            Players take turns declaring "SET!" by tapping their coloured chip, then selecting
            cards.
          </p>
          <p class="text-muted small">First to {GAME_CONFIG.playingTo} points wins!</p>
          <button class="btn btn-outline-secondary btn-sm mt-3" onClick={onNavigateHome}>
            Main Menu
          </button>
        </div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div class="container bg-light-purple mt-3 mt-md-5 p-4 text-center">
        <h2 class="mb-4">{gameOver} Wins!</h2>

        <div class="row justify-content-center mb-4">
          <div class="col-md-6">
            {playersArray
              .sort((a, b) => b.score - a.score)
              .map((p) => (
                <div key={p.name} class="card mb-2" style="padding: 12px 20px">
                  <div class="d-flex justify-content-between align-items-center">
                    <span style={`color: ${p.color}; font-weight: 600`}>{p.name}</span>
                    <span class="mono-font" style="font-size: 1.2rem">
                      {p.score}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div class="d-flex justify-content-center gap-3">
          <button class="btn btn-primary" onClick={actions.resetGame}>
            Play Again
          </button>
          <button class="btn btn-secondary" onClick={onNavigateHome}>
            Main Menu
          </button>
        </div>
      </div>
    )
  }

  const setsOnBoard = useMemo(
    () => countSets(board, { debug: import.meta.env.DEV } as any),
    [board],
  )

  return (
    <>
      <PlayerRow
        players={topPlayers}
        declarer={declarer}
        onDeclare={actions.declare}
        position="top"
      />

      <div style="text-align: center; padding: 4px 0; background: #fb8c00; color: white">
        <span class="mono-font">
          Sets: {setsOnBoard}
          {declarer ? ` — ${declarer}'s turn` : ''}
        </span>
      </div>

      <Board
        board={board}
        selected={selected}
        setFound={setFound}
        gameOver={false}
        score={0}
        declarer={declarer}
        gameMode="versus"
        players={players as any}
        onCardClick={actions.handleCardClick}
      />

      <PlayerRow
        players={bottomPlayers}
        declarer={declarer}
        onDeclare={actions.declare}
        position="bottom"
      />
    </>
  )
}
