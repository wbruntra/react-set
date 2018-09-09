import React, { Component } from 'react';
import Board from './Board';
// import { concat } from 'lodash';
import {
  makeDeck,
  cardToggle,
  reshuffle,
  removeSelected,
  isSet
} from '../utils/helpers';
import socket from '../socket';

const config = {
  turnTime: 10000
};

const sendUpdate = (socket, payload) => {
  socket.emit('host', {
    type: 'update',
    payload: {
      ...payload
    }
  });
};

class Host extends Component {
  constructor(props) {
    super(props);
    const initialDeck = makeDeck();
    const initialGameState = {
      ...reshuffle({
        deck: initialDeck.slice(12),
        board: initialDeck.slice(0, 12)
      }),
      selected: []
    };
    const players = {
      host: 0
    };

    this.state = {
      players,
      setFound: false,
      autoplay: false,
      declarer: null,
      timeDeclared: null,
      gameOver: false,
      ...initialGameState
    };
  }

  markPointForDeclarer = () => {
    const { declarer, players } = this.state;
    const newScore = players[declarer] + 1;
    const newPlayers = {
      ...players,
      [declarer]: players[declarer] + 1
    };
    this.setAndSendState({
      players: newPlayers,
      gameOver: newScore >= 6
    });
  };

  componentDidMount() {
    socket.on('host', action => {
      const timeNow = new Date().getTime();
      switch (action.type) {
        case 'join':
          const newPlayers = {
            ...this.state.players,
            [action.payload.name]: 0
          };
          this.setState({
            players: newPlayers
          });
          sendUpdate(socket, {
            players: newPlayers,
            board: this.state.board,
            deck: this.state.deck,
            selected: this.state.selected
          });
          break;
        case 'select':
          if (
            action.payload.name === this.state.declarer &&
            timeNow - this.state.timeDeclared < config.turnTime
          ) {
            this.updateSelected(action.payload.selected);
          } else {
            console.log('Selection invalid');
          }
          break;
        case 'declare':
          console.log('SET!', action.payload);
          this.performDeclare(action.payload.name);
          break;
        default:
          return;
      }
    });
  }

  performDeclare = declarer => {
    const timeNow = new Date().getTime();
    const update = {
      declarer,
      timeDeclared: timeNow
    };
    if (!this.state.declarer) {
      this.setAndSendState(update);
      this.undeclareID = setTimeout(() => {
        const nextUpdate = {
          declarer: null,
          timeDeclare: null,
          selected: []
        };
        this.setAndSendState(nextUpdate);
      }, config.turnTime);
    }
  };

  setAndSendState = update => {
    this.setState(update);
    sendUpdate(socket, update);
  };

  updateSelected = newSelected => {
    if (isSet(newSelected)) {
      this.markPointForDeclarer();
      this.setAndSendState({ setFound: true });
      setTimeout(() => {
        clearTimeout(this.undeclareID);
        this.removeSet();
      }, 2000);
    }
    this.setAndSendState({ selected: newSelected });
  };

  handleCardClick = card => {
    const { declarer } = this.state;
    if (declarer && declarer === 'host') {
      const newSelected = cardToggle(card, this.state.selected);
      this.updateSelected(newSelected);
    } else {
      console.log('Click! Not active player');
      this.handleDeclare();
    }
  };

  handleDeclare = () => {
    console.log('SET declared!');
    this.performDeclare('host');
  };

  handleRedeal = () => {
    const newState = reshuffle(this.state);
    this.setAndSendState(newState);
  };

  removeSet = () => {
    if (isSet(this.state.selected)) {
      console.log('Set found, removing');
      const newState = {
        setFound: false,
        declarer: null,
        timeDeclared: null,
        ...removeSelected(this.state)
      };
      this.setAndSendState(newState);
    }
  };

  render() {
    const { board, deck, selected, declarer, players } = this.state;
    return (
      <div>
        <Board
          board={board}
          deck={deck}
          selected={selected}
          declarer={declarer}
          handleCardClick={this.handleCardClick}
          handleDeclare={this.handleDeclare}
          handleRedeal={this.handleRedeal}
          players={players}
          setFound={this.state.setFound}
          gameOver={this.state.gameOver}
        />
      </div>
    );
  }
}

export default Host;
