<script lang="ts">
  import type { TrainingMode } from './types'

  interface IntroModalProps {
    show: boolean
    onStart: (mode: TrainingMode) => void
  }

  let { show, onStart }: IntroModalProps = $props()
  let selectedMode: TrainingMode = $state('two-card-hint')

  function handleStart() {
    onStart(selectedMode)
  }

  function handleClose() {
    onStart('two-card-hint')
  }
</script>

{#if show}
  <div class="modal-backdrop" role="presentation" onclick={handleClose} onkeydown={(e) => { if (e.key === 'Escape') handleClose() }}>
    <div class="modal show d-block" tabindex="-1" role="dialog" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header justify-content-center">
            <h5 class="modal-title">Training Mode</h5>
          </div>
          <div class="modal-body">
            <div class="d-flex flex-column justify-content-center">
              <p class="my-2">Choose your training mode:</p>

              <div class="my-3">
                <div class="form-check mb-3">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="trainingMode"
                    id="twoCardHint"
                    bind:group={selectedMode}
                    value="two-card-hint"
                  />
                  <label class="form-check-label" for="twoCardHint">
                    <strong>Find One</strong>
                    <br />
                    <small>
                      Find the one card that completes a set with the two highlighted cards.
                    </small>
                  </label>
                </div>

                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="trainingMode"
                    id="oneCardHint"
                    bind:group={selectedMode}
                    value="one-card-hint"
                  />
                  <label class="form-check-label" for="oneCardHint">
                    <strong>Find Two</strong>
                    <br />
                    <small>
                      Find the two cards that complete a set with the one highlighted card.
                    </small>
                  </label>
                </div>
              </div>

              <p class="my-2">Try to keep finding SETs for as long as you can!</p>
            </div>
          </div>
          <div class="modal-footer">
            <div class="d-flex justify-content-center w-100">
              <button class="btn btn-primary" onclick={handleStart}>Let's Go!</button>
            </div>
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
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    border-top: 1px solid #e8eaed;
    padding: 1rem;
  }

  .modal-title {
    margin: 0;
    color: #2c3e50;
  }

  .form-check {
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .form-check-input {
    margin-top: 0.3rem;
  }

  .form-check-label {
    cursor: pointer;
  }
</style>
