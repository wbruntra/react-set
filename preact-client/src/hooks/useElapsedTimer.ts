import { useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'

export function useElapsedTimer(gameStarted: boolean, gameOver: boolean) {
  const elapsed = useSignal(0)
  const startTimeRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)

  const active = gameStarted && !gameOver

  useEffect(() => {
    if (active && startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }
    if (!active) {
      startTimeRef.current = null
      elapsed.value = 0
    }
  }, [active])

  useEffect(() => {
    if (!active) return

    timerRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        elapsed.value = Math.floor((Date.now() - startTimeRef.current) / 1000)
      }
    }, 1000)

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [active])

  return elapsed
}
