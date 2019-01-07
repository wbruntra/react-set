import React, { Component } from 'react';
import Board from './Board';
import {
  makeDeck,
  cardToggle,
  reshuffle,
  removeSelected as removeSelectedCards,
  isSet,
} from '../utils/helpers';

const config = {
  turnTime: 5000,
};

class Solo extends Component {
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
    this.setState({
      players: newPlayers,
      gameOver: newScore >= 6,
    });
  };

  performDeclare = (declarer, selected) => {
    const timeNow = new Date().getTime();
    const update = {
      declarer,
      selected,
      timeDeclared: timeNow,
    };
    if (!this.state.declarer) {
      this.setState(update);
      this.undeclareID = setTimeout(() => {
        const nextUpdate = {
          declarer: null,
          timeDeclared: null,
          selected: [],
        };
        this.setState(nextUpdate);
      }, config.turnTime);
    }
  };

  updateSelected = newSelected => {
    if (isSet(newSelected)) {
      this.markPointForDeclarer();
      this.setState({ setFound: true });
      clearTimeout(this.undeclareID);
      setTimeout(() => {
        this.removeSet();
      }, 2000);
    }
    this.setState({ selected: newSelected });
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
      const newState = {
        setFound: false,
        declarer: null,
        timeDeclared: null,
        ...removeSelectedCards(this.state),
      };
      this.setState(newState);
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

export default Solo;
