import React from 'react'
import styles from './SharedDevice.module.scss'

interface PlayerInfo {
  name: string
  color: string
  score: number
  host?: boolean
}

interface SharedPlayerFrameProps {
  players: PlayerInfo[]
  declarer: string | null
  handlePlayerClick: (playerName: string) => void
  position: 'top' | 'bottom'
}

function SharedPlayerFrame({
  players,
  declarer,
  handlePlayerClick,
  position,
}: SharedPlayerFrameProps) {
  if (players.length === 0) return null

  console.log(players)

  return (
    <div
      className={`${styles['shared-player-frame']} ${styles[`shared-player-frame--${position}`]}`}
    >
      <div className={styles['shared-player-frame__container']}>
        {players.map((info) => {
          const isActive = info.name === declarer
          const displayName = `Player ${parseInt(info.name) + 1}` // Convert ID back to display name
          return (
            <button
              key={info.name}
              className={`${styles['shared-player-button']} ${styles[`shared-player-button--${info.color}`]} ${
                isActive ? styles['shared-player-button--active'] : ''
              }`}
              onClick={() => {
                console.log(`Player clicked: ${info.name}, declarer: ${declarer}`) // Debug log
                handlePlayerClick(info.name)
              }}
              disabled={isActive}
            >
              <div className={styles['shared-player-button__content']}>
                <div
                  className={styles['shared-player-button__name']}
                  style={{ color: isActive ? 'inherit' : info.color }} // Use player color when not active
                >
                  {isActive ? 'SET!' : displayName}
                </div>
                <div className={styles['shared-player-button__score']}>
                  {isActive ? 'Select cards!' : info.score}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SharedPlayerFrame
