// CPU Game Analysis Script
// This script simulates CPU gameplay to determine average attempts needed to find sets

const _ = require('lodash')

// Helper functions extracted from helpers.ts for Node.js compatibility
const range = (n) => [...Array(n).keys()]

const makeDeck = () => {
  let deck = []
  range(3).forEach((c) => {
    range(3).forEach((n) => {
      range(3).forEach((s) => {
        range(3).forEach((f) => {
          const card = '' + c + s + n + f
          deck.push(card)
        })
      })
    })
  })
  return deck
}

const isSet = (selected) => {
  if (selected.length !== 3) {
    return false
  }
  const [a, b, c] = selected
  for (let i = 0; i < 4; i++) {
    const sum = Number(a[i]) + Number(b[i]) + Number(c[i])
    if (sum % 3 !== 0) {
      return false
    }
  }
  return true
}

const nameThird = (a, b) => {
  let result = ''
  for (let i = 0; i < 4; i++) {
    if (a[i] === b[i]) {
      result = result + a[i]
    } else {
      const features = Number(a[i]) + Number(b[i])
      const missing = (3 - features).toString()
      result = result + missing
    }
  }
  return result.trim()
}

const countSets = (board, { debug = false, returnWhenFound = false } = {}) => {
  let count = 0
  let candidate = []
  for (let a = 0; a < board.length - 2; a++) {
    for (let b = a + 1; b < board.length - 1; b++) {
      for (let c = b + 1; c < board.length; c++) {
        candidate = [board[a], board[b], board[c]]
        if (isSet(candidate)) {
          count++
          if (returnWhenFound) {
            return count
          }
        }
      }
    }
  }
  return count
}

const reshuffle = ({ board = [], deck }, boardSize = 12, minimumSets = 1) => {
  let newDeck = _.shuffle([...board, ...deck])
  while (
    countSets(newDeck.slice(0, boardSize)) < minimumSets &&
    countSets(newDeck, { returnWhenFound: true }) > 0
  ) {
    newDeck = _.shuffle(newDeck)
  }
  return {
    deck: newDeck.slice(boardSize),
    board: newDeck.slice(0, boardSize),
  }
}

const simulateCPUTurn = (board) => {
  const boardSize = board.length
  let attempts = 0

  while (true) {
    attempts++

    // Randomly choose 2 different cards
    const indices = _.sampleSize(range(boardSize), 2)
    const [card1, card2] = [board[indices[0]], board[indices[1]]]

    // Calculate what the third card should be
    const thirdCard = nameThird(card1, card2)

    // Check if the third card is on the board (and different from the first two)
    if (board.includes(thirdCard) && thirdCard !== card1 && thirdCard !== card2) {
      return attempts
    }

    // Safety check to prevent infinite loops (shouldn't happen if board has sets)
    if (attempts > 10000) {
      console.warn('Safety limit reached - board might not have valid sets')
      return attempts
    }
  }
}

const generateBoardWithNSets = (targetSets, maxAttempts = 1000) => {
  let attempts = 0

  while (attempts < maxAttempts) {
    attempts++

    // Start with a shuffled deck
    let deck = _.shuffle(makeDeck())
    let board = deck.slice(0, 12)
    deck = deck.slice(12)

    const setsOnBoard = countSets(board)

    if (setsOnBoard === targetSets) {
      return { board, deck }
    }

    // If we have too few sets, try reshuffling
    if (setsOnBoard < targetSets) {
      const reshuffled = reshuffle({ board, deck }, 12, targetSets)
      const newSetsCount = countSets(reshuffled.board)
      if (newSetsCount === targetSets) {
        return reshuffled
      }
    }
  }

  // If we can't generate exact number, return closest we found
  console.warn(
    `Could not generate board with exactly ${targetSets} sets, using reshuffle fallback`,
  )
  let deck = _.shuffle(makeDeck())
  let board = deck.slice(0, 12)
  deck = deck.slice(12)
  return reshuffle({ board, deck }, 12, Math.max(1, targetSets))
}

