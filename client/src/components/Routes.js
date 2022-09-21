import React, { Component, Fragment } from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'

import Guest from './Guest'
import Host from './Host'
import Lobby from './Lobby'
import Login from './Login'
import Main from './Main'
import Puzzle from './Puzzle'
import Rules from './Rules'
import SharedDevice from './SharedDevice'
import Solo from './Solo'
import Stats from './Stats'
import Training from './Training'

class Routes extends Component {
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
            <Route path="/local" component={SharedDevice} />
            <Route path="/rules" component={Rules} />
            <Route path="/login" component={Login} />
            <Route path="/stats" component={Stats} />
            <Route path="/puzzle" component={Puzzle} />
            <Route path="/training" component={Training} />
          </Switch>
        </Router>
      </Fragment>
    )
  }
}

export default Routes
