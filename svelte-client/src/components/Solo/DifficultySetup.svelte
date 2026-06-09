<script lang="ts">
  import { push } from 'svelte-spa-router'
  import { DIFFICULTY_CONFIG, GAME_CONFIG, calculateCPUPerformanceTime, calculateDynamicCPUInterval, formatTimeString, getCPUPerformanceForSets } from '@react-set/common'
  import CPUAnalysisModal from './CPUAnalysisModal.svelte'

  interface DifficultySetupProps {
    difficulty: number
    onDifficultyChange: (difficulty: number) => void
    onStartGame: () => void
  }

  let { difficulty, onDifficultyChange, onStartGame }: DifficultySetupProps = $props()
  let showAnalysisModal = $state(false)

  const scenarios = [
    { sets: 1, label: 'Few' },
    { sets: 3, label: 'Normal' },
    { sets: 6, label: 'Many' },
  ]

  const timings = $derived(
    scenarios.map((scenario) => {
      const dynamicInterval = calculateDynamicCPUInterval(difficulty, scenario.sets)
      const avgAttempts = getCPUPerformanceForSets(scenario.sets).averageAttempts
      const totalTime = Math.round((avgAttempts * dynamicInterval) / 1000)
      return { ...scenario, totalTime }
    }),
  )

  const normalTiming = $derived(timings.find((t) => t.sets === 3)!)

  function getDifficultyDescription(avgTime: number) {
    if (avgTime <= 10) return { text: 'Very Fast', color: 'danger' }
    if (avgTime <= 20) return { text: 'Fast', color: 'warning' }
    if (avgTime <= 40) return { text: 'Moderate', color: 'info' }
    if (avgTime <= 60) return { text: 'Slow', color: 'secondary' }
    return { text: 'Very Slow', color: 'dark' }
  }

  const difficultyDesc = $derived(
    getDifficultyDescription(normalTiming.totalTime),
  )

  function handleDecrease() {
    onDifficultyChange(
      Math.max(DIFFICULTY_CONFIG.min, difficulty - DIFFICULTY_CONFIG.step),
    )
  }

  function handleIncrease() {
    onDifficultyChange(
      Math.min(DIFFICULTY_CONFIG.max, difficulty + DIFFICULTY_CONFIG.step),
    )
  }
</script>

<div class="container main-content">
  <div class="text-center mb-4">
    <h3 class="mb-3">Solo Play vs. Computer</h3>
    <h4 class="mb-4">Choose difficulty level:</h4>
  </div>

  <div class="row justify-content-center">
    <div class="col-12 col-md-8">
      <form
        onsubmit={(e) => {
          e.preventDefault()
          onStartGame()
        }}
        class="mb-4"
      >
        <div class="mb-4">
          <div class="d-flex justify-content-center align-items-center gap-3 mb-3">
            <button
              type="button"
              onclick={handleDecrease}
              disabled={difficulty <= DIFFICULTY_CONFIG.min}
              class="btn btn-outline-secondary"
              aria-label="Decrease difficulty"
            >
              <i class="bi bi-dash-lg"></i>
            </button>

            <div class="text-center">
              <span class="badge bg-primary fs-2 px-4 py-2">{difficulty}</span>
            </div>

            <button
              type="button"
              onclick={handleIncrease}
              disabled={difficulty >= DIFFICULTY_CONFIG.max}
              class="btn btn-outline-secondary"
              aria-label="Increase difficulty"
            >
              <i class="bi bi-plus-lg"></i>
            </button>
          </div>

          <!-- Adaptive CPU Performance Display -->
          <div class="mt-3 p-3 border rounded bg-light">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div class="text-center flex-grow-1">
                <div class="mb-2">
                  <small class="text-muted">Adaptive CPU timing:</small>
                </div>
                <div class="d-flex flex-column flex-md-row justify-content-center align-items-center gap-2 mb-1">
                  <span class="fw-bold text-primary fs-5">
                    {formatTimeString(normalTiming.totalTime)}
                  </span>
                  <span
                    class="badge bg-{difficultyDesc.color} fs-6"
                  >
                    {difficultyDesc.text}
                  </span>
                </div>
                <div class="mt-2">
                  <div class="row text-center">
                    {#each timings as timing}
                      <div class="col-4">
                        <small class="text-muted d-block">{timing.label}</small>
                        <small class="fw-bold">{formatTimeString(timing.totalTime)}</small>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>

              <div class="flex-shrink-0">
                <button
                  type="button"
                  onclick={() => (showAnalysisModal = true)}
                  class="btn btn-outline-info btn-sm"
                >
                  <i class="bi bi-graph-up me-1"></i>
                  <span class="d-none d-sm-inline">Detailed Analysis</span>
                  <span class="d-inline d-sm-none">Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center">
          <button type="submit" class="btn btn-primary btn-lg px-5">
            Start Game
          </button>
          <p class="mt-3 text-muted">
            First to {GAME_CONFIG.playingTo} points is the winner
          </p>
        </div>
      </form>

      <!-- Game Mode Links -->
      <div class="mt-5">
        <h5 class="mb-3 text-center">Other Game Options</h5>
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="d-grid gap-2">
              <button class="btn btn-outline-primary" onclick={() => push('/training')}>
                Training Mode
              </button>
            </div>
          </div>
        </div>
        <hr class="my-4" />
        <div class="text-center">
          <button class="btn btn-outline-secondary" onclick={() => push('/')}>
            &larr; Back to Main Menu
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- CPU Analysis Modal -->
  <CPUAnalysisModal
    currentDifficulty={difficulty}
    isOpen={showAnalysisModal}
    onClose={() => (showAnalysisModal = false)}
  />
</div>

<style>
  .bg-light {
    background-color: #f8f9fa !important;
  }

  .border {
    border: 1px solid #dee2e6 !important;
  }

  .rounded {
    border-radius: 0.375rem !important;
  }

  .text-muted {
    color: #6c757d !important;
  }

  .fw-bold {
    font-weight: 700 !important;
  }

  .fs-5 {
    font-size: 1.25rem !important;
  }

  .fs-6 {
    font-size: 1rem !important;
  }

  .text-primary {
    color: #4f46e5 !important;
  }
</style>
