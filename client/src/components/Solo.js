import React, { Component } from 'react';
import Board from './Board';
import {
  makeDeck,
  cardToggle,
  reshuffle,
  removeSelected as removeSelectedCards,
  isSet,
  nameThird,
} from '../utils/helpers';
import { shuffle, cloneDeep } from 'lodash';
import { colors } from '../config';
import update from 'immutability-helper';

const config = {
  turnTime: 4000,
  colors,
  playingTo: 6,
};

const calculateIntervalFromDifficulty = d => {
  return 12000 / (2.5 * Number(d));
};

const createGameState = () => {
  const initialDeck = makeDeck();
  return {
    ...reshuffle({
      deck: initialDeck.slice(12),
      board: initialDeck.slice(0, 12),
    }),
    selected: [],
  };
};

const initialState = {
  players: {
    you: {
      score: 0,
      color: config.colors[0],
    },
    cpu: {
      score: 0,
      color: config.colors[1],
    },
  },
  gameStarted: false,
  name: 'you',
  setFound: false,
  declarer: null,
  timeDeclared: null,
  gameOver: false,
  difficulty: '2',
  cpuTurnInterval: 1000,
  cpuFound: [],
};

class Solo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...cloneDeep(initialState),
      ...createGameState(),
    };
  }

  handleStartGame = e => {
    e.preventDefault();
    this.setState({
      gameStarted: true,
    });
    console.log(`Turns every ${this.state.cpuTurnInterval} ms`);
    this.cpuTimer = setInterval(this.cpuTurn, this.state.cpuTurnInterval);
  };

  componentDidMount = () => {
    const { difficulty } = this.state;
    const cpuTurnInterval = calculateIntervalFromDifficulty(difficulty);
    this.setState({
      cpuTurnInterval,
    });
  };

  componentWillUnmount = () => {
    clearInterval(this.cpuTimer);
  };

  cpuTurn = () => {
    const { board, declarer, gameOver } = this.state;
    if (declarer || gameOver) {
      return;
    }
    const [a, b] = shuffle(board).slice(0, 2);
    const c = nameThird(a, b);
    if (board.includes(c)) {
      this.setState({
        declarer: 'cpu',
        selected: [a],
        cpuFound: [b, c],
      });
      this.cpuAnimation = window.setInterval(this.animateCpuChoice, 1000);
    }
  };

  animateCpuChoice = () => {
    const { selected, cpuFound } = this.state;
    const cpuCopy = [...cpuFound];
    const newSelected = [...selected, cpuCopy.pop()];
    this.setState({
      cpuFound: cpuCopy,
      selected: newSelected,
    });
    if (newSelected.length === 3) {
      clearInterval(this.cpuAnimation);
      this.updateSelected(newSelected, 'cpu');
    }
  };

  updatePlayerScore = (name: string, delta: number) => {
    const { players } = this.state;
    const newScore = players[name].score + delta;
    const newPlayers = update(players, {
      [name]: {
        $merge: {
          score: newScore,
        },
      },
    });
    return [newPlayers, newScore];
  };

  expireDeclare = () => {
    const { declarer, selected } = this.state;
    if (!isSet(selected)) {
      const [newPlayers] = this.updatePlayerScore(declarer, -1);
      this.setState({
        players: newPlayers,
        declarer: null,
        timeDeclared: null,
        selected: [],
      });
    }
  };

  markPointForDeclarer = declarer => {
    const [newPlayers, newScore] = this.updatePlayerScore(declarer, 1);
    this.setState({
      players: newPlayers,
      gameOver: newScore >= config.playingTo,
    });
  };

  performDeclare = declarer => {
    if (!this.state.declarer) {
      const timeNow = new Date().getTime();
      const update = {
        declarer,
        timeDeclared: timeNow,
      };
      this.setState(update);

      this.undeclareID = setTimeout(() => {
        this.expireDeclare();
      }, config.turnTime);
    }
  };

  updateSelected = (newSelected: Array<string>, declarer: string) => {
    const newState = {
      setFound: isSet(newSelected),
      selected: newSelected,
      declarer,
    };
    if (newState.setFound) {
      clearTimeout(this.undeclareID);
      setTimeout(() => {
        this.removeSet();
      }, 2000);
    }
    this.setState(newState);
  };

  handleCardClick = card => {
    const { setFound, declarer, name } = this.state;
    if (!setFound && declarer !== 'cpu') {
      const newSelected = cardToggle(card, this.state.selected);
      if (!declarer) {
        this.performDeclare(name);
      }
      this.setState({
        selected: newSelected,
      });
      if (isSet(newSelected)) {
        this.updateSelected(newSelected, 'you');
      }
    }
  };

  handleRedeal = () => {
    const newState = reshuffle(this.state);
    this.setState(newState);
  };

  removeSet = () => {
    const { declarer, selected } = this.state;
    if (isSet(selected)) {
      console.log('Set found, removing');
      const newScores = this.markPointForDeclarer(declarer);
      const newState = {
        ...newScores,
        setFound: false,
        declarer: null,
        timeDeclared: null,
        ...removeSelectedCards(this.state),
      };
      this.setState(newState);
    }
  };

  resetGame = () => {
    clearInterval(this.cpuTimer);
    this.setState({
      ...cloneDeep(initialState),
      ...createGameState(),
    });
  };

  render() {
    const { board, deck, selected, declarer, players, gameStarted } = this.state;
    if (!gameStarted) {
      return (
        <div className="container">
          <h4>Choose difficulty</h4>
          <div className="row">
            <div className="col s8 m4">
              <form onSubmit={this.handleStartGame}>
                <p className="range-field">
                  <input
                    type="range"
                    value={this.state.difficulty}
                    min="1"
                    max="5"
                    onChange={e => {
                      const difficulty = e.target.value;
                      const cpuTurnInterval = calculateIntervalFromDifficulty(difficulty);
                      this.setState({
                        cpuTurnInterval,
                        difficulty,
                      });
                    }}
                  />
                </p>
                <input type="submit" value="Start" className="btn" />
              </form>
            </div>
          </div>
        </div>
      );
    }
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
        myName={this.state.name}
        resetGame={this.resetGame}
        solo={true}
      />
    );
  }
}

export default Solo;
