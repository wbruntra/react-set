import './styles/main.scss'

import { useState, useEffect, useCallback } from 'preact/hooks'
import { Menu } from './components/Menu'
import { Solo } from './components/Solo/Solo'
import { Training } from './components/Training/Training'

type Page = 'menu' | 'solo' | 'training'

function readHash(): Page {
  const h = window.location.hash.replace('#/', '').replace('#', '')
  if (h === 'solo') return 'solo'
  if (h === 'training') return 'training'
  return 'menu'
}

function writeHash(page: Page) {
  if (page === 'menu') {
    window.location.hash = ''
  } else {
    window.location.hash = `#/${page}`
  }
}

export function App() {
  const [page, setPage] = useState<Page>(readHash)

  const navigate = useCallback((p: Page) => {
    writeHash(p)
    setPage(p)
  }, [])

  useEffect(() => {
    const onHash = () => setPage(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (page === 'solo') {
    return <Solo onNavigateHome={() => navigate('menu')} />
  }

  if (page === 'training') {
    return <Training onNavigateHome={() => navigate('menu')} />
  }

  return <Menu onNavigate={(p) => navigate(p)} />
}
