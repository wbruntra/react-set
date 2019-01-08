import React, { Component } from 'react';
import firestore from '../firestore';
import { Link } from 'react-router-dom';
import { filter } from 'lodash';

class Lobby extends Component {
  constructor(props) {
    super(props);
    const games = [];

    this.state = {
      name: '',
      newGame: 'baz',
      games,
    };
  }

  componentDidMount() {
    this.gamesRef = firestore.collection('games');

    this.unsubscribe = this.gamesRef.onSnapshot(snapshot => {
      const newGames = [];
      snapshot.forEach(doc => {
        newGames.push({
          name: doc.id,
          ...doc.data(),
        });
      });
      this.setState({
        games: newGames,
      });
    });
  }

  componentWillUnmount = () => {
    this.unsubscribe();
  };

  addGame = e => {
    e.preventDefault();
    const { newGame } = this.state;
    this.gamesRef.doc(newGame).set({
      host: 'bill',
    });
  };

  render() {
    const { games } = this.state;
    const activeGames = filter(games, g => {
      const updated = g.lastUpdate.toMillis();
      const now = new Date().getTime();
      const age = Math.round((now - updated) / 1000);
      return age < 30;
    });
    if (activeGames.length === 0) {
      return (
        <div className="container">
          <p>No active games</p>
          <Link to="/">Back</Link>
        </div>
      );
    }
    return (
      <div className="container">
        <h4>Available games</h4>
        <ul className="collection">
          {activeGames.map(game => {
            return (
              <li className="collection-item" key={game.name}>
                <Link to={`/guest/${game.name}`}> {game.name} </Link>
              </li>
            );
          })}
        </ul>
        {/* <form onSubmit={this.addGame}>
          <input
            type="text"
            value={this.state.newGame}
            onChange={e => {
              this.setState({
                newGame: e.target.value,
              });
            }}
          />
          <input value="Add Game" className="btn" type="submit" />
        </form> */}
      </div>
    );
  }
}

export default Lobby;
