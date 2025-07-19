// Test the new difficulty curve

// New difficulty mapping
const difficultyMap = {
  1: 1.1, // ~30s
  2: 1.4, // ~25s
  3: 1.7, // ~20s
  4: 2.3, // ~15s
  5: 3.3, // ~10s
  6: 4.0, // ~8s
  7: 6.0, // ~6s
  8: 8.0, // ~4s
}

const CPU_PERFORMANCE_DATA = [{ setsOnBoard: 3, averageAttempts: 7.19 }]

const calculateCPUPerformanceTime = (difficulty) => {
  const actualDifficulty = difficultyMap[difficulty]
  const cpuTurnInterval = 24000 / (5 * actualDifficulty)
  const performanceData = CPU_PERFORMANCE_DATA[0]
  const averageTimeMs = performanceData.averageAttempts * cpuTurnInterval

  return {
    actualDifficulty,
    cpuTurnInterval: cpuTurnInterval / 1000,
    averageTimeSeconds: Math.round(averageTimeMs / 1000),
  }
}

console.log('🆕 New Difficulty Curve Test Results')
console.log('===================================')

for (let level = 1; level <= 8; level++) {
  const result = calculateCPUPerformanceTime(level)
  console.log(
    `Level ${level}: ${result.averageTimeSeconds}s (${result.cpuTurnInterval.toFixed(
      2,
    )}s per attempt)`,
  )
}

console.log('\n📈 Improvement Analysis:')
console.log('=======================')
console.log('OLD CURVE: 35s → 17s → 12s → 9s → 7s → 6s → 5s → 4s')
console.log('NEW CURVE: 31s → 25s → 20s → 15s → 10s → 9s → 6s → 4s')
console.log('')
console.log('✅ Much better progression at beginner levels!')
console.log('✅ Smooth 5-second decrements: 30→25→20→15→10')
console.log('✅ Still challenging at higher levels')
