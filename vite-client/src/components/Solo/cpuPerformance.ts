// CPU Performance Analysis Data
// Generated from cpu-analysis.js simulation results

export interface CPUPerformanceData {
  setsOnBoard: number
  averageAttempts: number
  medianAttempts: number
  percentiles: {
    p25: number
    p75: number
    p90: number
  }
  range: {
    min: number
    max: number
  }
}

// Results from 1000 trial simulations for each scenario
export const CPU_PERFORMANCE_DATA: CPUPerformanceData[] = [
  {
    setsOnBoard: 1,
    averageAttempts: 21.85,
    medianAttempts: 16,
    percentiles: { p25: 7, p75: 30, p90: 50 },
    range: { min: 1, max: 136 },
  },
  {
    setsOnBoard: 2,
    averageAttempts: 10.25,
    medianAttempts: 7,
    percentiles: { p25: 3, p75: 14, p90: 23 },
    range: { min: 1, max: 72 },
  },
  {
    setsOnBoard: 3,
    averageAttempts: 7.19,
    medianAttempts: 5,
    percentiles: { p25: 2, p75: 10, p90: 16 },
    range: { min: 1, max: 54 },
  },
  {
    setsOnBoard: 4,
    averageAttempts: 5.43,
    medianAttempts: 4,
    percentiles: { p25: 2, p75: 8, p90: 12 },
    range: { min: 1, max: 35 },
  },
  {
    setsOnBoard: 5,
    averageAttempts: 4.5,
    medianAttempts: 3,
    percentiles: { p25: 2, p75: 6, p90: 9 },
    range: { min: 1, max: 25 },
  },
  {
    setsOnBoard: 6,
    averageAttempts: 3.51,
    medianAttempts: 3,
    percentiles: { p25: 1, p75: 5, p90: 7 },
    range: { min: 1, max: 21 },
  },
]

/**
 * Get CPU performance data for a given number of sets on board
 * Uses interpolation for values not in our dataset
 */
export const getCPUPerformanceForSets = (setsOnBoard: number): CPUPerformanceData => {
  // Clamp to our data range
  if (setsOnBoard <= 1) {
    return CPU_PERFORMANCE_DATA[0]
  }
  if (setsOnBoard >= 6) {
    return CPU_PERFORMANCE_DATA[5]
  }

  // Find exact match
  const exactMatch = CPU_PERFORMANCE_DATA.find((data) => data.setsOnBoard === setsOnBoard)
  if (exactMatch) {
    return exactMatch
  }

  // Linear interpolation between closest values
  const lowerIndex = Math.floor(setsOnBoard) - 1
  const upperIndex = Math.ceil(setsOnBoard) - 1
  const lower = CPU_PERFORMANCE_DATA[lowerIndex]
  const upper = CPU_PERFORMANCE_DATA[upperIndex]

  if (!lower || !upper) {
    return CPU_PERFORMANCE_DATA[2] // fallback to 3 sets
  }

  const weight = setsOnBoard - lower.setsOnBoard

  return {
    setsOnBoard,
    averageAttempts:
      lower.averageAttempts + weight * (upper.averageAttempts - lower.averageAttempts),
    medianAttempts: Math.round(
      lower.medianAttempts + weight * (upper.medianAttempts - lower.medianAttempts),
    ),
    percentiles: {
      p25: Math.round(
        lower.percentiles.p25 + weight * (upper.percentiles.p25 - lower.percentiles.p25),
      ),
      p75: Math.round(
        lower.percentiles.p75 + weight * (upper.percentiles.p75 - lower.percentiles.p75),
      ),
      p90: Math.round(
        lower.percentiles.p90 + weight * (upper.percentiles.p90 - lower.percentiles.p90),
      ),
    },
    range: {
      min: Math.round(lower.range.min + weight * (upper.range.min - lower.range.min)),
      max: Math.round(lower.range.max + weight * (upper.range.max - lower.range.max)),
    },
  }
}

/**
 * Calculate expected CPU performance time based on difficulty and typical board conditions
 * @param difficulty - Difficulty level (1-8)
 * @param assumedSetsOnBoard - Typical number of sets on board (default: 3)
 * @returns Object with timing information
 */
