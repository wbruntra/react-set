import { countSets } from '@/utils/helpers'
import { Card } from './Card'

interface PlayerInfo {
  name: string
  score: number
  color: string
}

interface BoardProps {
  board: string[]
  selected: string[]
  setFound: boolean
  gameOver: boolean
  score: number
  elapsedTime?: number
  timeLeft?: number
  declarer?: string | null
  gameMode?: 'training' | 'versus'
  players?: Record<string, PlayerInfo>
  onCardClick: (card: string) => void
}

export function Board({
  board,
  selected,
  setFound,
  gameOver,
  score,
  elapsedTime = 0,
  timeLeft = 0,
  declarer = null,
  gameMode = 'training',
  players = {},
  onCardClick,
}: BoardProps) {
  const setsOnBoard = countSets(board, {
    debug: import.meta.env.DEV,
  } as any)

  function formatTime(seconds: number): string {
    const mm = Math.floor(seconds / 60)
    const ss = seconds % 60
    return `${mm}:${String(ss).padStart(2, '0')}`
  }

  const borderColor = '#4fc3f7'

  function isSelected(card: string): boolean {
    return selected.includes(card)
  }

  function shouldBlur(card: string): boolean {
    return setFound && selected.length === 3 && !selected.includes(card)
  }

  return (
    <>
      {gameMode === 'versus' ? (
        <div class="topbar py-2 bg-dark-orange">
          <nav class="text-white">
            <div class="d-flex justify-content-around text-center">
              <div>
                Sets: <span class="mono-font">{setsOnBoard}</span>
              </div>
              <div>
                Time: <span class="mono-font">{formatTime(elapsedTime)}</span>
              </div>
              <div>{declarer ? `SET! ${declarer}` : ''}</div>
            </div>
          </nav>
        </div>
      ) : (
        <div class="topbar py-2 bg-dark-orange">
          <nav>
            <div class="nav-wrapper d-flex justify-content-around">
              <div>
                Time: <span class="mono-font">{formatTime(elapsedTime)}</span>
              </div>
              <div>
                Score: <span class="mono-font">{score}</span>
              </div>
              <div>
                Remaining:{' '}
                <span class="mono-font">{timeLeft > 0 ? timeLeft.toFixed(1) : '0.0'}</span>
              </div>
            </div>
          </nav>
        </div>
      )}

      <div class="container bg-light-purple">
        <div class="board d-flex flex-column align-items-center">
          <div class="board-main-container">
            {board.map((card) => (
              <div
                key={card}
                class="card-wrapper"
                role="button"
                tabindex={0}
                onClick={() => onCardClick(card)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onCardClick(card)
                }}
              >
                <div
                  class="card-holder"
                  style={isSelected(card) ? `background-color: ${borderColor}` : ''}
                >
                  <div class={`card ${shouldBlur(card) ? 'blurry' : ''}`}>
                    <Card desc={card} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {gameMode === 'versus' && Object.keys(players).length > 0 && (
            <div class="row my-1 text-center fixed-bottom">
              {Object.entries(players).map(([name, info]) => (
                <div key={name} class="col s4 m3">
                  <span
                    class="player-name"
                    style={`background-color: ${info.color}; color: white; border-radius: 4px;`}
                  >
                    {name}: {info.score}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
