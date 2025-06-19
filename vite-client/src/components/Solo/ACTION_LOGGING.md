# Action Logging System

This document describes the action logging system implemented for the Solo (vs CPU) game mode.

## Overview

The system tracks detailed game actions during Solo games against the computer, recording timing and performance metrics for each set found by either the human player or the CPU.

## Data Format

Each action is logged as a compact array:

```javascript
;[setsOnBoard, timeInSeconds, who]
```

Where:

- `setsOnBoard` (number): Number of valid sets present on the board when the action occurred
- `timeInSeconds` (number): Time taken to find the set (from declaration to completion), rounded to 1 decimal place
- `who` (string): Either `'h'` for human player or `'c'` for CPU

## Example Data

```javascript
{
  "actions": [
    [4, 9.8, 'h'],  // 4 sets on board, 9.8 seconds, human found it
    [3, 15.2, 'c'], // 3 sets on board, 15.2 seconds, computer found it
    [5, 7.1, 'h'],  // 5 sets on board, 7.1 seconds, human found it
    [2, 22.5, 'c']  // 2 sets on board, 22.5 seconds, computer found it
  ]
}
```

## Implementation Details

### Frontend (React)

The action logging is implemented in `useSoloGame.ts`:

1. **Action Tracking**: Each time a set is found, the system records:

   - Current number of sets on the board using `countSets()`
   - Time elapsed from declaration to completion
   - Who found the set (human or CPU)

2. **Timing Measurement**:

   - Declaration time is recorded when a player declares (starts selecting)
   - Completion time is when the set is confirmed as valid
   - Time difference is calculated and stored in seconds

3. **Data Submission**: When a game ends, the complete action log is sent to the backend along with other game statistics.

### Backend (Node.js/Express)

The `/api/game` endpoint accepts a `data` parameter and stores it as JSON in the `games` table:

```javascript
{
  uid,
  total_time,
  player_won,
  difficulty_level,
  winning_score,
  data: gameData  // Contains the actions array
}
```

### Database Schema

The `games` table includes a `data` column of type TEXT that stores the JSON-stringified action data.

## Usage Analytics

This data enables analysis of:

- Player performance vs. CPU at different difficulty levels
- Correlation between number of sets on board and find time
- Learning curves over multiple games
- Optimal difficulty balancing for CPU opponents

## Future Enhancements

Potential extensions to the logging system:

- Track card selection sequences
- Record board states at each action
- Log failed declaration attempts
- Track pause/resume events
