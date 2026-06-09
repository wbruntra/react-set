import { Card } from './Card'

type Page = 'menu' | 'solo' | 'training' | 'shared' | 'host' | 'join'

interface MenuProps {
  onNavigate: (page: Page, gameId?: string) => void
}

export function Menu({ onNavigate }: MenuProps) {
  return (
    <div class="container bg-light-purple mt-3 mt-md-5 p-4">
      <h1 class="d-none d-md-block text-center mb-3 mb-md-5">Main Menu</h1>
      <div class="row justify-content-center">
        <div class="col-9 col-md-4">
          <div
            class="card shadow-sm mb-3 mb-md-4 cursor-pointer"
            onClick={() => onNavigate('solo')}
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
            onClick={() => onNavigate('join')}
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
            onClick={() => onNavigate('host')}
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
          <a href="#" onClick={(e) => (e.preventDefault(), onNavigate('training'))}>
            Training Mode
          </a>
        </p>
        <p>
          <a href="#" onClick={(e) => (e.preventDefault(), onNavigate('shared'))}>
            Local Multiplayer
          </a>
        </p>
      </div>
    </div>
  )
}
