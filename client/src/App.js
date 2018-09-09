import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import socket from './socket';
import Host from './components/Host';
import Guest from './components/Guest';

class App extends Component {
  componentDidMount() {
    socket.on('action', data => {
      switch (data.type) {
        case 'message':
          console.log(data);
          break;
        default:
          console.log('No match');
      }
    });
  }

  transmit = () => {
    socket.emit('transmit', { hello: 'bar' });
  };

  render() {
    return (
      <div>
        <Router>
          <Switch>
            <Route exact path="/" component={Host} />
            <Route path="/guest" component={Guest} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
