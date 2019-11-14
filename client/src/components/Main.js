import React from 'react'
import { Link } from 'react-router-dom'
import Card from './Card'

function Main() {
  return (
    <div className="container">
      <div className="row">
        <h2 className="center-align">Main Menu</h2>
      </div>
      <div className="row">
        <div className="col s8 offset-s2 m3 offset-m1">
          <Link to="/solo">
            <div className="card">
              <Card desc="0012" />
            </div>
          </Link>
          <p className="center-align">Solo/Local</p>
        </div>
        <div className="col s8 offset-s2 m3">
          <Link to="/lobby">
            <div className="card">
              <Card desc="1121" />
            </div>
          </Link>
          <p className="center-align">Join Game</p>
        </div>
        <div className="col s8 offset-s2 m3">
          <Link to="/host">
            <div className="card">
              <Card desc="2200" />
            </div>
          </Link>
          <p className="center-align">Host Game</p>
        </div>
      </div>
      {/* <ul className="collection">
        <li className="collection-item">
          <Link to="/rules">Rules</Link>
        </li>
      </ul> */}
    </div>
  )
}

export default Main
