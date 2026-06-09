import { useSignal, useComputed, useSignalEffect } from '@preact/signals'
import { countSets, isSet, calculateDynamicCPUInterval, GAME_CONFIG } from '@/utils/helpers'
import { Board } from '@/components/Board'
import { DifficultySetup } from './DifficultySetup'
import { SoloGameOver } from './SoloGameOver'
import {
  createInitialState,
  createGameState,
  handleCardClick,
  handleStartGame,
  handleDifficultyChange,
  resetGame,
  processFoundSet,
  handleCpuFoundSet,
  handleCpuAnimationStep,
  handleDeclarationExpired,
  findCpuSet,
  type GameState,
} from './gameState'

interface SoloProps {
  onNavigateHome: () => void
}

// --- Signals demo ---
// This is the same Solo game as before, rewritten with @preact/signals instead
// of useState + useRef. The whole component holds ZERO refs.
//
// Why the refs are gone: a signal is a stable box whose `.value` is always
// current. A setInterval/setTimeout callback can read `game.value` and get
// fresh state every tick — no stale closure, so no `gameStateRef` needed.
//
// Why the dependency arrays are gone: `useSignalEffect` auto-tracks the signals
// it reads *synchronously*. We read narrow `useComputed` guard signals at the
// top of each effect, so the timer restarts on exactly the same triggers the
// old dependency arrays expressed — but we never hand-maintain a dep list.
// (Reads inside the async timer body are NOT tracked, which is exactly what we
// want: the body sees fresh state without re-subscribing the effect.)
export function Solo({ onNavigateHome }: SoloProps) {
  const game = useSignal<GameState>(createInitialState())
  const showCpuFlash = useSignal(false)
  const showUserFlash = useSignal(false)
  const roundStartTime = useSignal<number | null>(null)

  function triggerCpuFlash() {
    showCpuFlash.value = true
    setTimeout(() => (showCpuFlash.value = false), 800)
  }

  function triggerUserFlash() {
    showUserFlash.value = true
    setTimeout(() => (showUserFlash.value = false), 800)
  }

  // Event handlers read game.value directly — no ref, always the latest state.
  function onCardClick(card: string) {
    const next = handleCardClick(game.value, card)
    if (next.setFound && next.declarer === next.myName) {
      triggerUserFlash()
    }
    game.value = next
  }

  function onResetGame() {
    game.value = resetGame(game.value)
    roundStartTime.value = null
  }

  function onStartGame() {
    game.value = { ...handleStartGame(game.value), ...createGameState() }
    roundStartTime.value = Date.now()
  }

  function onDifficultyChange(newDifficulty: number) {
    game.value = handleDifficultyChange(game.value, newDifficulty)
  }

  // Elapsed time ticker — active while a game is in progress.
  const elapsedActive = useComputed(() => game.value.gameStarted && !game.value.gameOver)
  useSignalEffect(() => {
    if (!elapsedActive.value) return
    const timer = window.setInterval(() => {
      const g = game.value
      game.value = {
        ...g,
        elapsedSeconds: Math.floor((Date.now() - g.startTime.getTime()) / 1000),
      }
    }, 1000)
    return () => clearInterval(timer)
  })

  // CPU turn timer — restart when the CPU becomes free to move, or when the
  // board/difficulty change (those feed the interval length). The key string
  // collapses all of that into a single value that only changes on real
  // triggers, replacing the old [gameStarted, gameOver, declarer, setFound,
  // board, difficulty] dependency array.
  const cpuTurnKey = useComputed(() => {
    const g = game.value
    const active = g.gameStarted && !g.gameOver && !g.declarer && !g.setFound
    return active ? `${g.difficulty}:${g.board.join(',')}` : null
  })
  useSignalEffect(() => {
    if (cpuTurnKey.value === null) return
    const g0 = game.peek() // peek(): read without subscribing — we only track the key
    const interval = calculateDynamicCPUInterval(g0.difficulty, countSets(g0.board))
    const timer = window.setInterval(() => {
      const g = game.value
      if (g.declarer || g.gameOver || g.setFound) return
      const found = findCpuSet(g.board)
      if (found) {
        triggerCpuFlash()
        game.value = handleCpuFoundSet(g, ...found)
      }
    }, interval)
    return () => clearInterval(timer)
  })

  // CPU animation — reveal the CPU's queued cards one at a time.
  const cpuAnimating = useComputed(
    () => game.value.declarer === 'cpu' && game.value.cpuFound.length > 0,
  )
  useSignalEffect(() => {
    if (!cpuAnimating.value) return
    const timer = window.setInterval(() => {
      game.value = handleCpuAnimationStep(game.value)
    }, GAME_CONFIG.cpuDelay)
    return () => clearInterval(timer)
  })

  // Set-found resolution — once a valid set is locked in, clear it after a beat.
  const setFoundReady = useComputed(() => {
    const g = game.value
    return g.setFound && g.selected.length === 3 && isSet(g.selected)
  })
  useSignalEffect(() => {
    if (!setFoundReady.value) return
    const timer = window.setTimeout(() => {
      const g = game.value
      game.value = processFoundSet(g, g.selected, g.declarer!, roundStartTime.value)
      roundStartTime.value = Date.now()
    }, GAME_CONFIG.setDisplayTime)
    return () => clearTimeout(timer)
  })

  // Declaration expiry — a declarer who doesn't complete a set gets penalized.
  // Keyed on timeDeclared so each fresh declaration restarts the countdown.
  const declarationDeadline = useComputed(() => {
    const g = game.value
    return g.declarer && g.timeDeclared && !g.setFound ? g.timeDeclared : null
  })
  useSignalEffect(() => {
    if (declarationDeadline.value === null) return
    const timer = window.setTimeout(() => {
      game.value = handleDeclarationExpired(game.value)
    }, GAME_CONFIG.turnTime)
    return () => clearTimeout(timer)
  })

  // Stamp the first round's start time once the game begins.
  useSignalEffect(() => {
    if (game.value.gameStarted && roundStartTime.value === null) {
      roundStartTime.value = Date.now()
    }
  })

  const g = game.value

  if (!g.gameStarted) {
    return (
      <DifficultySetup
        difficulty={g.difficulty}
        onDifficultyChange={onDifficultyChange}
        onStartGame={onStartGame}
        onNavigateHome={onNavigateHome}
      />
    )
  }

  if (g.gameOver) {
    return (
      <SoloGameOver
        winner={g.gameOver}
        players={g.players}
        onReset={onResetGame}
        onMainMenu={onNavigateHome}
      />
    )
  }

  return (
    <>
      <Board
        board={g.board}
        selected={g.selected}
        declarer={g.declarer}
        gameMode="versus"
        onCardClick={onCardClick}
        setFound={g.setFound}
        gameOver={!!g.gameOver}
        score={g.players.you.score}
        elapsedTime={g.elapsedSeconds}
        players={g.players as any}
      />

      {showCpuFlash.value && <div class="flash-overlay cpu-flash" />}
      {showUserFlash.value && <div class="flash-overlay user-flash" />}
    </>
  )
}
