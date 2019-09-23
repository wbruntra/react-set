import React, { Component, Fragment } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Host from './Host'
import Guest from './Guest'
import Lobby from './Lobby'
import Solo from './Solo'
import Main from './Main'

class App extends Component {
  render() {
    return (
      <Fragment>
        <Router>
          <Switch>
            <Route exact path="/" component={Main} />
            <Route path="/host" component={Host} />
            <Route path="/lobby" component={Lobby} />
            <Route path="/guest/:gameName" component={Guest} />
            <Route path="/solo" component={Solo} />
          </Switch>
        </Router>
      </Fragment>
    )
  }
}

export default App
