import React, { Component, Fragment } from 'react';
import firestore from '../firestore';
import { Link } from 'react-router-dom';

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
    const activeGames = games.filter(g => {
      const { lastUpdate } = g;
      if (!lastUpdate) {
        return false;
      }
      const updated = lastUpdate.toMillis();
      const now = new Date().getTime();
      const age = Math.round((now - updated) / 1000);
      return age < 40;
    });
    return (
      <div className="container">
        {activeGames.length === 0 ? (
          <Fragment>
            <div className="row center-align">
              <div className="col s4 card horizontal game-tile-empty">
                <p>No active games</p>
              </div>
            </div>
            <Link to="/">Back</Link>
          </Fragment>
        ) : (
          <Fragment>
            <h4 className="center-align">Available games</h4>
            <div className="row center-align">
              {activeGames.map(game => {
                return (
                  <div className="col s4 game-tile" key={game.name}>
                    <Link to={`/guest/${game.name}`}> {game.name} </Link>
                  </div>
                );
              })}
            </div>
          </Fragment>
        )}
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
