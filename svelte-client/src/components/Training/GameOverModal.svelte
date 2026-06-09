<script lang="ts">
  import { push } from 'svelte-spa-router'
  import { getHighScoreKey } from './constants'
  import type { TrainingMode } from './types'

  interface GameOverModalProps {
    show: boolean
    finalScore: number
    mode: TrainingMode
    onRestart: () => void
  }

  let { show, finalScore, mode, onRestart }: GameOverModalProps = $props()

  const highScoreKey = $derived(getHighScoreKey(mode))
  const highScore = $derived(localStorage.getItem(highScoreKey) || '0')
  const modeDisplayName = $derived(mode === 'two-card-hint' ? 'Two Card Hint' : 'One Card Hint')

  function handleMain() {
    onRestart()
    push('/')
  }
</script>

{#if show}
  <div class="modal-backdrop" role="presentation">
    <div class="modal show d-block" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-body">
            <h3 class="text-center mt-3">GAME OVER!</h3>
            <div class="d-flex flex-column justify-content-center">
              <p class="text-center my-1">Mode: {modeDisplayName}</p>
              <p class="text-center my-2">Final Score: {finalScore}</p>
              <p class="text-center my-2">Best Score: {highScore}</p>
            </div>
          </div>
          <div class="modal-footer d-flex justify-content-center">
            <button class="btn btn-primary" onclick={handleMain}>Main Menu</button>
            <button class="btn btn-secondary" onclick={onRestart}>Restart</button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1040;
  }

  .modal {
    z-index: 1050;
  }

  .modal-content {
    background-color: #f7f8fa;
    border: 1px solid #e8eaed;
    border-radius: 8px;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    border-top: 1px solid #e8eaed;
    padding: 1rem;
  }
</style>
