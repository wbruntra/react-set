import React from 'react'
import { Link } from 'react-router-dom'
import { colors } from '../config'
import { countSets } from '../utils/helpers'
import useInterval from '../useInterval' // Not directly used in TopBar, but imported in original

const formatTime = (seconds: number): string => {
  const pad = (ss: number): string => {
    var p = '00'
    var result = (p + ss).slice(-p.length)
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
  players: any // TODO: Define proper type for Players
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
              <div>Sets: {sets}</div>
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
              <div>Total Sets: {sets}</div>
              <div>Remaining: {setsFound ? sets - setsFound.length : sets}</div>
              <div>Time: {elapsedTime !== undefined ? formatTime(elapsedTime) : '0:00'}</div>
            </div>
          </nav>
        </div>
      )
    case 'training':
      return (
        <div className="topbar py-2 bg-dark-orange navbar-fixed">
          <nav>
            <div className="nav-wrapper d-flex justify-content-around">
              <div>Time: {elapsedTime !== undefined ? formatTime(elapsedTime) : '0:00'}</div>
              <div>Score: {players.you.score}</div>
              <div>Remaining: {typeof timeLeft === 'number' && timeLeft > 0 ? timeLeft : 'X'}</div>
            </div>
          </nav>
        </div>
      )
    default:
      return null
  }
}

export default TopBar
