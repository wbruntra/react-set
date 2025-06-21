import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store' // Assuming RootState is defined in store.ts

interface GameOverProps {
  gameOver: string | boolean | null // Can be winnerName (string), boolean (from Training), or null
  myName: string
  solo: boolean
  finalScore?: number // Optional for solo mode
  reset?: () => void // Optional for solo mode
}

function GameOver(props: GameOverProps) {
  const { gameOver: winnerName, myName, solo, finalScore, reset } = props
  const userReducer = useSelector((state: RootState) => state.user)
  const { user } = userReducer

  return (
    <div className="game-over container mt-5">
      <div className="row justify-content-center bg-light-purple">
        <div className="col col-md-6">
          <div className="card shadow p-3 m-2">
            <h3 className="text-center mt-3">GAME OVER!</h3>
            {!isNaN(finalScore as number) ? ( // Cast to number for isNaN
              <div className="d-flex flex-column justify-content-center">
                <p className="text-center my-2">Final Score: {finalScore} </p>
                <div className="d-flex flex-row justify-content-center">
                  <button className="btn btn-primary my-2" onClick={() => reset && reset()}>
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-center mb-4">Winner: {winnerName} </p>
            )}
            <div className="row justify-content-center">
              <div className="col-4">
                <p className="text-center">
                  <Link to="/">Main</Link>
                </p>
              </div>
              {solo && user && user.uid && (
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
