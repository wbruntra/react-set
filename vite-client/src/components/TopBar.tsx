import React from 'react'
import { Link } from 'react-router-dom'
import { Players } from '../utils/models'
import { colors } from '../config'
import { countSets } from '../utils/helpers'
import useInterval from '../useInterval' // Not directly used in TopBar, but imported in original

const formatTime = (seconds: number): string => {
  const pad = (ss: number): string => {
    const p = '00'
    const result = (p + ss).slice(-p.length)
    return result
  }
  const mm = Math.floor(seconds / 60)
  const ss = seconds - 60 * mm
  return `${mm}:${pad(ss)}`
}

interface TopBarProps {
  gameMode: string
  deck: string[]
  board: string[]
  declarer: string | null
  setsFound?: any[] // Assuming this is an array of sets found in puzzle mode
  players: Players
  elapsedTime?: number
  timeLeft?: number | string
}

function TopBar({
  gameMode,
  deck,
  board,
  declarer,
  setsFound,
  players,
  elapsedTime,
  timeLeft,
}: TopBarProps) {
  const sets = countSets(board)

  switch (gameMode) {
    case 'shared-device':
      return null
    case 'versus':
      return (
        <div className={`topbar py-2 bg-${declarer ? 'light' : 'dark'}-orange`}>
          <nav className="text-white">
            <div className="d-flex justify-content-around text-center">
              <div>
                Sets: <span className="mono-font">{sets}</span>
              </div>
              <div>
                Time:{' '}
                <span className="mono-font">
                  {elapsedTime !== undefined ? formatTime(elapsedTime) : '0:00'}
                </span>
              </div>
              <div>{declarer && <>SET! {declarer}</>}</div>
            </div>
          </nav>
        </div>
      )
    case 'puzzle':
      return (
        <div className="navbar-fixed">
          <nav>
            <div
              className="nav-wrapper"
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <div>
                Total Sets: <span className="mono-font">{sets}</span>
              </div>
              <div>
                Remaining:{' '}
                <span className="mono-font">{setsFound ? sets - setsFound.length : sets}</span>
              </div>
              <div>
                Time:{' '}
                <span className="mono-font">
                  {elapsedTime !== undefined ? formatTime(elapsedTime) : '0:00'}
                </span>
              </div>
            </div>
          </nav>
        </div>
      )
    case 'training':
      return (
        <div className="topbar py-2 bg-dark-orange navbar-fixed">
          <nav>
            <div className="nav-wrapper d-flex justify-content-around">
              <div>
                Time:{' '}
                <span className="mono-font">
                  {elapsedTime !== undefined ? formatTime(elapsedTime) : '0:00'}
                </span>
              </div>
              <div>
                Score: <span className="mono-font">{players.you.score}</span>
              </div>
              <div>
                Remaining:{' '}
                <span className="mono-font">
                  {typeof timeLeft === 'number' && timeLeft > 0 ? timeLeft.toFixed(1) : '0.0'}
                </span>
              </div>
            </div>
          </nav>
        </div>
      )
    default:
      return null
  }
}

export default TopBar
