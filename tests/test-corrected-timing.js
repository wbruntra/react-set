// Quick test to verify the corrected dynamic timing logic

import {
  calculateDynamicCPUInterval,
  getCPUPerformanceForSets,
} from '../vite-client/src/components/Solo/cpuPerformance.ts'

console.log('🔧 Testing CORRECTED Dynamic CPU Timing')
console.log('======================================')

const difficulty = 2 // Test with difficulty 2

console.log('\nExpected behavior:')
console.log('• 1-2 sets (hard to find): CPU should attempt FASTER (shorter intervals)')
console.log('• 4-6 sets (easy to find): CPU should attempt SLOWER (longer intervals)')
console.log('• 3 sets: baseline timing')

console.log('\nTesting with Difficulty 2:')
console.log('Sets | Attempts | Interval | Logic Check')
console.log('-----|----------|----------|------------')

for (let sets = 1; sets <= 6; sets++) {
  const perfData = getCPUPerformanceForSets(sets)
  const interval = calculateDynamicCPUInterval(difficulty, sets)
  const totalTime = Math.round((perfData.averageAttempts * interval) / 1000)

  let check = ''
  if (sets <= 2) {
    check = interval < 4000 ? '✅ FASTER (good)' : '❌ TOO SLOW'
  } else if (sets >= 4) {
    check = interval > 4000 ? '✅ SLOWER (good)' : '❌ TOO FAST'
  } else {
    check = '📍 baseline'
  }

  console.log(
    `  ${sets}  |   ${perfData.averageAttempts.toFixed(1)}   |  ${(interval / 1000).toFixed(1)}s  | ${check}`,
  )
}

console.log('\n🎯 This should now show:')
console.log('• Sets 1-2: Intervals around 1-3 seconds (FAST)')
console.log('• Set 3: Baseline interval around 4-5 seconds')
console.log('• Sets 4-6: Intervals around 6-8 seconds (SLOW)')
