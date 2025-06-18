// Test script to show CPU performance for different difficulty levels

// CPU Performance data (simplified for demo)
const CPU_PERFORMANCE_DATA = [
  { setsOnBoard: 1, averageAttempts: 21.85 },
  { setsOnBoard: 2, averageAttempts: 10.25 },
  { setsOnBoard: 3, averageAttempts: 7.19 },
  { setsOnBoard: 4, averageAttempts: 5.43 },
  { setsOnBoard: 5, averageAttempts: 4.5 },
  { setsOnBoard: 6, averageAttempts: 3.51 },
]

const calculateCPUPerformanceTime = (difficulty, assumedSetsOnBoard = 3) => {
  const cpuTurnInterval = 24000 / (5 * difficulty)
  const performanceData =
    CPU_PERFORMANCE_DATA.find((d) => d.setsOnBoard === assumedSetsOnBoard) ||
    CPU_PERFORMANCE_DATA[2]
  const averageTimeMs = performanceData.averageAttempts * cpuTurnInterval

  return {
    cpuTurnInterval,
    averageAttempts: performanceData.averageAttempts,
    averageTimeSeconds: Math.round(averageTimeMs / 1000),
  }
}

const formatTimeString = (seconds) => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) return `${minutes}m`
  return `${minutes}m ${remainingSeconds}s`
}

console.log('CPU Performance Preview for Different Difficulty Levels')
console.log('====================================================')

for (let difficulty = 1; difficulty <= 8; difficulty++) {
  const performance = calculateCPUPerformanceTime(difficulty)
  const { averageTimeSeconds, cpuTurnInterval, averageAttempts } = performance

  console.log(`\nDifficulty ${difficulty}:`)
  console.log(`  Turn Interval: ${(cpuTurnInterval / 1000).toFixed(1)}s per attempt`)
  console.log(`  Average Attempts: ${averageAttempts.toFixed(1)}`)
  console.log(`  Average Time to Find Set: ${formatTimeString(averageTimeSeconds)}`)

  // Difficulty description
  let desc = 'Very Slow'
  let badge = '🐢'
  if (averageTimeSeconds <= 10) {
    desc = 'Very Fast'
    badge = '🚀'
  } else if (averageTimeSeconds <= 20) {
    desc = 'Fast'
    badge = '⚡'
  } else if (averageTimeSeconds <= 40) {
    desc = 'Moderate'
    badge = '🎯'
  } else if (averageTimeSeconds <= 60) {
    desc = 'Slow'
    badge = '🐌'
  }

  console.log(`  Player Experience: ${desc} ${badge}`)
}

console.log('\n' + '='.repeat(60))
console.log('This data will be displayed to users when they adjust the difficulty slider!')
console.log('Users can see exactly how challenging their chosen difficulty will be.')
console.log('='.repeat(60))
