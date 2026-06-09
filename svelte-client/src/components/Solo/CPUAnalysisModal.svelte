<script lang="ts">
  import { push } from 'svelte-spa-router'
  import { GAME_CONFIG, DIFFICULTY_CONFIG, calculateCPUPerformanceTime, calculateDynamicCPUInterval, formatTimeString, CPU_PERFORMANCE_DATA, getCPUPerformanceForSets } from '@react-set/common'

  interface CPUAnalysisModalProps {
    currentDifficulty: number
    isOpen: boolean
    onClose: () => void
  }

  let { currentDifficulty, isOpen, onClose }: CPUAnalysisModalProps = $props()
  // svelte-ignore state_referenced_locally
  let selectedDifficulty = $state(currentDifficulty)
  let selectedSetsOnBoard = $state(3)

  // Update selectedDifficulty when currentDifficulty changes
  $effect(() => {
    selectedDifficulty = currentDifficulty
  })

  const performance = $derived(
    calculateCPUPerformanceTime(selectedDifficulty, selectedSetsOnBoard),
  )

  const dynamicInterval = $derived(
    calculateDynamicCPUInterval(selectedDifficulty, selectedSetsOnBoard),
  )

  const dynamicAverageTimeSeconds = $derived(
    Math.round(
      (performance.performanceData.averageAttempts * dynamicInterval) / 1000,
    ),
  )

  function getDifficultyDescription(avgTime: number) {
    if (avgTime <= 10) return { text: 'Very Fast', color: 'danger' }
    if (avgTime <= 20) return { text: 'Fast', color: 'warning' }
    if (avgTime <= 40) return { text: 'Moderate', color: 'info' }
    if (avgTime <= 60) return { text: 'Slow', color: 'secondary' }
    return { text: 'Very Slow', color: 'dark' }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal-backdrop" role="button" tabindex="0" onclick={onClose} onkeydown={(e) => e.key === 'Escape' && onClose()}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="modal show d-block" role="dialog" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.key === 'Escape' && onClose()}>
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">CPU Performance Analysis</h5>
            <button type="button" class="btn-close" aria-label="Close" onclick={onClose}></button>
          </div>
          <div class="modal-body">
            <div class="row mb-4">
              <div class="col-md-6">
                <label for="difficultyRange" class="form-label fw-bold">Difficulty Level</label>
                <input
                  id="difficultyRange"
                  type="range"
                  min={DIFFICULTY_CONFIG.min}
                  max={DIFFICULTY_CONFIG.max}
                  step={DIFFICULTY_CONFIG.step}
                  bind:value={selectedDifficulty}
                  class="form-range"
                />
                <div class="text-center">
                  <span class="badge bg-primary">{selectedDifficulty}</span>
                </div>
              </div>
              <div class="col-md-6">
                <label for="setsRange" class="form-label fw-bold">Sets on Board</label>
                <input
                  id="setsRange"
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  bind:value={selectedSetsOnBoard}
                  class="form-range"
                />
                <div class="text-center">
                  <span class="badge bg-success">
                    {selectedSetsOnBoard} set{selectedSetsOnBoard !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div class="card mb-4">
              <div class="card-header bg-primary text-white">
                <h6 class="mb-0">
                  Analysis: Difficulty {selectedDifficulty} with {selectedSetsOnBoard} set
                  {selectedSetsOnBoard !== 1 ? 's' : ''} on board
                </h6>
              </div>
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-md-3">
                    <div class="border rounded p-2 mb-2">
                      <div class="fw-bold text-primary fs-5">
                        {(dynamicInterval / 1000).toFixed(1)}s
                      </div>
                      <small class="text-muted">Per Attempt</small>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="border rounded p-2 mb-2">
                      <div class="fw-bold text-info fs-5">
                        {performance.averageAttempts.toFixed(1)}
                      </div>
                      <small class="text-muted">Avg Attempts</small>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="border rounded p-2 mb-2">
                      <div class="fw-bold text-success fs-5">
                        {formatTimeString(dynamicAverageTimeSeconds)}
                      </div>
                      <small class="text-muted">Avg Time</small>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="border rounded p-2 mb-2">
                      <div class="fw-bold text-warning fs-5">
                        {formatTimeString(performance.typicalRangeSeconds.fast)}-
                        {formatTimeString(performance.typicalRangeSeconds.slow)}
                      </div>
                      <small class="text-muted">Typical Range</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <small class="text-muted me-auto">
              Data based on 1000-trial simulations per scenario
            </small>
            <button type="button" class="btn btn-secondary" onclick={onClose}>
              Close
            </button>
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

  .modal-header {
    border-bottom: 1px solid #e8eaed;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    border-top: 1px solid #e8eaed;
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
  }

  .form-range {
    width: 100%;
  }

  .form-label {
    margin-bottom: 0.5rem;
  }

  .card {
    background-color: #f7f8fa;
    border: 1px solid #e8eaed;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .card-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e8eaed;
    border-radius: 8px 8px 0 0;
  }

  .card-body {
    padding: 1rem;
  }

  .bg-primary {
    background-color: #4f46e5 !important;
  }

  .text-white {
    color: white !important;
  }

  .text-primary {
    color: #4f46e5 !important;
  }

  .text-info {
    color: #0891b2 !important;
  }

  .text-success {
    color: #16a34a !important;
  }

  .text-warning {
    color: #d97706 !important;
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

  .border {
    border: 1px solid #dee2e6 !important;
  }

  .rounded {
    border-radius: 0.375rem !important;
  }

  .p-2 {
    padding: 0.5rem !important;
  }

  .mb-2 {
    margin-bottom: 0.5rem !important;
  }

  .mb-4 {
    margin-bottom: 1.5rem !important;
  }

  .me-auto {
    margin-right: auto !important;
  }
</style>
