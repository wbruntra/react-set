// Benchmark script for countSets performance
// Compares current O(n^3) implementation vs optimized O(n^2) approach

const shuffle = (arr) => {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const sampleSize = (arr, n) => shuffle(arr).slice(0, n)

const range = (n) => [...Array(n).keys()]

const makeDeck = () => {
  const deck = []
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

const ALL_CARDS = makeDeck()
const CARD_TO_INDEX = new Map(ALL_CARDS.map((card, index) => [card, index]))
const THIRD_CARD_INDEX = ALL_CARDS.map((cardA) =>
  ALL_CARDS.map((cardB) => CARD_TO_INDEX.get(nameThird(cardA, cardB))),
)

// Current approach (O(n^3))
const countSetsCubic = (board, { returnWhenFound = false } = {}) => {
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

// Proposed optimized approach (O(n^2))
const countSetsQuadratic = (board, { returnWhenFound = false } = {}) => {
  let count = 0
  const boardIndexByCardIndex = new Int16Array(ALL_CARDS.length)
  boardIndexByCardIndex.fill(-1)
  const boardCardIndices = new Int16Array(board.length)

  for (let i = 0; i < board.length; i++) {
    const cardIndex = CARD_TO_INDEX.get(board[i])
    boardCardIndices[i] = cardIndex
    boardIndexByCardIndex[cardIndex] = i
  }

  for (let a = 0; a < board.length - 1; a++) {
    for (let b = a + 1; b < board.length; b++) {
      const neededCardIndex = THIRD_CARD_INDEX[boardCardIndices[a]][boardCardIndices[b]]
      const c = boardIndexByCardIndex[neededCardIndex]

      // c > b ensures each set is counted exactly once
      if (c > b) {
        count++
        if (returnWhenFound) {
          return count
        }
      }
    }
  }

  return count
}

const assertCorrectness = () => {
  const deck = makeDeck()
  const boardSizes = [12, 15, 18, 21]
  const samplesPerSize = 500

  console.log('Checking correctness across random boards...')

  for (const size of boardSizes) {
    for (let i = 0; i < samplesPerSize; i++) {
      const board = sampleSize(deck, size)
      const oldCount = countSetsCubic(board)
      const newCount = countSetsQuadratic(board)

      if (oldCount !== newCount) {
        throw new Error(
          `Mismatch at size=${size}, sample=${i}: cubic=${oldCount}, quadratic=${newCount}`,
        )
      }

      const oldFound = countSetsCubic(board, { returnWhenFound: true })
      const newFound = countSetsQuadratic(board, { returnWhenFound: true })
      if (oldFound !== newFound) {
        throw new Error(
          `Mismatch returnWhenFound at size=${size}, sample=${i}: cubic=${oldFound}, quadratic=${newFound}`,
        )
      }
    }
  }

  console.log('✅ Correctness check passed')
}

const benchmark = (fn, boards, loops) => {
  const started = process.hrtime.bigint()
  let checksum = 0

  for (let i = 0; i < loops; i++) {
    for (const board of boards) {
      checksum += fn(board)
    }
  }

  const ended = process.hrtime.bigint()
  const elapsedMs = Number(ended - started) / 1_000_000

  return {
    elapsedMs,
    checksum,
  }
}

const buildBoardPool = (boardSize, boardCount) => {
  const deck = makeDeck()
  const boards = []

  for (let i = 0; i < boardCount; i++) {
    boards.push(sampleSize(deck, boardSize))
  }

  return boards
}

const runBenchmarks = () => {
  const scenarios = [
    { boardSize: 12, boardCount: 300, loops: 15 },
    { boardSize: 15, boardCount: 250, loops: 12 },
    { boardSize: 18, boardCount: 220, loops: 10 },
    { boardSize: 21, boardCount: 180, loops: 8 },
    { boardSize: 27, boardCount: 140, loops: 6 },
    { boardSize: 36, boardCount: 100, loops: 5 },
  ]

  console.log('\nBenchmarking countSets implementations...')
  console.log('=========================================')

  for (const scenario of scenarios) {
    const { boardSize, boardCount, loops } = scenario
    const boards = buildBoardPool(boardSize, boardCount)

    const cubicResult = benchmark(countSetsCubic, boards, loops)
    const quadraticResult = benchmark(countSetsQuadratic, boards, loops)

    if (cubicResult.checksum !== quadraticResult.checksum) {
      throw new Error(
        `Checksum mismatch at boardSize=${boardSize}: cubic=${cubicResult.checksum}, quadratic=${quadraticResult.checksum}`,
      )
    }

    const speedup = cubicResult.elapsedMs / quadraticResult.elapsedMs
    const improvementPct = ((speedup - 1) * 100).toFixed(1)

    console.log(`\nBoard size ${boardSize}:`)
    console.log(`  Cubic      : ${cubicResult.elapsedMs.toFixed(2)} ms`)
    console.log(`  Quadratic  : ${quadraticResult.elapsedMs.toFixed(2)} ms`)
    console.log(`  Speedup    : ${speedup.toFixed(2)}x (${improvementPct}% faster)`)
  }
}

const main = () => {
  console.log('countSets Efficiency Benchmark')
  console.log('==============================')

  assertCorrectness()
  runBenchmarks()

  console.log(
    '\nDone. The quadratic version should be consistently faster, especially as board size grows.',
  )
}

if (require.main === module) {
  main()
}

module.exports = {
  countSetsCubic,
  countSetsQuadratic,
}
