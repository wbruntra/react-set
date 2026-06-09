interface FlashOverlayProps {
  showSuccessFlash: boolean
  showErrorFlash: boolean
}

export function FlashOverlay({ showSuccessFlash, showErrorFlash }: FlashOverlayProps) {
  return (
    <>
      {showSuccessFlash && <div class="flash-overlay success-flash" />}
      {showErrorFlash && <div class="flash-overlay error-flash" />}
    </>
  )
}
