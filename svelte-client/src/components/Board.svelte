<script lang="ts">
  import Card from './Card.svelte'
  import TopBar from './TopBar.svelte'

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

  let { board, selected, setFound, gameOver, score, elapsedTime, timeLeft, declarer = null, gameMode = 'training', players = {}, onCardClick }: BoardProps =
    $props()

  const borderColor = '#4fc3f7'

  function isSelected(card: string): boolean {
    return selected.includes(card)
  }

  function shouldBlur(card: string): boolean {
    return setFound && selected.length === 3 && !selected.includes(card)
  }
</script>

<TopBar {gameMode} {board} {declarer} {elapsedTime} {score} {timeLeft} />

<div class="container bg-light-purple">
  <div class="board d-flex flex-column align-items-center">
    <div class="board-main-container">
      {#each board as card, index (card + '-' + index)}
        <div class="card-wrapper" role="button" tabindex="0" onclick={() => onCardClick(card)} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCardClick(card) }}>
          <div
            class="card-holder"
            style={isSelected(card) ? `background-color: ${borderColor}` : ''}
          >
            <div class="card {shouldBlur(card) ? 'blurry' : ''}">
              <Card desc={card} />
            </div>
          </div>
        </div>
      {/each}
    </div>

    {#if gameMode === 'versus' && Object.keys(players).length > 0}
      <div class="row my-1 text-center fixed-bottom">
        {#each Object.entries(players) as [name, info]}
          <div class="col s4 m3">
            <span
              class="player-name"
              style="background-color: {info.color}; color: white; border-radius: 4px;"
            >
              {name}: {info.score}
            </span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .board {
    margin-top: 60px;
  }

  .board-main-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-row-gap: 75px;
    column-gap: 0px;
    margin-bottom: 20px;
  }

  .card-holder {
    margin: 1px;
    padding: 3px;
    border-radius: 3px;
  }

  .card-wrapper {
    cursor: pointer;
  }

  .player-name {
    padding: 3px 8px;
  }

  .fixed-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 8px 0;
    background-color: #e4deff;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }

  .blurry {
    filter: grayscale(0.9) blur(7px);
  }

  @media screen and (min-width: 560px) {
    .board {
      margin-top: 20px;
    }

    .card-holder {
      margin: 4px;
      padding: 4px;
      border-radius: 4px;
    }

    .board-main-container {
      grid-template-columns: repeat(3, 1fr);
      row-gap: 20px;
      column-gap: 20px;
    }
  }

  @media screen and (max-width: 560px) {
    :global(html),
    :global(#app),
    .container {
      background-color: #f7f8fa;
    }

    .card-wrapper {
      transform: rotate(90deg) scale(1.15);
    }
  }
</style>
