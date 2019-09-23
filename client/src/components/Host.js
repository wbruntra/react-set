import * as React from 'react'
import Board from './Board'
import { makeDeck, cardToggle, reshuffle, removeSelected, isSet } from '../utils/helpers'
import update from 'immutability-helper'
import firebase from 'firebase/app'
import 'firebase/firestore'
import firestore from '../firestore'
import { colors } from '../config'

const config = {
  turnTime: 5000,
  colors,
  playingTo: 6,
}

class Host extends React.Component {

  constructor(props) {
    super(props)
    const initialDeck = makeDeck()
    const initialGameState = {
      ...reshuffle({
        deck: initialDeck.slice(12),
        board: initialDeck.slice(0, 12),
      }),
      selected: [],
    }
    this.nameInputRef = React.createRef()

    this.state = {
      players: {},
      gameTitle: '',
      created: false,
      myName: '',
      inputName: '',
      setFound: false,
      autoplay: false,
      declarer: null,
      gameOver: false,
      ...initialGameState,
    }
  }

  handleHostName = (e) => {
    e.preventDefault()
    const { inputName } = this.state
    this.setState({
      myName: inputName,
      players: {
        [inputName]: {
          score: 0,
          color: config.colors[0],
        },
      },
    })
  }

  handleCreateGame = (e) => {
    e.preventDefault()
    const { myName, board, deck, selected } = this.state
    let gameTitle = this.state.gameTitle
    if (gameTitle === '') {
      gameTitle = `${myName}'s game`
    }
    this.gameRef = firestore.collection('games').doc(gameTitle)
    this.gameRef.set({
      board,
      deck,
      selected,
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
    })
    this.activeGameUpdater = window.setInterval(() => {
      this.gameRef.update({
        lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }, 30000)
    this.actionsRef = this.gameRef.collection('actions')
    this.actionsRef.get().then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data())
      })
    })

    this.actionsRef.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const action = change.doc.data()
          window.created = action.created
          console.log(action)
          this.processAction(action)
          this.actionsRef.doc(change.doc.id).delete()
        }
        if (change.type === 'removed') {
          console.log('Removed action: ', change.doc.data())
        }
      })
    })
    this.setState({
      created: true,
    })
  }

  markPointForDeclarer = (declarer) => {
    if (!declarer) {
      return {}
    }
    const { players } = this.state
    const newScore = players[declarer].score + 1
    const newPlayers = update(players, {
      [declarer]: {
        $merge: {
          score: newScore,
        },
      },
    })
    const gameOver = newScore >= config.playingTo && declarer
    if (gameOver) {
      window.setTimeout(() => {
        this.gameRef.delete()
        clearInterval(this.activeGameUpdater)
      }, 3000)
    }
    return {
      players: newPlayers,
      gameOver,
    }
  }

  processAction = (action) => {
    const { type, payload } = action
    const { players, declarer } = this.state
    switch (type) {
      case 'join':
        if (Object.keys(players).includes(payload.name)) {
          return
        }
        const newPlayers = {
          ...players,
          [payload.name]: {
            score: 0,
            color: config.colors[Object.keys(players).length],
          },
        }
        this.setAndSendState({ players: newPlayers })
        break
      case 'found':
        if (!declarer) {
          this.updateSelected(payload.selected, payload.name)
        }
        break
      default:
        return
    }
  }

  setAndSendState = (update) => {
    this.setState(update)
    this.gameRef.update({
      ...update,
    })
  }

  triggerFoundSequence = (selected, name) => {}

  updateSelected = (newSelected, declarer) => {
    const newState = {
      setFound: isSet(newSelected),
      selected: newSelected,
      declarer,
    }
    if (newState.setFound) {
      setTimeout(() => {
        this.removeSet()
      }, 4000)
    }
    this.setAndSendState(newState)
  }

  handleCardClick = (card) => {
    const { myName } = this.state
    if (!this.state.declarer) {
      const newSelected = cardToggle(card, this.state.selected)
      if (isSet(newSelected)) {
        this.updateSelected(newSelected, myName)
      }
      this.setState({
        selected: newSelected,
      })
    }
  }

  handleRedeal = () => {
    const newState = reshuffle(this.state)
    this.setAndSendState(newState)
  }

  removeSet = () => {
    const { declarer, selected } = this.state
    if (isSet(selected)) {
      const newScores = this.markPointForDeclarer(declarer)
      const newState = {
        setFound: false,
        declarer: null,
        timeDeclared: null,
        ...newScores,
        ...removeSelected(this.state),
      }
      this.setAndSendState(newState)
    }
  }

  render() {
    const {
      board,
      deck,
      selected,
      declarer,
      players,
      gameTitle,
      created,
      myName,
      inputName,
    } = this.state
    if (myName === '') {
      return (
        <div className="container">
          <h4>Enter your name:</h4>
          <form onSubmit={this.handleHostName}>
            <input
              ref={this.nameInputRef}
              autoFocus
              placeholder="hostname"
              value={inputName}
              onChange={e => {
                this.setState({ inputName: e.target.value })
              }}
            />
            <button type="submit" className="btn">
              Send
            </button>
          </form>
        </div>
      )
    }
    if (!created) {
      return (
        <div className="container">
          <h4>Name your game:</h4>
          <form onSubmit={this.handleCreateGame}>
            <input
              placeholder={`${myName}'s game`}
              onChange={e => {
                this.setState({ gameTitle: e.target.value })
              }}
              value={gameTitle}
            />
            <button type="submit" className="btn">
              Create
            </button>
          </form>
        </div>
      )
    }
    return (
      <Board
        board={board}
        deck={deck}
        selected={selected}
        declarer={declarer}
        handleCardClick={this.handleCardClick}
        // handleDeclare={this.handleDeclare}
        handleRedeal={this.handleRedeal}
        players={players}
        setFound={this.state.setFound}
        gameOver={this.state.gameOver}
        myName={this.state.myName}
      />
    )
  }
}

export default Host
