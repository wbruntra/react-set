# Training Component Refactoring

This folder contains the refactored Training component that has been broken down into smaller, more maintainable pieces.

## Structure

```
Training/
├── Training.tsx          # Main component
├── IntroModal.tsx        # Introduction modal component
├── GameOverModal.tsx     # Game over modal component
├── useTrainingGame.ts    # Game state management hook
├── useTrainingTimer.ts   # Timer logic hook
├── constants.ts          # Configuration constants
├── index.ts              # Barrel exports
└── README.md            # This file
```

## Components

### Training.tsx

The main component that orchestrates the training game. It's now much cleaner and focuses primarily on rendering and event handling.

### IntroModal.tsx

A standalone modal component that shows the introduction to training mode.

### GameOverModal.tsx

A standalone modal component that displays when the game ends, showing the final score and high score.

## Custom Hooks

### useTrainingGame.ts

Manages all game state including:

- Board generation
- Card selection
- Score tracking
- Game lifecycle (start, reset, game over)
- High score persistence

### useTrainingTimer.ts

Handles all timer-related logic:

- Elapsed time tracking
- Turn time calculation
- Countdown management
- Time-up detection

## Configuration

### constants.ts

Contains all configuration constants:

- Timer settings
- Game settings
- Storage keys

## Benefits of this refactoring

1. **Separation of Concerns**: Each file has a single responsibility
2. **Reusability**: Components and hooks can be reused elsewhere
3. **Testability**: Smaller, focused functions are easier to test
4. **Maintainability**: Changes to one aspect (e.g., timer logic) don't affect others
5. **Readability**: The main component is much cleaner and easier to understand
6. **Type Safety**: Better TypeScript support with proper interfaces

## Usage

The component can still be imported the same way:

```tsx
import Training from './components/Training'
```

The original Training.tsx file now just re-exports the refactored version for backward compatibility.
