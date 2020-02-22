import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { countSets } from '../utils/helpers'
import { colors } from '../config'

const formatTime = (seconds) => {
  const pad = (ss) => {
    var p = '00'
    var result = (p + ss).slice(-p.length)
    return result
  }
  const mm = Math.floor(seconds / 60)
  const ss = seconds - 60 * mm
  return `${mm}:${pad(ss)}`
}

function TopBar({ gameMode, deck, board, declarer, setsFound, startTime, elapsedTime }) {
  const sets = countSets(board)
  switch (gameMode) {
    case 'shared-device':
      return null
    case 'versus':
      return (
        <div className={`topbar py-2 bg-${declarer ? 'light' : 'dark'}-orange`}>
          <nav className="container text-white">
            <div className="row justify-content-between text-center">
              <div className="col">Sets: {sets}</div>
              <div className="col">{declarer && <>SET! {declarer}</>}</div>
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
              <div>Remaining: {sets - setsFound.length}</div>
              <div>Time: {formatTime(elapsedTime)}</div>
            </div>
          </nav>
        </div>
      )
    default:
      return null
  }
}

export default TopBar
