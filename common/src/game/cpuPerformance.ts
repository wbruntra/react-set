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

export const getCPUPerformanceForSets = (setsOnBoard: number): CPUPerformanceData => {
  if (setsOnBoard <= 1) {
    return CPU_PERFORMANCE_DATA[0]
  }
  if (setsOnBoard >= 6) {
    return CPU_PERFORMANCE_DATA[5]
  }

  const exactMatch = CPU_PERFORMANCE_DATA.find((data) => data.setsOnBoard === setsOnBoard)
  if (exactMatch) {
    return exactMatch
  }

  const lowerIndex = Math.floor(setsOnBoard) - 1
  const upperIndex = Math.ceil(setsOnBoard) - 1
  const lower = CPU_PERFORMANCE_DATA[lowerIndex]
  const upper = CPU_PERFORMANCE_DATA[upperIndex]

  if (!lower || !upper) {
    return CPU_PERFORMANCE_DATA[2]
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

export const calculateCPUPerformanceTime = (
  difficulty: number,
  assumedSetsOnBoard: number = 3,
) => {
  const difficultyMap: { [key: number]: number } = {
    1: 1.1,
    2: 1.4,
    3: 1.7,
    4: 2.3,
    5: 3.3,
    6: 4.0,
    7: 6.0,
    8: 8.0,
  }

  const actualDifficulty = difficultyMap[difficulty] || difficultyMap[2]
  const cpuTurnInterval = 24000 / (5 * actualDifficulty)

  const performanceData = getCPUPerformanceForSets(assumedSetsOnBoard)

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

export const calculateDynamicCPUInterval = (difficulty: number, setsOnBoard: number): number => {
  const difficultyMap: { [key: number]: number } = {
    1: 1.1,
    2: 1.4,
    3: 1.7,
    4: 2.3,
    5: 3.3,
    6: 4.0,
    7: 6.0,
    8: 8.0,
  }

  const actualDifficulty = difficultyMap[difficulty] || difficultyMap[2]
  const performanceData = getCPUPerformanceForSets(setsOnBoard)
  const baselineAttempts = 7.19
  const currentAttempts = performanceData.averageAttempts

  const rawAdjustmentFactor = currentAttempts / baselineAttempts
  const dampening = 0.6
  const adjustmentFactor = 1 + (rawAdjustmentFactor - 1) * dampening

  const adjustedDifficulty = actualDifficulty * adjustmentFactor
  const interval = 24000 / (5 * adjustedDifficulty)

  const minInterval = 500
  const maxInterval = 8000

  return Math.max(minInterval, Math.min(maxInterval, interval))
}

export const calculateIntervalFromDifficulty = (difficulty: number): number => {
  const difficultyMap: { [key: number]: number } = {
    1: 1.1,
    2: 1.4,
    3: 1.7,
    4: 2.3,
    5: 3.3,
    6: 4.0,
    7: 6.0,
    8: 8.0,
  }

  const validDifficulty = Number.isNaN(difficulty) ? 2 : difficulty
  const actualDifficulty = difficultyMap[validDifficulty] || difficultyMap[2]
  return 24000 / (5 * actualDifficulty)
}
