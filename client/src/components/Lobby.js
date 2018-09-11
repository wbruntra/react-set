import React, { Component } from 'react';
import { concat } from 'lodash';
import firestore from '../firestore';

class Lobby extends Component {
  constructor(props) {
    super(props);
    const games = [];

    this.state = {
      name: '',
      newGame: 'baz',
      games
    };
  }

  componentDidMount() {
    const { games } = this.state;
    this.gamesRef = firestore.collection('games');

    this.gamesRef.onSnapshot(snapshot => {
      const newGames = [];
      snapshot.forEach(doc => {
        newGames.push({
          name: doc.id,
          ...doc.data()
        });
      });
      this.setState({
        games: newGames
      });
    });
  }

  addGame = e => {
    e.preventDefault();
    const { newGame } = this.state;
    this.gamesRef.doc(newGame).set({
      host: 'bill'
    });
  };

  render() {
    const { games } = this.state;
    return (
      <div>
        <ul>
          {games.map(game => {
            return <li key={game.name}>{game.name}</li>;
          })}
        </ul>
        <form onSubmit={this.addGame}>
          <input
            type="text"
            value={this.state.newGame}
            onChange={e => {
              this.setState({
                newGame: e.target.value
              });
            }}
          />
          <input value="Add Game" className="btn" type="submit" />
        </form>
      </div>
    );
  }
}

export default Lobby;
