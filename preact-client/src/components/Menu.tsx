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
          <button class="card shadow-sm mb-3 mb-md-4" onClick={() => onNavigate('solo')}>
            <Card desc="1121" />
          </button>
          <p class="text-center">Solo Play</p>
        </div>
        <div class="col-9 col-md-4">
          <button class="card shadow-sm mb-3 mb-md-4" onClick={() => onNavigate('training')}>
            <Card desc="0012" />
          </button>
          <p class="text-center">Training Mode</p>
        </div>
        <div class="col-9 col-md-4">
          <button class="card shadow-sm mb-3 mb-md-4" onClick={() => onNavigate('shared')}>
            <Card desc="2020" />
          </button>
          <p class="text-center">Local Multiplayer</p>
        </div>
        <div class="col-9 col-md-4">
          <button class="card shadow-sm mb-3 mb-md-4" onClick={() => onNavigate('host')}>
            <Card desc="0101" />
          </button>
          <p class="text-center">Host Game</p>
        </div>
        <div class="col-9 col-md-4">
          <button class="card shadow-sm mb-3 mb-md-4" onClick={() => onNavigate('join')}>
            <Card desc="1210" />
          </button>
          <p class="text-center">Join Game</p>
        </div>
      </div>
    </div>
  )
}
