import React from 'react'
import styles from './SharedDevice.module.scss'

interface SetCounterProps {
  setCount: number | null
}

function SetCounter({ setCount }: SetCounterProps) {
  return (
    <div className={styles['set-counter']}>
      <div className={styles['set-counter__content']}>
        <div className={styles['set-counter__main']}>
          <div className={styles['set-counter__number']}>{setCount !== null ? setCount : '?'}</div>
          <div className={styles['set-counter__label']}>SET{setCount !== 1 ? 'S' : ''}</div>
        </div>
      </div>
    </div>
  )
}

export default SetCounter
