import React, { Component } from 'react';
import Board from './Board';
import { cardToggle } from '../utils/helpers';
import * as firebase from 'firebase';
import firestore from '../firestore';

class Guest extends Component {
  constructor(props) {
    super(props);
    const initialGameState = {
      deck: [],
      board: [],
      selected: [],
    };
    this.state = {
      syncing: false,
      name: '',
      nameInput: 'guest',
      setFound: false,
      autoplay: false,
      ...initialGameState,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.declarer && this.state.declarer) {
      this.setState({
        syncing: false,
      });
    }
  }

  componentDidMount() {
    // const previousNickname = localStorage.getItem('nickname');
    // if (previousNickname) {
    //   this.setState({
    //     name: previousNickname,
    //   });
    // }
    this.gameRef = firestore.collection('games').doc('foo');
    this.gameRef.onSnapshot(doc => {
      this.setState({
        ...doc.data(),
      });
      console.log(doc.data());
    });
    this.actionsRef = this.gameRef.collection('actions');
  }

  handleNickname = e => {
    e.preventDefault();
    localStorage.setItem('nickname', this.state.nameInput);
    this.setState({
      name: this.state.nameInput,
    });
    this.sendAction({
      type: 'join',
      payload: { name: this.state.nameInput },
    });
  };

  handleCardClick = card => {
    const { declarer, name } = this.state;
    if (declarer === name) {
      const newSelected = cardToggle(card, this.state.selected);
      const action = {
        type: 'select',
        payload: { selected: newSelected, name: this.state.name },
      };
      this.sendAction(action);
      this.setState({
        selected: newSelected,
      });
    } else {
      this.handleDeclare(card);
    }
  };

  handleDeclare = card => {
    console.log('SET declared!');
    const action = {
      type: 'declare',
      payload: { selected: [card], name: this.state.name },
    };
    // console.log(JSON.stringify(action))
    console.log('Change syncing');
    this.setState({
      syncing: true,
    });
    this.sendAction(action);
  };

  sendAction = action => {
    this.actionsRef.add({
      ...action,
      created: firebase.firestore.FieldValue.serverTimestamp(),
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
          syncing={this.state.syncing}
        />
      </div>
    );
  }
}

export default Guest;
