import React, { Component, Fragment } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Host from './Host'
import Guest from './Guest'
import Lobby from './Lobby'
import Solo from './Solo'
import Main from './Main'
import Rules from './Rules'
import Login from './Login'
import SharedDevice from './SharedDevice'
import Stats from './Stats'

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
          </Switch>
        </Router>
      </Fragment>
    )
  }
}

export default Routes
