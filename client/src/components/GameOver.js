import React from 'react'
import { Link } from 'react-router-dom'
import sadTrombone from '../assets/sad_trombone.mp3'
import applause from '../assets/applause.mp3'

function GameOver(props) {
  const { gameOver, myName } = props
  const finalSound = () => {
    const soundEffect = gameOver === myName ? applause : sadTrombone
    return <audio src={soundEffect} autoPlay />
  }

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
            <Link to="/" style={{ marginRight: 0 }}>
              Main Menu
            </Link>
          </div>
        </div>
      </div>
      {props.solo && (
        <div className="row">
          <button className="btn" onClick={props.resetGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  )  
}

export default GameOver
