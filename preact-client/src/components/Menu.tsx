import { useLocation, Link } from 'wouter-preact'
import { Card } from './Card'

export function Menu() {
  const [, navigate] = useLocation()

  return (
    <div class="container bg-light-purple mt-3 mt-md-5 p-4">
      <h1 class="d-none d-md-block text-center mb-3 mb-md-5">Main Menu</h1>
      <div class="row justify-content-center">
        <div class="col-9 col-md-4">
          <div
            class="card shadow-sm mb-3 mb-md-4 cursor-pointer"
            onClick={() => navigate('/solo')}
            role="button"
            tabIndex={0}
          >
            <Card desc="0012" />
          </div>
          <p class="text-center">Solo/Local</p>
        </div>
        <div class="col-9 col-md-4">
          <div
            class="card shadow-sm mb-3 mb-md-4 cursor-pointer"
            onClick={() => navigate('/join')}
            role="button"
            tabIndex={0}
          >
            <Card desc="1121" />
          </div>
          <p class="text-center">Join Game</p>
        </div>
        <div class="col-9 col-md-4">
          <div
            class="card shadow-sm mb-3 mb-md-4 cursor-pointer"
            onClick={() => navigate('/host')}
            role="button"
            tabIndex={0}
          >
            <Card desc="2200" />
          </div>
          <p class="text-center">Host Game</p>
        </div>
      </div>

      <hr />

      <div class="text-center mt-4">
        <p>
          <Link href="/training">Training Mode</Link>
        </p>
        <p>
          <Link href="/shared">Local Multiplayer</Link>
        </p>
        <p>
          <Link href="/stats">View Statistics</Link>
        </p>
      </div>
    </div>
  )
}
