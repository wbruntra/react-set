import React, { Component } from 'react';
import { includes, map } from 'lodash';
import { countSets } from '../utils/helpers';
import Card from './Card';

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sets: countSets(props.board, true),
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(prevProps.board) !== JSON.stringify(this.props.board)) {
      this.setState({
        sets: countSets(this.props.board, true),
      });
    }
  }

  render() {
    const { board, selected, deck, declarer, players, setFound, gameOver, syncing } = this.props;
    const { sets } = this.state;
    if (gameOver) {
      return <div>GAME OVER!</div>;
    }
    return (
      <div>
        <div className="navbar-fixed">
          <nav>
            <div className="nav-wrapper">
              {declarer ? (
                <a href="#!" className="brand-logo">
                  SET! {declarer}
                </a>
              ) : (
                <a href="#!" className="brand-logo">
                  Sets: {sets}
                </a>
              )}
              <ul className="right hide-on-med-and-down">
                <li>
                  <a href="badges.html">Cards Left: {deck.length}</a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="container">
          <div className="row">
            {board.map(card => {
              return (
                <div
                  key={card}
                  className={'col s4' + (includes(selected, card) ? ' amber accent-2' : '')}
                  onClick={() => {
                    this.props.handleCardClick(card);
                  }}
                >
                  <div className={`card ${setFound && !includes(selected, card) ? 'blurry' : ''}`}>
                    <Card desc={card} />
                  </div>
                </div>
              );
            })}
            {syncing && (
              <div className="progress">
                <div className="indeterminate" style={{ width: '50%' }} />
              </div>
            )}
          </div>
          <div className="row">
            {map(players, (score, name) => {
              return (
                <div key={name} className="col s4 m3">
                  {name}: {score}
                </div>
              );
            })}
          </div>
          <div className="row">
            {this.props.handleRedeal && (
              <button onClick={this.props.handleRedeal} className="btn">
                Shuffle
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Board;
