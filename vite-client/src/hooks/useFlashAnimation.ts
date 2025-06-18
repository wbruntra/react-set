import { useState } from 'react'

export interface FlashAnimationHook {
  showCpuFlash: boolean
  showUserFlash: boolean
  showSuccessFlash: boolean
  showErrorFlash: boolean
  triggerCpuFlash: () => void
  triggerUserFlash: () => void
  triggerSuccessFlash: () => void
  triggerErrorFlash: () => void
}

/**
 * Custom hook for managing flash animations across different game modes
 */
export const useFlashAnimation = (): FlashAnimationHook => {
  const [showCpuFlash, setShowCpuFlash] = useState(false)
  const [showUserFlash, setShowUserFlash] = useState(false)
  const [showSuccessFlash, setShowSuccessFlash] = useState(false)
  const [showErrorFlash, setShowErrorFlash] = useState(false)

  const triggerCpuFlash = () => {
    setShowCpuFlash(true)
    setTimeout(() => setShowCpuFlash(false), 800)
  }

  const triggerUserFlash = () => {
    setShowUserFlash(true)
    setTimeout(() => setShowUserFlash(false), 800)
  }

  const triggerSuccessFlash = () => {
    setShowSuccessFlash(true)
    setTimeout(() => setShowSuccessFlash(false), 500) // Brief flash for 500ms
  }

  const triggerErrorFlash = () => {
    setShowErrorFlash(true)
    setTimeout(() => setShowErrorFlash(false), 800)
  }

  return {
    showCpuFlash,
    showUserFlash,
    showSuccessFlash,
    showErrorFlash,
    triggerCpuFlash,
    triggerUserFlash,
    triggerSuccessFlash,
    triggerErrorFlash,
  }
}
