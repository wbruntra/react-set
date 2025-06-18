# Solo Component Refactoring

This directory contains the refactored Solo game component, broken down into smaller, more manageable pieces for better organization and maintainability.

## Structure

```
Solo/
├── index.ts                    # Main exports
├── constants.ts                # Game configuration constants
├── gameUtils.ts                # Pure utility functions
├── hooks.ts                    # Custom React hooks (game timers)
├── useSoloGame.ts              # Main game logic hook
├── DifficultySetup.tsx         # Pre-game setup component
└── README.md                   # This file

Shared Components:
├── ../FlashOverlay.tsx         # Shared animation overlay component
├── ../FlashOverlay.module.scss # Shared SCSS styles for animations
└── ../hooks/useFlashAnimation.ts # Shared flash animation hook
```

## Components

### Solo.tsx (Main Component)

- **Purpose**: Main entry point for the Solo game mode
- **Responsibilities**:
  - Manages Redux state integration
  - Renders appropriate UI based on game state
  - Orchestrates game flow between setup and gameplay

### DifficultySetup.tsx

- **Purpose**: Pre-game difficulty selection and authentication
- **Responsibilities**:
  - Difficulty slider and settings
  - Google authentication integration
  - Navigation links to other game modes
  - Game start handling

### FlashOverlay.tsx

- **Purpose**: Visual feedback animations
- **Responsibilities**:
  - CPU flash animation (red overlay)
  - User success flash animation (green overlay)
  - Clean component with SCSS module imports

### FlashOverlay.module.scss

- **Purpose**: Animation styles and keyframes
- **Features**:
  - SASS variables for easy customization
  - Keyframe animations for both flash types
  - Modular CSS to avoid global namespace pollution

## Hooks

### useSoloGame.ts

- **Purpose**: Main game logic and state management
- **Responsibilities**:
  - Game state initialization and management
  - Timer management for CPU turns, animations, and declarations
  - Game event handling (card clicks, redeal, reset)
  - Integration with flash animations
  - Score tracking and game completion

### hooks.ts

- **Purpose**: Smaller, focused custom hooks
- **Exports**:
  - `useFlashAnimation`: Manages flash animation state
  - `useGameTimers`: Provides timer creation functions
  - `updatePlayerScore`: Utility for score updates

## Utilities

### constants.ts

- **Purpose**: Centralized configuration
- **Exports**:
  - `GAME_CONFIG`: Core game settings (timing, scoring, colors)
  - `DIFFICULTY_CONFIG`: Difficulty slider settings

### gameUtils.ts

- **Purpose**: Pure utility functions
- **Exports**:
  - `calculateIntervalFromDifficulty`: CPU timing calculation
  - `createGameState`: Initial game state creation
  - `createInitialState`: Initial component state
  - `getSavedDifficulty`/`saveDifficulty`: localStorage helpers

## Benefits of This Refactoring

1. **Separation of Concerns**: Each file has a single, well-defined responsibility
2. **Testability**: Pure functions and isolated hooks are easier to unit test
3. **Reusability**: Components and hooks can be reused in other game modes
4. **Maintainability**: Changes to specific functionality are isolated to relevant files
5. **Readability**: Main component is much shorter and focused on orchestration
6. **Type Safety**: Better TypeScript support with focused interfaces
7. **Performance**: Custom hooks allow for better optimization opportunities
8. **Modern CSS**: SCSS modules instead of `dangerouslySetInnerHTML`
9. **Customizable Animations**: SASS variables make it easy to tweak animation properties

## Improvements Over Original

### CSS/Styling Improvements

- **Replaced `dangerouslySetInnerHTML`** with SCSS modules for better security and maintainability
- **SASS variables** for easy customization of animation timing, colors, and z-index
- **CSS Modules** prevent style conflicts and provide better encapsulation
- **Type-safe CSS classes** with TypeScript support for CSS modules

### Code Organization

- **Eliminated inline styles** in favor of proper CSS classes
- **Centralized animation configuration** in SASS variables
- **Cleaner component code** with just className assignments

## Usage

The component maintains the same external API, so no changes are needed in parent components:

```tsx
import Solo from './components/Solo'

// Usage remains the same
;<Solo />
```

All internal complexity is now properly organized and abstracted away.
