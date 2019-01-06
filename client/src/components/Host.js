import React, { Component } from 'react';
import Board from './Board';
// import { concat } from 'lodash';
import { makeDeck, cardToggle, reshuffle, removeSelected, isSet } from '../utils/helpers';

import firestore from '../firestore';

const config = {
  turnTime: 5000,
};

class Host extends Component {
  constructor(props) {
    super(props);
    const initialDeck = makeDeck();
    const initialGameState = {
      ...reshuffle({
        deck: initialDeck.slice(12),
        board: initialDeck.slice(0, 12),
      }),
      selected: [],
    };
    const players = {
      host: 0,
    };

    this.state = {
      players,
      setFound: false,
      autoplay: false,
      declarer: null,
      timeDeclared: null,
      gameOver: false,
      ...initialGameState,
    };
  }

  markPointForDeclarer = () => {
    const { declarer, players } = this.state;
    const newScore = players[declarer] + 1;
    const newPlayers = {
      ...players,
      [declarer]: players[declarer] + 1,
    };
    return {
      players: newPlayers,
      gameOver: newScore >= 6,
    };
  };

  processAction = action => {
    const timeNow = new Date().getTime();
    const { type, payload } = action;
    const { players, declarer, timeDeclared, selected } = this.state;
    switch (type) {
      case 'join':
        if (Object.keys(players).includes(payload.name)) {
          return;
        }
        const newPlayers = {
          ...players,
          [payload.name]: 0,
        };
        this.setAndSendState({ players: newPlayers });
        break;
      case 'declare':
        this.performDeclare(payload.name, payload.selected);
        break;
      case 'select':
        if (payload.name === declarer && timeNow - timeDeclared < config.turnTime) {
          this.updateSelected(payload.selected);
        } else {
          console.log('Selection invalid');
        }
        break;
      default:
        return;
    }
  };

  componentDidMount() {
    const { board, deck } = this.state;
    this.gameRef = firestore.collection('games').doc('foo');
    this.gameRef.set({
      board,
      deck,
    });
    this.actionsRef = this.gameRef.collection('actions');
    this.actionsRef.get().then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
      });
    });

    this.actionsRef.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const action = change.doc.data();
          window.created = action.created;
          console.log(action);
          this.processAction(action);
          this.actionsRef.doc(change.doc.id).delete();
        }
        if (change.type === 'removed') {
          console.log('Removed action: ', change.doc.data());
        }
      });
    });
  }

  performDeclare = (declarer, selected) => {
    const timeNow = new Date().getTime();
    const update = {
      declarer,
      selected,
      timeDeclared: timeNow,
    };
    if (!this.state.declarer) {
      this.setAndSendState(update);
      this.undeclareID = setTimeout(() => {
        const nextUpdate = {
          declarer: null,
          timeDeclared: null,
          selected: [],
        };
        this.setAndSendState(nextUpdate);
      }, config.turnTime);
    }
  };

  setAndSendState = update => {
    this.setState(update);
    this.gameRef.update({
      ...update,
    });
  };

  updateSelected = newSelected => {
    const newState = {
      setFound: isSet(newSelected),
      selected: newSelected,
    };
    if (newState.setFound) {
      clearTimeout(this.undeclareID);
      setTimeout(() => {
        this.removeSet();
      }, 2000);
    }
    this.setAndSendState(newState);
  };

  handleCardClick = card => {
    console.log(card, 'clicked');
    const { declarer } = this.state;
    if (declarer && declarer === 'host') {
      const newSelected = cardToggle(card, this.state.selected);
      this.updateSelected(newSelected);
    } else {
      console.log('Click! Not active player');
      this.handleDeclare(card);
    }
  };

  handleDeclare = card => {
    console.log('SET declared!');
    this.performDeclare('host', card);
  };

  handleRedeal = () => {
    const newState = reshuffle(this.state);
    this.setAndSendState(newState);
  };

  removeSet = () => {
    if (isSet(this.state.selected)) {
      console.log('Set found, removing');
      const newScores = this.markPointForDeclarer();
      const newState = {
        setFound: false,
        declarer: null,
        timeDeclared: null,
        ...newScores,
        ...removeSelected(this.state),
      };
      this.setAndSendState(newState);
    }
  };

  render() {
    const { board, deck, selected, declarer, players } = this.state;
    return (
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
    );
  }
}

export default Host;