const runSimulation = (targetSets, numTrials = 1000) => {
  console.log(`\nSimulating CPU performance with ${targetSets} set(s) on board...`)

  const attempts = []
  let successfulBoards = 0

  for (let trial = 0; trial < numTrials; trial++) {
    try {
      const { board } = generateBoardWithNSets(targetSets)
      const actualSets = countSets(board)

      if (actualSets > 0) {
        const cpuAttempts = simulateCPUTurn(board)
        attempts.push(cpuAttempts)
        successfulBoards++
      }

      // Progress indicator
      if ((trial + 1) % 100 === 0) {
        console.log(`  Progress: ${trial + 1}/${numTrials} trials completed`)
      }
    } catch (error) {
      console.warn(`Trial ${trial + 1} failed:`, error.message)
    }
  }

  if (attempts.length === 0) {
    console.log(`  No successful simulations for ${targetSets} sets`)
    return null
  }

  // Calculate statistics
  const avg = attempts.reduce((sum, val) => sum + val, 0) / attempts.length
  const min = Math.min(...attempts)
  const max = Math.max(...attempts)
  const median = attempts.sort((a, b) => a - b)[Math.floor(attempts.length / 2)]

  // Calculate percentiles
  const sorted = [...attempts].sort((a, b) => a - b)
  const p25 = sorted[Math.floor(sorted.length * 0.25)]
  const p75 = sorted[Math.floor(sorted.length * 0.75)]
  const p90 = sorted[Math.floor(sorted.length * 0.9)]

  console.log(`  Results for ${targetSets} set(s):`)
  console.log(`    Successful simulations: ${successfulBoards}/${numTrials}`)
  console.log(`    Average attempts: ${avg.toFixed(2)}`)
  console.log(`    Median attempts: ${median}`)
  console.log(`    Min attempts: ${min}`)
  console.log(`    Max attempts: ${max}`)
  console.log(`    25th percentile: ${p25}`)
  console.log(`    75th percentile: ${p75}`)
  console.log(`    90th percentile: ${p90}`)

  return {
    targetSets,
    successfulSimulations: successfulBoards,
    totalTrials: numTrials,
    average: parseFloat(avg.toFixed(2)),
    median,
    min,
    max,
    percentile25: p25,
    percentile75: p75,
    percentile90: p90,
    allAttempts: attempts,
  }
}

const main = () => {
  console.log('CPU Game Analysis - Set Finding Simulation')
  console.log('==========================================')

  const results = []
  const trialsPerScenario = 1000

  // Test scenarios: boards with 1, 2, 3, 4, 5+ sets
  for (let sets = 1; sets <= 6; sets++) {
    const result = runSimulation(sets, trialsPerScenario)
    if (result) {
      results.push(result)
    }
  }

  // Summary table
  console.log('\n\nSUMMARY TABLE')
  console.log('=============')
  console.log('Sets on Board | Avg Attempts | Median | 25th %ile | 75th %ile | 90th %ile')
  console.log('-------------|-------------|--------|-----------|-----------|----------')

  results.forEach((result) => {
    const { targetSets, average, median, percentile25, percentile75, percentile90 } = result
    console.log(
      `${targetSets.toString().padStart(12)} | ${average
        .toString()
        .padStart(11)} | ${median.toString().padStart(6)} | ${percentile25
        .toString()
        .padStart(9)} | ${percentile75
        .toString()
        .padStart(9)} | ${percentile90.toString().padStart(8)}`,
    )
  })

  // Practical insights
  console.log('\n\nPRACTICAL INSIGHTS')
  console.log('==================')

  results.forEach((result) => {
    const { targetSets, average } = result
    console.log(`With ${targetSets} set(s): CPU needs ~${Math.ceil(average)} attempts on average`)
  })

  // Save results to JSON file for use in the app
  const fs = require('fs')
  const outputData = {
    generatedAt: new Date().toISOString(),
    trialsPerScenario,
    results: results.map((r) => ({
      setsOnBoard: r.targetSets,
      averageAttempts: r.average,
      medianAttempts: r.median,
      percentiles: {
        p25: r.percentile25,
        p75: r.percentile75,
        p90: r.percentile90,
      },
      range: {
        min: r.min,
        max: r.max,
      },
    })),
  }

  fs.writeFileSync('cpu-analysis-results.json', JSON.stringify(outputData, null, 2))
  console.log('\nResults saved to cpu-analysis-results.json')
}

// Helper function to test the basic mechanics
const testBasicMechanics = () => {
  console.log('Testing basic mechanics...')

  // Test nameThird function
  const card1 = '0000'
  const card2 = '0011'
  const third = nameThird(card1, card2)
  console.log(`nameThird('${card1}', '${card2}') = '${third}'`)
  console.log(`Is [${card1}, ${card2}, ${third}] a set? ${isSet([card1, card2, third])}`)

  // Test with a known board
  const testBoard = [
    '0000',
    '0011',
    '0022',
    '1111',
    '1122',
    '1100',
    '2222',
    '2200',
    '2211',
    '0101',
    '0202',
    '1010',
  ]
  console.log(`Test board has ${countSets(testBoard)} sets`)

  // Simulate one CPU turn
  const attempts = simulateCPUTurn(testBoard)
  console.log(`CPU found a set in ${attempts} attempts`)

  console.log('Basic mechanics test complete.\n')
}

// Run the analysis
if (require.main === module) {
  testBasicMechanics()
  main()
}

module.exports = {
  simulateCPUTurn,
  generateBoardWithNSets,
  runSimulation,
}
