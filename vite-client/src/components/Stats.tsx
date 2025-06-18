import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { handleGoogleSignIn } from '../utils/helpers'
import axios from 'axios'
import { RootState } from '../store' // Assuming RootState is defined in store.ts

interface StatRow {
  difficulty_level: number
  games_played: number
  games_won: number
}

function Stats() {
  const userReducer = useSelector((state: RootState) => state.user)
  const { user } = userReducer
  const [stats, setStats] = useState<StatRow[] | null>(null)
  const dispatch = useDispatch()

  useEffect(() => {
    const getStats = async () => {
      if (user?.uid) {
        // Ensure user.uid exists before making the API call
        axios.get(`/api/user/stats/${user.uid}`).then((response) => {
          setStats(response.data as StatRow[])
        })
      }
    }

    if (!userReducer.loading && user !== null) {
      getStats()
    }
  }, [userReducer.loading, user]) // Add user to dependency array

  if (userReducer.loading) {
    return 'Loading...'
  }

  if (user === null) {
    return (
      <div className="container mt-4">
        <p>Sign in to view stats</p>
        <p>
          <button onClick={handleGoogleSignIn} className="btn btn-info">
            Sign in
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="container mt-2 mt-md-4">
      <h3>Statistics</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Difficulty</th>
            <th>Games Played</th>
            <th>Winning Percentage</th>
          </tr>
        </thead>

        <tbody>
          {stats &&
            stats.map((row, i) => {
              return (
                <tr key={`stats-${i}`}>
                  <td>{row.difficulty_level}</td>
                  <td>{row.games_played}</td>
                  <td>{Math.round(100 * (row.games_won / row.games_played))}%</td>
                </tr>
              )
            })}
        </tbody>
      </table>
      <p>
        <Link to="/">Main Menu</Link>
      </p>
    </div>
  )
}

export default Stats
