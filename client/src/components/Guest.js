import React, { Component, Fragment } from 'react';
import Board from './Board';
import { isEmpty } from 'lodash';
import { cardToggle, isSet } from '../utils/helpers';
import * as firebase from 'firebase';
import firestore from '../firestore';
import Modal from './Modal';

class Guest extends Component {
  constructor(props) {
    super(props);
    const initialGameState = {
      deck: [],
      board: [],
      selected: [],
    };
    this.state = {
      popupVisible: false,
      name: '',
      nameInput: '',
      setFound: false,
      autoplay: false,
      ...initialGameState,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.declarer && this.state.declarer) {
      this.setState({
        popupVisible: false,
      });
    }
  }

  componentDidMount() {
    this.togglePopup();
    // const previousNickname = localStorage.getItem('nickname');
    // if (previousNickname) {
    //   this.setState({
    //     name: previousNickname,
    //   });
    // }
    this.nameInput.focus();
    this.gameRef = firestore.collection('games').doc('foo');
    this.gameRef.onSnapshot(doc => {
      this.setState({
        ...doc.data(),
        popupVisible: false,
      });
      console.log(doc.data());
    });
    this.actionsRef = this.gameRef.collection('actions');
  }

  handleNickname = e => {
    e.preventDefault();
    const { nameInput } = this.state;
    const playerName = isEmpty(nameInput) ? 'guest' : nameInput;
    localStorage.setItem('nickname', playerName);
    this.setState({
      name: playerName,
    });
    this.sendAction({
      type: 'join',
      payload: { name: playerName },
    });
  };

  handleCardClick = card => {
    const { name } = this.state;
    const newSelected = cardToggle(card, this.state.selected);
    const newState = {};
    if (newSelected.length === 3) {
      if (isSet(newSelected)) {
        const action = {
          type: 'found',
          payload: { selected: newSelected, name },
        };
        this.sendAction(action);
        newState.popupVisible = true;
      } else {
        console.log('Bad set selected!');
        window.setTimeout(this.resetLocalSelected, 1000);
      }
    }

    this.setState({
      ...newState,
      selected: newSelected,
    });
    // this.handleDeclare(card);
  };

  // handleDeclare = card => {
  //   console.log('SET declared!');
  //   const action = {
  //     type: 'declare',
  //     payload: { selected: [card], name: this.state.name },
  //   };
  //   // console.log(JSON.stringify(action))
  //   console.log('Change syncing');
  //   this.setState({
  //     syncing: true,
  //     popupVisible: true,
  //   });
  //   this.sendAction(action);
  // };

  sendAction = action => {
    this.actionsRef.add({
      ...action,
      created: firebase.firestore.FieldValue.serverTimestamp(),
    });
  };

  togglePopup = () => {
    this.setState(state => ({
      popupVisible: !state.popupVisible,
    }));
  };

  resetLocalSelected = () => {
    // NOTE: Need to be sure a real set wasn't found during the delay
    const { declarer, selected } = this.state;
    if (isSet(selected)) {
      return;
    }
    if (selected.length === 3 && !declarer) {
      this.setState({
        selected: [],
      });
    }
  };

  render() {
    const { board, deck, selected, name, declarer, players, popupVisible } = this.state;
    if (!name) {
      return (
        <div className="container">
          <h2>Choose nickname</h2>
          <form onSubmit={this.handleNickname}>
            <input
              ref={input => {
                this.nameInput = input;
              }}
              type="text"
              placeholder="your name"
              value={this.state.nameInput}
              onChange={e => this.setState({ nameInput: e.target.value })}
            />
            <input type="submit" />
          </form>
        </div>
      );
    }
    return (
      <Fragment>
        <Modal visible={popupVisible}>
          <p className="flow-text center-align">SET!</p>
          <div className="progress">
            <div className="indeterminate" style={{ width: '30%' }} />
          </div>
        </Modal>
        <Board
          board={board}
          deck={deck}
          selected={selected}
          declarer={declarer}
          handleCardClick={this.handleCardClick}
          // handleDeclare={this.handleDeclare}
          players={players}
          setFound={this.state.setFound}
          gameOver={this.state.gameOver}
          // syncing={this.state.syncing}
          myName={this.state.name}
        />
      </Fragment>
    );
  }
}

export default Guest;
