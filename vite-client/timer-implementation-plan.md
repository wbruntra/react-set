# React Timer Management: Best Practices

## Problem Statement

The original implementation in `Solo.tsx` used multiple refs (`cpuTimerRef`, `cpuAnimationRef`, `undeclareIdRef`) and state variables (`cpuTimer`, `cpuAnimation`) to track timers. This approach is error-prone due to:

1. **Stale Closure Problem**: Timers capturing outdated state values
2. **Complex Timer Lifecycle**: Timers being set and cleared in multiple places
3. **Difficult Debugging**: Hard to track when timers are running
4. **Memory Leaks**: Risk of timers not being properly cleaned up
5. **Double-Effect Problems**: The same action running multiple times due to overlapping timers

## Core Principles of the New Approach

### 1. Declarative vs Imperative Timer Management

**Old (Imperative)**: Manually set timers, track IDs, clear them when needed

```javascript
timerRef.current = setTimeout(doSomething, 1000)
// later...
if (timerRef.current) clearTimeout(timerRef.current)
```

**New (Declarative)**: Describe _when_ timers should be running based on state

```javascript
useEffect(() => {
  const timer = setTimeout(doSomething, 1000)
  return () => clearTimeout(timer)
}, [relevantState])
```

### 2. React's Dependency System for Automatic Cleanup

React's `useEffect` hook automatically:

- Runs the effect when dependencies change
- Cleans up the previous effect (including timers) before running again
- Cleans up on component unmount

### 3. Functional Updates to Prevent Stale State

Always use the function form of `setState` in timers:

```javascript
// Bad: May use stale state from closure
setTimeout(() => setState({ ...state, count: state.count + 1 }), 1000)

// Good: Always uses current state
setTimeout(
  () =>
    setState((prevState) => ({
      ...prevState,
      count: prevState.count + 1,
    })),
  1000,
)
```

## The New Timer Architecture

### 1. Separation of Concerns

Each timing-related behavior is isolated in its own effect:

- **CPU Turn Timer**: When the CPU looks for a set
- **CPU Animation**: How the CPU reveals its card choices
- **Set Found Processing**: What happens after a set is found
- **Declaration Expiration**: Handling time limits for player declarations

### 2. Clear Dependencies

Each effect has explicit dependencies that determine when it starts/stops:

```javascript
// CPU Turn Timer only runs when:
// 1. Game is started
// 2. No game over
// 3. No active declarer
// 4. No set found
useEffect(() => {
  // timer logic
  return () => cleanup()
}, [gameStarted, gameOver, declarer, setFound, cpuTurnInterval])
```

### 3. Centralized State Transitions

Instead of state updates scattered across multiple functions:

- Each effect updates state in a focused, predictable way
- Shared behaviors are extracted into helper functions
- State changes trigger appropriate effects automatically

## Implementation Guide

### Step 1: Define Effect Dependencies

Identify which state triggers each timing behavior:

- Game state transitions: `gameStarted`, `gameOver`
- Turn management: `declarer`, `setFound`
- Timer configuration: `cpuTurnInterval`

### Step 2: Create Isolated Effects

For each timing concern:

1. Create a dedicated `useEffect` hook
2. Set up the relevant timer
3. Include cleanup function to remove timer
4. Specify correct dependencies

### Step 3: Use Functional State Updates

Always update state using the callback form:

```javascript
setState((prevState) => {
  // Calculate new state based on prevState
  return newState
})
```

### Step 4: Extract Reusable Logic

Common patterns like processing a completed set are extracted into reusable functions.

## Benefits of the New System

1. **Predictability**: Clear relationship between state and timer behavior
2. **Self-Cleaning**: No manual timer cleanup management
3. **No Stale Values**: Always using fresh state in timer callbacks
4. **Easier Debugging**: Isolated effects make issues easier to pinpoint
5. **Better Performance**: Timers only run when needed
6. **Simpler Code**: Less imperative code to understand and maintain

## Principles to Remember

1. **Let React manage side effects** - that's what `useEffect` is designed for
2. **Prefer declarative patterns** - describe what should happen based on state
3. **Always use functional updates** for state changes in asynchronous code
4. **Structure effects around state transitions** rather than around functions
5. **Clean up is important** - always return a cleanup function from effects

This approach aligns with React's philosophy of making UI a function of state, extending that principle to timer management as well.
