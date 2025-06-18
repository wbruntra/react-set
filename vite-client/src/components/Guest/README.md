# Guest Component Refactoring

This directory contains the refactored Guest component following the same pattern as the Host component.

## Structure

### Components

- **`GuestSignIn.tsx`** - Handles guest user authentication and initial sign-in
- **`NicknameSetup.tsx`** - Allows users to set their nickname before joining the game
- **`GameBoard.tsx`** - Renders the game board and handles game interactions
- **`useGuestGame.ts`** - Custom hook containing all game logic and Firebase interactions

### Supporting Files

- **`constants.ts`** - Configuration constants for the guest component
- **`index.ts`** - Exports all components and hooks for easy importing

## Benefits of this refactoring

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be reused or modified independently
3. **Testability**: Smaller components are easier to test
4. **Maintainability**: Easier to understand and maintain individual pieces
5. **Consistency**: Follows the same pattern as the Host component

## Usage

```tsx
import { useGuestGame, GuestSignIn, NicknameSetup, GameBoard } from './Guest/index'

// The main Guest component now uses these smaller components
// based on the current state of the game
```

## Key Features

- **Guest Authentication**: Supports both guest users and Google sign-in
- **Firebase Integration**: Handles real-time updates and actions
- **Error Handling**: Gracefully handles Firebase permission errors
- **State Management**: Centralized state management through the custom hook
