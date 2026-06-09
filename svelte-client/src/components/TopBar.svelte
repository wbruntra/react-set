<script lang="ts">
  import { countSets } from '@react-set/common'

  interface TopBarProps {
    gameMode?: 'training' | 'versus'
    board?: string[]
    declarer?: string | null
    elapsedTime?: number
    score?: number
    timeLeft?: number
  }

  let {
    gameMode = 'training',
    board = [],
    declarer = null,
    elapsedTime = 0,
    score = 0,
    timeLeft = 0,
  }: TopBarProps = $props()

  const setsOnBoard = $derived(countSets(board, { debug: import.meta.env.DEV }))

  function formatTime(seconds: number): string {
    const mm = Math.floor(seconds / 60)
    const ss = seconds % 60
    return `${mm}:${ss.toString().padStart(2, '0')}`
  }
</script>

{#if gameMode === 'versus'}
  <div class="topbar py-2 bg-dark-orange">
    <nav class="text-white">
      <div class="d-flex justify-content-around text-center">
        <div>
          Sets: <span class="mono-font">{setsOnBoard}</span>
        </div>
        <div>
          Time: <span class="mono-font">{formatTime(elapsedTime)}</span>
        </div>
        <div>
          {declarer ? `SET! ${declarer}` : ''}
        </div>
      </div>
    </nav>
  </div>
{:else}
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
          Remaining: <span class="mono-font">{timeLeft > 0 ? timeLeft.toFixed(1) : '0.0'}</span>
        </div>
      </div>
    </nav>
  </div>
{/if}

<style>
  .topbar {
    padding: 0.5rem 0;
  }

  nav {
    color: white;
    padding: 0.5rem 0;
  }

  .mono-font {
    font-family: 'Courier Prime', monospace;
  }

  :global(.bg-dark-orange) {
    background-color: #fb8c00;
  }

  :global(.py-2) {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  :global(.d-flex) {
    display: flex;
  }

  :global(.justify-content-around) {
    justify-content: space-around;
  }

  :global(.text-center) {
    text-align: center;
  }

  :global(.text-white) {
    color: white;
  }
</style>
