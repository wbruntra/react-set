import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Main extends Component {

  render() {
    return (
      <div className="container">
        <ul className="collection">
          {/* <li className="collection-item">
            <Link to="/solo">Solo</Link>
          </li> */}
          <li className="collection-item">
            <Link to="/host">Host</Link>
          </li>
          <li className="collection-item">
            <Link to="/lobby">Guest</Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default Main;
