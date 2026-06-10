import './styles/main.scss'

import { useState, useEffect } from 'preact/hooks'
import { Router, Route, Switch } from 'wouter-preact'
import { useHashLocation } from 'wouter-preact/use-hash-location'
import { Menu } from './components/Menu'
import { Solo } from './components/Solo/Solo'
import { Training } from './components/Training/Training'
import { SharedDevice } from './components/SharedDevice/SharedDevice'
import { Host } from './components/Host/Host'
import { Guest } from './components/Guest/Guest'
import { Stats } from './components/Stats'
import { ensureAnonymousAuth } from './auth'

export function App() {
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    ensureAnonymousAuth().then(() => setAuthReady(true))
  }, [])

  if (!authReady) {
    return (
      <div class="container mt-5 text-center">
        <h3 class="text-white">Connecting...</h3>
      </div>
    )
  }

  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/solo" component={Solo} />
        <Route path="/training" component={Training} />
        <Route path="/shared" component={SharedDevice} />
        <Route path="/host/:gameId?">{(params) => <Host gameId={params.gameId} />}</Route>
        <Route path="/join/:gameId?">{(params) => <Guest gameId={params.gameId} />}</Route>
        <Route path="/stats" component={Stats} />
        <Route component={Menu} />
      </Switch>
    </Router>
  )
}
