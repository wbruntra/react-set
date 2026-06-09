<script lang="ts">
  interface FlashOverlayProps {
    showSuccessFlash: boolean
    showErrorFlash: boolean
  }

  let { showSuccessFlash, showErrorFlash }: FlashOverlayProps = $props()
</script>

{#if showSuccessFlash}
  <div class="success-flash"></div>
{/if}

{#if showErrorFlash}
  <div class="error-flash"></div>
{/if}

<style>
  .success-flash {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    pointer-events: none;
    animation: successFlash 0.5s ease-out;
  }

  .error-flash {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    pointer-events: none;
    animation: errorFlash 0.8s ease-out;
  }

  @keyframes successFlash {
    0% {
      opacity: 0;
      background-color: rgba(100, 255, 100, 0);
    }
    30% {
      opacity: 1;
      background-color: rgba(100, 255, 100, 0.5);
    }
    100% {
      opacity: 0;
      background-color: rgba(100, 255, 100, 0);
    }
  }

  @keyframes errorFlash {
    0% {
      opacity: 0;
      background-color: rgba(255, 100, 100, 0);
    }
    20% {
      opacity: 1;
      background-color: rgba(255, 100, 100, 0.5);
    }
    80% {
      opacity: 1;
      background-color: rgba(255, 100, 100, 0.3);
    }
    100% {
      opacity: 0;
      background-color: rgba(255, 100, 100, 0);
    }
  }
</style>
