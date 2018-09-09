import React, { Component } from 'react';
import Board from './Board';
import { cardToggle } from '../utils/helpers';
import socket from '../socket';

class Guest extends Component {
  constructor(props) {
    super(props);
    const initialGameState = {
      deck: [],
      board: [],
      selected: []
    };
    this.state = {
      name: '',
      nameInput: 'guest',
      setFound: false,
      autoplay: false,
      ...initialGameState
    };
  }

  componentDidMount() {
    socket.on('guest', data => {
      this.setState({
        ...data.payload
      });
    });
  }

  handleNickname = e => {
    e.preventDefault();
    this.setState({
      name: this.state.nameInput
    });
    socket.emit('guest', {
      type: 'join',
      payload: { name: this.state.nameInput }
    });
  };

  handleCardClick = card => {
    const { declarer, name } = this.state;
    if (declarer === name) {
      const newSelected = cardToggle(card, this.state.selected);
      socket.emit('guest', {
        type: 'select',
        payload: { selected: newSelected, name: this.state.name }
      });
    } else {
      this.handleDeclare();
    }
  };

  handleDeclare = () => {
    console.log('SET declared!');
    socket.emit('guest', {
      type: 'declare',
      payload: { name: this.state.name }
    });
  };

  render() {
    const { board, deck, selected, name, declarer, players } = this.state;
    if (!name) {
      return (
        <div>
          <h2>Choose nickname</h2>
          <form onSubmit={this.handleNickname}>
            <input
              type="text"
              value={this.state.nameInput}
              onChange={e => this.setState({ nameInput: e.target.value })}
            />
            <input type="submit" />
          </form>
        </div>
      );
    }
    return (
      <div>
        <Board
          board={board}
          deck={deck}
          selected={selected}
          declarer={declarer}
          handleCardClick={this.handleCardClick}
          handleDeclare={this.handleDeclare}
          players={players}
          setFound={this.state.setFound}
          gameOver={this.state.gameOver}
        />
      </div>
    );
  }
}

export default Guest;
