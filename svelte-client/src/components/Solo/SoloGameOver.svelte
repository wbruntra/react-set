<script lang="ts">
  import { push } from 'svelte-spa-router'
  import type { Players } from './gameState'

  interface SoloGameOverProps {
    winner: string
    players: Players
    onReset: () => void
  }

  let { winner, players, onReset }: SoloGameOverProps = $props()

  const playerScore = $derived(players.you?.score || 0)
  const cpuScore = $derived(players.cpu?.score || 0)
</script>

<div class="game-over container mt-5">
  <div class="row justify-content-center bg-light-purple">
    <div class="col col-md-6">
      <div class="card shadow p-3 m-2">
        <h3 class="text-center mb-3">GAME OVER!</h3>

        <p class="text-center mb-4">
          Winner: <strong>{winner}</strong>
        </p>

        <div class="d-flex flex-column justify-content-center">
          <p class="text-center my-2">You: {playerScore}</p>
          <p class="text-center my-2">CPU: {cpuScore}</p>
        </div>

        <div class="d-flex justify-content-center gap-3 mb-3">
          <button class="btn btn-outline-secondary" onclick={() => push('/')}>
            Main Menu
          </button>
          <button class="btn btn-primary" onclick={onReset}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .game-over {
    margin-top: 3rem;
  }

  .card {
    background-color: #f7f8fa;
    border: 1px solid #e8eaed;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .text-center {
    text-align: center;
  }

  .mb-3 {
    margin-bottom: 1rem;
  }

  .mb-4 {
    margin-bottom: 1.5rem;
  }

  .my-2 {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .p-3 {
    padding: 1rem;
  }

  .m-2 {
    margin: 0.5rem;
  }

  .d-flex {
    display: flex;
  }

  .justify-content-center {
    justify-content: center;
  }

  .gap-3 {
    gap: 1rem;
  }

  .bg-light-purple {
    background-color: #e4deff;
  }

  h3 {
    color: #2c3e50;
  }

  p {
    color: #2c3e50;
  }
</style>
