// Script to calculate optimal difficulty levels for target CPU performance times

// Current CPU performance data (average attempts for different set counts)
const CPU_PERFORMANCE_DATA = [
  { setsOnBoard: 1, averageAttempts: 21.85 },
  { setsOnBoard: 2, averageAttempts: 10.25 },
  { setsOnBoard: 3, averageAttempts: 7.19 },
  { setsOnBoard: 4, averageAttempts: 5.43 },
  { setsOnBoard: 5, averageAttempts: 4.5 },
  { setsOnBoard: 6, averageAttempts: 3.51 },
]

// Current formula: cpuTurnInterval = 24000 / (5 * difficulty)
// We need to reverse this: difficulty = 24000 / (5 * cpuTurnInterval)
// And: cpuTurnInterval = targetTimeSeconds * 1000 / averageAttempts

const calculateOptimalDifficulty = (targetTimeSeconds, assumedSetsOnBoard = 3) => {
  const performanceData = CPU_PERFORMANCE_DATA.find((d) => d.setsOnBoard === assumedSetsOnBoard)
  const averageAttempts = performanceData.averageAttempts

  // Calculate required turn interval to achieve target time
  const requiredTurnIntervalMs = (targetTimeSeconds * 1000) / averageAttempts

  // Calculate difficulty that would produce this turn interval
  const optimalDifficulty = 24000 / (5 * requiredTurnIntervalMs)

  return {
    targetTime: targetTimeSeconds,
    setsOnBoard: assumedSetsOnBoard,
    averageAttempts: averageAttempts,
    requiredTurnInterval: requiredTurnIntervalMs / 1000,
    optimalDifficulty: optimalDifficulty,
    roundedDifficulty: Math.round(optimalDifficulty * 10) / 10, // Round to 1 decimal
  }
}

console.log('🎯 Optimal Difficulty Calculation for Target Times')
console.log('================================================')

// Your target times: 30s, 25s, 20s, 15s, 10s
const targetTimes = [30, 25, 20, 15, 10, 8, 6, 4]

targetTimes.forEach((targetTime) => {
  const optimal = calculateOptimalDifficulty(targetTime)
  console.log(
    `Target: ${targetTime}s → Difficulty: ${
      optimal.roundedDifficulty
    } (turn every ${optimal.requiredTurnInterval.toFixed(2)}s)`,
  )
})

console.log('\n📊 Proposed New Difficulty Scale:')
console.log('================================')

// Create a better difficulty scale
const proposedDifficulties = [
  { level: 1, difficulty: 1.1, targetTime: 30 },
  { level: 2, difficulty: 1.4, targetTime: 25 },
  { level: 3, difficulty: 1.7, targetTime: 20 },
  { level: 4, difficulty: 2.3, targetTime: 15 },
  { level: 5, difficulty: 3.3, targetTime: 10 },
  { level: 6, difficulty: 4.0, targetTime: 8 },
  { level: 7, difficulty: 6.0, targetTime: 6 },
  { level: 8, difficulty: 8.0, targetTime: 4 },
]

proposedDifficulties.forEach(({ level, difficulty, targetTime }) => {
  const actualPerformance = calculateActualPerformance(difficulty)
  console.log(
    `Level ${level}: Difficulty ${difficulty} → ~${actualPerformance.actualTime}s (target: ${targetTime}s)`,
  )
})

function calculateActualPerformance(difficulty, assumedSetsOnBoard = 3) {
  const performanceData = CPU_PERFORMANCE_DATA.find((d) => d.setsOnBoard === assumedSetsOnBoard)
  const cpuTurnInterval = 24000 / (5 * difficulty)
  const actualTimeMs = performanceData.averageAttempts * cpuTurnInterval
  return {
    actualTime: Math.round(actualTimeMs / 1000),
    turnInterval: cpuTurnInterval / 1000,
  }
}

console.log('\n⚙️ Implementation Requirements:')
console.log('==============================')
console.log('1. Update calculateIntervalFromDifficulty() to use non-linear scaling')
console.log('2. Allow decimal difficulty values (1.0 - 8.0)')
console.log('3. Update UI to show decimal difficulties or map to clean integers')
console.log('4. Test the new curve feels more natural to users')

console.log('\n🎮 Benefits of New Scale:')
console.log('========================')
console.log('- Much finer control at easier difficulties (30s → 25s → 20s)')
console.log('- More reasonable progression for beginners')
console.log('- Still provides challenge at higher levels')
console.log('- Smoother learning curve overall')
