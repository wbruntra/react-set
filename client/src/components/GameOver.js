import React from 'react'
import { Link } from 'react-router-dom'
import sadTrombone from '../assets/sad_trombone.mp3'
import applause from '../assets/applause.mp3'
import { useSelector, useDispatch } from 'react-redux'

function GameOver(props) {
  const { gameOver: winnerName, myName, solo } = props
  const finalSound = () => {
    const soundEffect = winnerName === myName ? applause : sadTrombone
    return <audio src={soundEffect} autoPlay />
  }
  const userReducer = useSelector((state) => state.user)
  const { user } = userReducer

  return (
    <div className="game-over container mt-5">
      {finalSound()}
      <div className="row justify-content-center">
        <div className="col col-md-6">
          <div className="card shadow">
            <h3 className="text-center mt-3">GAME OVER!</h3>
            <p className="text-center mb-4">Winner: {winnerName} </p>
            <div className="row justify-content-center">
              <div className="col-4">
                <p className="text-center">
                  <Link to="/">Main</Link>
                </p>
              </div>
              {solo && user !== null && (
                <div className="col-4">
                  <p className="text-center">
                    <Link to="/stats">Stats</Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameOver
