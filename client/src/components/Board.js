import React, { Component, Fragment } from 'react'
import { isEmpty, map, debounce } from 'lodash'
import { countSets, isSet } from '../utils/helpers'
import Card from './Card'
import { Link } from 'react-router-dom'
import GameOver from './GameOver'

class Board extends Component {
  constructor(props) {
    super(props)
    this.state = {
      sets: countSets(props.board, true),
    }
  }

  resize = debounce(() => {
    this.forceUpdate()
  }, 150)

  componentDidMount() {
    window.addEventListener('resize', this.resize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(prevProps.board) !== JSON.stringify(this.props.board)) {
      this.setState({
        sets: countSets(this.props.board, true),
      })
    }
  }

  render() {
    const { board, selected, deck, declarer, players, gameOver, myName, setFound } = this.props
    if (isEmpty(players) || !Object.keys(players).includes(myName)) {
      return null
    }
    const borderColor = declarer ? players[declarer].color : players[myName].color
    const { sets } = this.state
    if (gameOver) {
      return <GameOver gameOver={gameOver} myName={myName} />
    }
    return (
      <Fragment>
        <div className="navbar-fixed">
          <nav>
            <div className="nav-wrapper">
              {declarer ? (
                <a href="#!" className="brand-logo">
                  SET! {declarer}
                </a>
              ) : (
                <a href="#!" className="brand-logo">
                  Sets: {sets}
                </a>
              )}
              <ul className="right hide-on-med-and-down">
                <li>
                  <a href="badges.html">Cards Left: {deck.length}</a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="container" style={{ maxWidth: 0.95 * window.innerHeight }}>
          <div className="row">
            {board.map(card => {
              return (
                <div
                  key={card}
                  className={'col s4' + (selected.includes(card) ? borderColor : '')}
                  onClick={() => {
                    this.props.handleCardClick(card)
                  }}
                >
                  <div
                    className={`card ${
                      setFound && selected.length === 3 && !selected.includes(card) ? 'blurry' : ''
                    }`}
                  >
                    <Card desc={card} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="row">
            {map(players, (info, name) => {
              return (
                <div key={name} className="col s4 m3">
                  <span className={'player-name' + info.color}>
                    {name}: {info.score}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="row">
            {this.props.handleRedeal && (
              <button onClick={this.props.handleRedeal} className="btn">
                Shuffle
              </button>
            )}
          </div>
        </div>
      </Fragment>
    )
  }
}

export default Board
