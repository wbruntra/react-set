import type { TrainingMode } from './types'

interface IntroModalProps {
  show: boolean
  onStart: (mode: TrainingMode) => void
}

export function IntroModal({ show, onStart }: IntroModalProps) {
  if (!show) return null

  return (
    <div class="modal d-block" tabindex={-1} role="dialog" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Training Mode</h5>
          </div>
          <div class="modal-body">
            <p class="mb-3">Practice finding SETs with hints! Choose your difficulty:</p>
            <div class="d-grid gap-3">
              <button class="btn btn-primary btn-lg" onClick={() => onStart('two-card-hint')}>
                Find One
              </button>
              <p class="text-muted small mb-2">
                Two cards are shown — find the one card that completes the SET.
              </p>
              <button class="btn btn-info btn-lg" onClick={() => onStart('one-card-hint')}>
                Find Two
              </button>
              <p class="text-muted small">
                One card is shown — find the two remaining cards from 6 options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
