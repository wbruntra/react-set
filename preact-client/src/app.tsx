import './styles/main.scss'

import { useState, useEffect, useCallback } from 'preact/hooks'
import { Menu } from './components/Menu'
import { Solo } from './components/Solo/Solo'
import { Training } from './components/Training/Training'
import { SharedDevice } from './components/SharedDevice/SharedDevice'
import { Host } from './components/Host/Host'
import { Guest } from './components/Guest/Guest'
import { ensureAnonymousAuth } from './auth'

type Page = 'menu' | 'solo' | 'training' | 'shared' | 'host' | 'join'

function readHash(): { page: Page; gameId?: string } {
  const h = window.location.hash.replace('#/', '').replace('#', '')
  if (h === 'solo') return { page: 'solo' }
  if (h === 'training') return { page: 'training' }
  if (h === 'shared') return { page: 'shared' }
  if (h === 'host') return { page: 'host' }
  if (h.startsWith('join/')) return { page: 'join', gameId: h.slice(5) }
  if (h === 'join') return { page: 'join' }
  return { page: 'menu' }
}

function writeHash(page: Page, gameId?: string) {
  if (page === 'menu') {
    window.location.hash = ''
  } else if (page === 'join' && gameId) {
    window.location.hash = `#/join/${gameId}`
  } else {
    window.location.hash = `#/${page}`
  }
}

export function App() {
  const [route, setRoute] = useState(readHash)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    ensureAnonymousAuth().then(() => setAuthReady(true))
    const onHash = () => setRoute(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((p: Page, gameId?: string) => {
    writeHash(p, gameId)
    setRoute({ page: p, gameId })
  }, [])

  if (route.page === 'solo') {
    return <Solo onNavigateHome={() => navigate('menu')} />
  }

  if (route.page === 'training') {
    return <Training onNavigateHome={() => navigate('menu')} />
  }

  if (route.page === 'shared') {
    return <SharedDevice onNavigateHome={() => navigate('menu')} />
  }

  if (route.page === 'host') {
    return <Host onNavigateHome={() => navigate('menu')} />
  }

  if (route.page === 'join') {
    return <Guest onNavigateHome={() => navigate('menu')} initialGameId={route.gameId} />
  }

  return <Menu onNavigate={navigate} />
}
