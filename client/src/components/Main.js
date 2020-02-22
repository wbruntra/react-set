import React from 'react'
import { Link } from 'react-router-dom'
import Card from './Card'

function Main() {
  return (
    <div className="container mt-md-5">
      <h1 className="text-center mb-3 mb-md-5">Main Menu</h1>
      <div className="row justify-content-center">
        <div className="col-9 col-md-4">
          <Link to="/solo">
            <div className="card shadow mb-3 mb-md-4">
              <Card desc="0012" />
            </div>
          </Link>
          <p className="text-center">Solo/Local</p>
        </div>
        <div className="col-9 col-md-4">
          <Link to="/lobby">
            <div className="card shadow mb-3 mb-md-4">
              <Card desc="1121" />
            </div>
          </Link>
          <p className="text-center">Join Game</p>
        </div>
        <div className="col-9 col-md-4">
          <Link to="/host">
            <div className="card shadow mb-3 mb-md-4">
              <Card desc="2200" />
            </div>
          </Link>
          <p className="text-center">Host Game</p>
        </div>
      </div>
      {/* <div>
        <hr />
          <p>
          <Link to="/rules">Rules</Link>

          </p>
          <p>
          <Link to="/stats">Statistics</Link>

          </p>

      </div> */}
    </div>
  )
}

export default Main
