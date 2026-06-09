import { Card } from './Card'

interface MenuItemProps {
  cardName: string
  description: string
  onClick?: () => void
  disabled?: boolean
}

function MenuItem({ cardName, description, onClick, disabled }: MenuItemProps) {
  return (
    <div class="col-9 col-md-4">
      <div
        class={`card shadow-sm mb-3 mb-md-4${disabled ? ' opacity-50' : ''}`}
        style={onClick && !disabled ? 'cursor: pointer;' : 'cursor: default;'}
        onClick={disabled ? undefined : onClick}
        role={onClick && !disabled ? 'button' : undefined}
      >
        <Card desc={cardName} />
      </div>
      <p class="text-center">{description}</p>
    </div>
  )
}

interface MenuProps {
  onNavigate: (page: 'solo' | 'training') => void
}

export function Menu({ onNavigate }: MenuProps) {
  const menuItems = [
    { cardName: '0012', description: 'Solo/Local', onClick: () => onNavigate('solo') },
    { cardName: '1121', description: 'Join Game', disabled: true },
    { cardName: '2200', description: 'Host Game', disabled: true },
  ]

  return (
    <div class="container bg-light-purple mt-3 mt-md-5 p-4">
      <h1 class="d-none d-md-block text-center mb-3 mb-md-5">Main Menu</h1>
      <div class="row justify-content-center">
        {menuItems.map((item, i) => (
          <MenuItem key={`card-${i}`} {...item} />
        ))}
      </div>
      <hr />
      <div class="d-none d-md-block text-center">
        <p class="opacity-50">Rules</p>
        <p class="opacity-50">View Statistics</p>
      </div>
      <div class="text-center mt-4">
        <p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              onNavigate('training')
            }}
          >
            Training Mode
          </a>
        </p>
      </div>
    </div>
  )
}
