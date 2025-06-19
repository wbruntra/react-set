// Test script to demonstrate the new dynamic CPU timing system

import { calculateDynamicCPUInterval, calculateCPUPerformanceTime, getCPUPerformanceForSets } from './vite-client/src/components/Solo/cpuPerformance.ts'

console.log('🎮 Dynamic CPU Timing Analysis')
console.log('==============================')

console.log('\n📊 Comparing Static vs Dynamic Timing:')
console.log('Difficulty Level: 3 (Medium)')

const difficulty = 3

for (let sets = 1; sets <= 6; sets++) {
  const staticPerformance = calculateCPUPerformanceTime(difficulty, sets)
  const dynamicInterval = calculateDynamicCPUInterval(difficulty, sets)
  const performanceData = getCPUPerformanceForSets(sets)
  
  const staticTotalTime = staticPerformance.averageTimeSeconds
  const dynamicTotalTime = Math.round((performanceData.averageAttempts * dynamicInterval) / 1000)
  
  const difference = staticTotalTime - dynamicTotalTime
  const improvement = difference > 0 ? 'FASTER' : 'SLOWER'
  const arrow = difference > 0 ? '⬇️' : '⬆️'
  
  console.log(`\n${sets} sets: ${staticTotalTime}s → ${dynamicTotalTime}s (${Math.abs(difference)}s ${improvement}) ${arrow}`)
  console.log(`  Static interval: ${(staticPerformance.cpuTurnInterval / 1000).toFixed(1)}s per attempt`)
  console.log(`  Dynamic interval: ${(dynamicInterval / 1000).toFixed(1)}s per attempt`)
  console.log(`  Avg attempts needed: ${performanceData.averageAttempts.toFixed(1)}`)
}

console.log('\n🎯 Key Improvements:')
console.log('• 1-2 sets (hard to find): CPU attempts faster → more reasonable challenge')
console.log('• 4-6 sets (easy to find): CPU attempts slower → prevents being too easy')
console.log('• 3 sets (baseline): Timing stays roughly the same')

console.log('\n🔬 Testing All Difficulty Levels with Dynamic Timing:')
console.log('===================================================')

for (let diff = 1; diff <= 8; diff++) {
  console.log(`\nDifficulty ${diff}:`)
  console.log('Sets | Static | Dynamic | Change')
  console.log('----|-------|--------|-------')
  
  for (let sets = 1; sets <= 6; sets++) {
    const staticPerf = calculateCPUPerformanceTime(diff, sets)
    const dynamicInterval = calculateDynamicCPUInterval(diff, sets)
    const perfData = getCPUPerformanceForSets(sets)
    
    const staticTime = staticPerf.averageTimeSeconds
    const dynamicTime = Math.round((perfData.averageAttempts * dynamicInterval) / 1000)
    const change = staticTime - dynamicTime
    const changeStr = change > 0 ? `-${change}s` : change < 0 ? `+${Math.abs(change)}s` : '0s'
    
    console.log(`  ${sets}  |  ${staticTime.toString().padStart(2)}s  |   ${dynamicTime.toString().padStart(2)}s   | ${changeStr}`)
  }
}

console.log('\n✨ The dynamic system creates more consistent challenge!')
console.log('Players will experience similar difficulty regardless of board state.')
