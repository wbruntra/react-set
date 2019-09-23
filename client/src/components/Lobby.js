import React, { Component, Fragment } from 'react'
import firestore from '../firestore'
import { Link } from 'react-router-dom'

const styles = {}

class Lobby extends Component {
  constructor(props) {
    super(props)
    const games = []

    this.state = {
      name: '',
      newGame: 'baz',
      init: false,
      games,
    }
  }

  componentDidMount() {
    this.gamesRef = firestore.collection('games')

    this.unsubscribe = this.gamesRef.onSnapshot(snapshot => {
      const newGames = []
      snapshot.forEach(doc => {
        newGames.push({
          name: doc.id,
          ...doc.data(),
        })
      })
      this.setState({
        init: true,
        games: newGames,
      })
    })
  }

  componentWillUnmount = () => {
    this.unsubscribe()
  }

  addGame = e => {
    e.preventDefault()
    const { newGame } = this.state
    this.gamesRef.doc(newGame).set({
      host: 'bill',
    })
  }

  render() {
    const { games, init } = this.state
    if (!init) {
      return null
    }
    const activeGames = games.filter(g => {
      const { lastUpdate } = g
      if (!lastUpdate) {
        return false
      }
      const updated = lastUpdate.toMillis()
      const now = new Date().getTime()
      const age = Math.round((now - updated) / 1000)
      return age < 40
    })
    return (
      <div className="container" style={{ height: '100vh' }}>
        {activeGames.length === 0 ? (
          <Fragment>
            <div className="row">
              <div className="col s8 offset-s2 m6 offset-m3">
                <div className="card-panel teal" style={{ marginTop: window.innerHeight * 0.2 }}>
                  <span className="white-text">There are currently no active games.</span>
                </div>
                <Link to="/">Back</Link>
              </div>
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <h4 className="center-align">Available games</h4>
            <div className="row center-align">
              {activeGames.map((game, i) => {
                return (
                  <div className="col s6 m4" key={game.name}>
                    <Link to={`/guest/${game.name}`}>
                      <div className="card-panel">{game.name}</div>
                    </Link>
                  </div>
                )
              })}
            </div>
          </Fragment>
        )}
      </div>
    )
  }
}

export default Lobby
