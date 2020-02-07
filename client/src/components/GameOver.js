import React from 'react'
import { Link } from 'react-router-dom'
import sadTrombone from '../assets/sad_trombone.mp3'
import applause from '../assets/applause.mp3'
import { useSelector, useDispatch } from 'react-redux'

function GameOver(props) {
  const { gameOver, myName, solo } = props
  const finalSound = () => {
    const soundEffect = gameOver === myName ? applause : sadTrombone
    return <audio src={soundEffect} autoPlay />
  }
  const userReducer = useSelector((state) => state.user)
  const { user } = userReducer

  return (
    <div className="deep-purple lighten-2" style={{ height: '100vh' }}>
      {finalSound()}
      <div className="row center-align">
        <div
          className="card col s8 offset-s2 m6 offset-m3"
          style={{ marginTop: window.innerHeight * 0.2 }}
        >
          <div className="card-content">
            <span className="card-title">GAME OVER!</span>
            <p>Winner: {gameOver} </p>
          </div>
          <div className="card-action">
            <p>
              <Link to="/" style={{ marginRight: '48px' }}>
                Main Menu
              </Link>
              {solo && user !== null && (
                <span className="right-align">
                  <Link to="/stats">View Stats</Link>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
      {/* {solo && (
        <div className="row">
          <button className="btn" onClick={props.resetGame}>
            Play Again
          </button>
        </div>
      )} */}
    </div>
  )
}

export default GameOver
