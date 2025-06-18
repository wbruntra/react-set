import React from 'react'
import styles from './FlashOverlay.module.scss'

interface FlashOverlayProps {
  showCpuFlash?: boolean
  showUserFlash?: boolean
  showSuccessFlash?: boolean
  showErrorFlash?: boolean
}

const FlashOverlay: React.FC<FlashOverlayProps> = ({
  showCpuFlash = false,
  showUserFlash = false,
  showSuccessFlash = false,
  showErrorFlash = false,
}) => {
  return (
    <>
      {/* CPU Flash Animation Overlay */}
      {showCpuFlash && <div className={styles.cpuFlash} />}

      {/* User Success Flash Animation Overlay */}
      {showUserFlash && <div className={styles.userFlash} />}

      {/* Success Flash Animation Overlay (for Training mode) */}
      {showSuccessFlash && <div className={styles.successFlash} />}

      {/* Error Flash Animation Overlay (for Training mode) */}
      {showErrorFlash && <div className={styles.errorFlash} />}
    </>
  )
}

export default FlashOverlay
