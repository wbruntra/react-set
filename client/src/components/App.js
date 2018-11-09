import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Host from './Host';
import Guest from './Guest';
import Lobby from './Lobby';
import Solo from './Solo';

class App extends Component {
  render() {
    return (
      <div>
        <Router>
          <Switch>
            <Route exact path="/" component={Host} />
            <Route path="/guest" component={Guest} />
            <Route path="/lobby" component={Lobby} />
            <Route path="/solo" component={Solo} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
