import * as React from 'react';
import Board from './Board';
import { isEmpty } from 'lodash';
import { cardToggle, isSet } from '../utils/helpers';
import firebase from 'firebase/app';
import 'firebase/firestore';
import firestore from '../firestore';
import Modal from './Modal';

type Props = {
  /* ... */
};

type State = {
  popupVisible: boolean,
  name: string,
  nameInput: string,
  setFound: boolean,
  autoplay: boolean,
  deck: Array<string>,
  board: Array<string>,
  selected: Array<string>,
  declarer: string,
};

class Guest extends React.Component<Props, State> {
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
      displayAnimation: false,
      animatedSet: [],
      declarer: '',
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
    const previousNickname = localStorage.getItem('nickname');
    const { gameName } = this.props.match.params;
    if (previousNickname) {
      this.setState({
        nameInput: previousNickname,
      });
    }
    this.nameInput.focus();
    this.gameRef = firestore.collection('games').doc(gameName);
    this.gameRef.onSnapshot(doc => {
      if (!this.state.displayAnimation) {
        this.processUpdate(doc);
      } else {
        setTimeout(() => {
          this.processUpdate(doc);
        }, 1800);
      }
    });
    this.actionsRef = this.gameRef.collection('actions');
  }

  processUpdate = doc => {
    const updatedState = { ...doc.data() };
    console.log('Updating', updatedState);
    if (!this.state.displayAnimation && updatedState.selected.length === 3) {
      console.log('New set found');
      Object.assign(updatedState, {
        displayAnimation: true,
        selected: updatedState.selected.slice(0, 1),
        animatedSet: updatedState.selected.slice(1),
      });
      this.animationId = setInterval(this.animate, 800);
    }
    this.setState({
      ...updatedState,
      popupVisible: false,
    });
  };

  animate = () => {
    const animatedSet = [...this.state.animatedSet];
    const newSelected = [...this.state.selected, animatedSet.shift()];
    const newState = {
      selected: newSelected,
      animatedSet,
    };
    if (newSelected.length === 3) {
      clearInterval(this.animationId);
      Object.assign(newState, {displayAnimation: false});
    }
    this.setState(newState);
  };

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

  handleCardClick = (card: string) => {
    const { name, declarer } = this.state;
    if (declarer) {
      return;
    }
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
  };

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
          <h4>Choose nickname</h4>
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
            <input className="btn" type="submit" />
          </form>
        </div>
      );
    }

    return (
      <React.Fragment>
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
      </React.Fragment>
    );
  }
}

export default Guest;
