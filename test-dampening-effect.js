// Test script to demonstrate the dampening effect on dynamic CPU timing

import {
  calculateDynamicCPUInterval,
  getCPUPerformanceForSets,
} from './vite-client/src/components/Solo/cpuPerformance.ts'

console.log('🎯 Dynamic CPU Timing with Dampening Factor')
console.log('===========================================')

const difficulty = 3

console.log('\nComparing different dampening levels:')
console.log('• No dampening (100%): All times become equal → too artificial')
console.log('• Full dampening (0%): No adjustment → original problem')
console.log('• Partial dampening (60%): Balanced approach → natural + fair')

console.log('\nWith 60% Dampening (Current Implementation):')
console.log('Sets | Attempts | Interval | Total Time | vs Baseline')
console.log('-----|----------|----------|------------|------------')

const baselineTime = (() => {
  const perfData = getCPUPerformanceForSets(3)
  const interval = calculateDynamicCPUInterval(difficulty, 3)
  return Math.round((perfData.averageAttempts * interval) / 1000)
})()

for (let sets = 1; sets <= 6; sets++) {
  const perfData = getCPUPerformanceForSets(sets)
  const interval = calculateDynamicCPUInterval(difficulty, sets)
  const totalTime = Math.round((perfData.averageAttempts * interval) / 1000)

  const diff = totalTime - baselineTime
  const diffStr = diff > 0 ? `+${diff}s` : diff < 0 ? `${diff}s` : 'same'

  console.log(
    `  ${sets}  |   ${perfData.averageAttempts.toFixed(1)}   |  ${(interval / 1000).toFixed(1)}s  |    ${totalTime}s     | ${diffStr}`,
  )
}

console.log('\nExpected Results with Dampening:')
console.log('• 1 set: Still harder (longer total time) but not impossibly so')
console.log('• 6 sets: Still easier (shorter total time) but not trivially so')
console.log('• Natural difficulty curve preserved but flattened')
console.log('• More balanced gameplay without removing all challenge variation')

console.log('\nDampening Factor Analysis:')
console.log('• 0.0 = No adjustment (original system)')
console.log('• 0.6 = 60% adjustment (current - good balance)')
console.log('• 1.0 = Full adjustment (all times equal)')
console.log('\n60% dampening provides good balance between fairness and natural variation!')
