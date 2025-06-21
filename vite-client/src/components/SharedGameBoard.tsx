import React, { useEffect, useState } from 'react'
import Card from './Card'
import { countSets } from '../utils/helpers'
import styles from './SharedDevice.module.scss'

interface SharedGameBoardProps {
  board: string[]
  selected: string[]
  setFound: boolean
  handleCardClick: (card: string) => void
  borderColor: string
}

function SharedGameBoard({
  board,
  selected,
  setFound,
  handleCardClick,
  borderColor,
}: SharedGameBoardProps) {
  return (
    <div className={styles['shared-game-board']}>
      <div className={styles['shared-game-board__container']}>
        {board.map((card, index) => {
          const isSelected = selected.includes(card)
          const cardHolderStyle = isSelected
            ? {
                backgroundColor: borderColor,
                border: `3px solid ${borderColor}`,
                boxShadow: `0 0 20px ${borderColor}66`,
              }
            : {}
          return (
            <div
              key={`${card}-${index}`}
              className={styles['shared-game-board__card-wrapper']}
              onClick={() => handleCardClick(card)}
            >
              <div className={styles['shared-game-board__card-holder']} style={cardHolderStyle}>
                <div
                  className={`${styles['shared-game-board__card']} ${
                    setFound && selected.length === 3 && !selected.includes(card)
                      ? styles['shared-game-board__card--blurred']
                      : ''
                  }`}
                >
                  <Card desc={card} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SharedGameBoard