export const calculateCPUPerformanceTime = (
  difficulty: number,
  assumedSetsOnBoard: number = 3,
) => {
  // New improved difficulty mapping for better progression
  const difficultyMap: { [key: number]: number } = {
    1: 1.1, // ~30s
    2: 1.4, // ~25s
    3: 1.7, // ~20s
    4: 2.3, // ~15s
    5: 3.3, // ~10s
    6: 4.0, // ~8s
    7: 6.0, // ~6s
    8: 8.0, // ~4s
  }

  const actualDifficulty = difficultyMap[difficulty] || difficultyMap[2]
  const cpuTurnInterval = 24000 / (5 * actualDifficulty) // in milliseconds

  // Get performance data for assumed number of sets
  const performanceData = getCPUPerformanceForSets(assumedSetsOnBoard)

  // Calculate expected times
  const averageTimeMs = performanceData.averageAttempts * cpuTurnInterval
  const medianTimeMs = performanceData.medianAttempts * cpuTurnInterval
  const typicalRangeMs = {
    fast: performanceData.percentiles.p25 * cpuTurnInterval,
    slow: performanceData.percentiles.p75 * cpuTurnInterval,
  }

  return {
    cpuTurnInterval,
    averageAttempts: performanceData.averageAttempts,
    medianAttempts: performanceData.medianAttempts,
    averageTimeSeconds: Math.round(averageTimeMs / 1000),
    medianTimeSeconds: Math.round(medianTimeMs / 1000),
    typicalRangeSeconds: {
      fast: Math.round(typicalRangeMs.fast / 1000),
      slow: Math.round(typicalRangeMs.slow / 1000),
    },
    performanceData,
  }
}

/**
 * Format time in seconds to a human-readable string
 */
export const formatTimeString = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) {
    return `${minutes}m`
  }
  return `${minutes}m ${remainingSeconds}s`
}

/**
 * Calculate dynamic CPU turn interval based on difficulty and current board state
 * This adjusts the CPU timing to be more reasonable - faster when few sets, slower when many sets
 * @param difficulty - Difficulty level (1-8)
 * @param setsOnBoard - Current number of sets on the board
 * @returns CPU turn interval in milliseconds
 */
export const calculateDynamicCPUInterval = (difficulty: number, setsOnBoard: number): number => {
  // Base difficulty mapping (same as existing system)
  const difficultyMap: { [key: number]: number } = {
    1: 1.1, // ~30s baseline
    2: 1.4, // ~25s baseline
    3: 1.7, // ~20s baseline
    4: 2.3, // ~15s baseline
    5: 3.3, // ~10s baseline
    6: 4.0, // ~8s baseline
    7: 6.0, // ~6s baseline
    8: 8.0, // ~4s baseline
  }

  const actualDifficulty = difficultyMap[difficulty] || difficultyMap[2]

  // Get performance data for current board state
  const performanceData = getCPUPerformanceForSets(setsOnBoard)

  // Target timing: Reduce variance in challenge level while preserving natural difficulty
  // When there are fewer sets, CPU should attempt FASTER (but still somewhat slower overall)
  // When there are more sets, CPU should attempt SLOWER (but still somewhat faster overall)
  // Dampening prevents over-correction that would make all scenarios identical

  // Use the baseline difficulty but adjust based on set density
  // For reference: 3 sets is our baseline (7.19 avg attempts)
  const baselineAttempts = 7.19
  const currentAttempts = performanceData.averageAttempts

  // Adjustment factor with dampening:
  // - More attempts needed (fewer sets) → currentAttempts > baseline → factor > 1 → higher difficulty → FASTER intervals
  // - Fewer attempts needed (more sets) → currentAttempts < baseline → factor < 1 → lower difficulty → SLOWER intervals
  // - Dampening prevents over-correction, maintaining some natural difficulty variation
  const rawAdjustmentFactor = currentAttempts / baselineAttempts

  // Apply dampening: move the factor toward 1.0 to reduce the adjustment strength
  // Dampening of 0.5 means we apply 50% of the calculated adjustment
  const dampening = 0.6 // Adjust 60% of the way, leave 40% natural variation
  const adjustmentFactor = 1 + (rawAdjustmentFactor - 1) * dampening

  // Apply the adjustment to the difficulty
  const adjustedDifficulty = actualDifficulty * adjustmentFactor

  // Calculate interval using adjusted difficulty
  const interval = 24000 / (5 * adjustedDifficulty)

  // Add some bounds to prevent extreme values
  const minInterval = 500 // Never faster than 0.5 seconds per attempt
  const maxInterval = 8000 // Never slower than 8 seconds per attempt

  return Math.max(minInterval, Math.min(maxInterval, interval))
}
