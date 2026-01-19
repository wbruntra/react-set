# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this repository.

## Project Overview

This is a React-based Set card game with:

- **Frontend**: React + TypeScript + Vite (client on port 9000)
- **Backend**: Express.js + SQLite + Socket.io (server on port 5002)
- **Database**: SQLite with Knex migrations
- **Real-time**: Firebase Firestore for game state + Socket.io for connections

## Development Commands

### Root Level Commands

```bash
# Start both client and server in development mode
bun run dev

# Start client only (port 9000)
bun run client

# Start server only (port 5002)
bun run server:dev

# Start database (Docker)
bun run dev:db

# Build for production
bun run predeploy

# Deploy to GitHub Pages
bun run deploy
```

### Client Commands (vite-client/)

```bash
# Development server (port 9000)
bun run dev

# Build production bundle
bun run build

# Run ESLint
bun run lint

# Preview production build
bun run preview
```

### Server Commands

```bash
# Development server with hot reload (port 5002)
bun --watch server.js

# Production server
bun server.js
```

### Testing Commands

```bash
# Run server-side tests
bun tests/test-dampening-effect.js
bun tests/test-corrected-timing.js
bun tests/test-action-logging.js

# Run client-side game test
cd vite-client && bun test-set-game.js
```

## Code Style Guidelines

### Formatting (Prettier)

- **Indentation**: 2 spaces (no tabs)
- **Line width**: 99 characters
- **Quotes**: Single quotes
- **Semicolons**: No semicolons
- **Trailing commas**: All
- **Arrow parens**: Always
- **JSX brackets**: New line

### TypeScript Configuration

- **Strict mode**: Disabled (`noImplicitAny: false`)
- **Unused variables**: Allowed (`noUnusedLocals: false`, `noUnusedParameters: false`)
- **Path aliases**: `@/*` maps to `./src/*`
- **Lib check**: Disabled (`skipLibCheck: true`)

### ESLint Rules

- **React Hooks**: Enforced
- **React Refresh**: Warn for component exports
- **Unused vars**: Disabled (`@typescript-eslint/no-unused-vars: off`)
- **Ignores**: `dist/` folder

### Import Conventions

```typescript
// React imports first
import React, { useState, useEffect } from 'react'

// Third-party libraries
import { debounce } from 'lodash'
import { Modal } from 'react-bootstrap'

// Local imports (use @ alias)
import { Card } from '@/components/Card'
import { countSets } from '@/utils/helpers'
import { Players } from '@/utils/models'
```

### Component Structure

```typescript
// Interface definitions first
interface ComponentProps {
  required: string
  optional?: number
}

// Component implementation
function ComponentName(props: ComponentProps) {
  // Hooks at the top
  const [state, setState] = useState<string>('')

  // Effects after hooks
  useEffect(() => {
    // effect logic
  }, [])

  // Helper functions before render
  const helperFunction = () => {
    // logic
  }

  // Return JSX
  return <div>{/* content */}</div>
}

export default ComponentName
```

### Naming Conventions

- **Components**: PascalCase (`Board.tsx`, `Card.tsx`)
- **Functions**: camelCase (`handleCardClick`, `countSets`)
- **Variables**: camelCase (`selectedCards`, `gameState`)
- **Constants**: UPPER_SNAKE_CASE (`MINIMUM_SETS`, `BOARD_SIZE`)
- **Files**: kebab-case for utilities (`helpers.ts`), PascalCase for components

### Error Handling

```typescript
// Firebase operations
try {
  const result = await signInWithPopup(auth, provider)
  console.log('✅ Success:', result.user.displayName)
  return result
} catch (error) {
  console.error('❌ Error:', error.message)
  throw error
}

// Async operations with proper typing
const updateGame = async (reference: string | DocumentReference, data: any) => {
  try {
    const game = typeof reference === 'string' ? doc(firestore, 'games', reference) : reference
    await updateDoc(game, {
      ...data,
      lastUpdate: serverTimestamp(),
    })
  } catch (error) {
    console.error('Failed to update game:', error)
    // Handle error appropriately
  }
}
```

### State Management Patterns

```typescript
// Redux Toolkit slices
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload
    },
    clearUser: (state) => {
      state.currentUser = null
    },
  },
})

// Local state with proper typing
const [gameState, setGameState] = useState<GameState>({
  board: [],
  deck: [],
  selected: [],
})
```

### File Organization

```
src/
├── components/          # React components
│   ├── Board.tsx
│   ├── Card.tsx
│   └── Solo/            # Feature-specific components
├── utils/              # Helper functions
│   ├── helpers.ts
│   └── models.ts
├── features/           # Redux slices
│   └── user/
├── hooks/              # Custom hooks
├── styles/             # CSS/SCSS files
└── types/              # TypeScript type definitions
```

## Database & Server Guidelines

### Database Operations

```javascript
// Use Knex for database queries
const games = await knex('games').where('status', 'active')

// Always use parameterized queries
const user = await knex('users').where('id', userId).first()
```

### Server Routes

```javascript
// Express route structure
app.get('/api/games', async (req, res) => {
  try {
    const games = await getAllGames()
    res.json(games)
  } catch (error) {
    console.error('Error fetching games:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
```

## Environment & Deployment

### Port Configuration

- **Client**: 9000 (Vite dev server)
- **Server**: 5002 (Express)
- **Database**: SQLite file in `db/` directory

### Environment Variables

- Firebase config in `src/firebaseConfig.ts`
- Database connection in `db_connection.js`
- No sensitive data in commits

## Important Notes

1. **Never start servers automatically** - User will start manually when ready
2. **Use Firebase popup authentication** - Not redirect-based
3. **Follow existing patterns** - Check similar components before creating new ones
4. **Test after changes** - Run lint and build commands before committing
5. **Socket.io integration** - Real-time features use both Firebase and Socket.io
6. **Game state management** - Primary in Firebase, backup in server memory

## Common Patterns

### Card Representation

```typescript
// Cards are 4-character strings: [color][shape][number][shading]
// Example: '0120' = red oval 1 striped
const card = '0120'
```

### Set Validation

```typescript
// Use existing helper for set checking
if (isSet(selectedCards)) {
  // Handle found set
}
```

### Firebase Listeners

```typescript
// Always cleanup listeners
useEffect(() => {
  const unsubscribe = onSnapshot(docRef, (doc) => {
    // Handle updates
  })

  return unsubscribe
}, [])
```
