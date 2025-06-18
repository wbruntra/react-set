# Host Component Refactoring

This directory contains the refactored Host component, broken down into maintainable pieces following the same pattern as the Solo component.

## Structure

### Core Hook

- `useHostGame.ts` - Main game logic hook that manages all state and Firebase interactions

### UI Components

- `MessageCard.tsx` - Reusable card component for displaying messages and forms
- `SignInPrompt.tsx` - Component for prompting user to sign in with Google
- `GameResumePrompt.tsx` - Component for handling existing game resumption
- `NicknameSetup.tsx` - Component for setting up user nickname
- `GameCreation.tsx` - Component for creating a new game

### Configuration

- `constants.ts` - Game configuration constants
- `index.ts` - Exports all components and hooks

## Benefits of Refactoring

1. **Separation of Concerns**: UI components are separated from business logic
2. **Reusability**: Components like MessageCard can be reused
3. **Testability**: Individual components and hooks can be tested in isolation
4. **Maintainability**: Smaller, focused files are easier to understand and modify
5. **Consistency**: Follows the same pattern as the Solo component

## Usage

The main Host component now simply orchestrates these smaller pieces based on the current state:

```tsx
import { useHostGame, SignInPrompt, GameResumePrompt, /* etc */ } from './Host/'

function Host() {
  const { state, gameInProgress, handlers } = useHostGame(user)

  // Render appropriate component based on state
  if (isEmpty(user)) return <SignInPrompt />
  if (gameInProgress && !created) return <GameResumePrompt ... />
  // etc.
}
```
