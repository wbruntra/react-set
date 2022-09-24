const _ = require('lodash')

const getRandomSet = (common_traits = null) => {
  if (!common_traits) {
    const deck = _.shuffle(makeDeck())
    let board = [...deck.slice(0, 2)]
    const third = nameThird(board[0], board[1])
    return [board[0], board[1], third]
  }

  const result = ['', '', '']
  let common = [false, false, false, false]
  const common_indices = _.sampleSize(_.range(4), common_traits)
  console.log(common_indices)
  common_indices.forEach((i) => {
    common[i] = Math.floor(Math.random() * 3).toString()
  })
  console.log(common)
  common.forEach((c) => {
    const potentialOrder = _.shuffle(['0', '1', '2'])
    for (let j = 0; j < 3; j++) {
      if (c === false) {
        result[j] = result[j] + potentialOrder[j].toString()
      } else {
        result[j] = result[j] + c
      }
    }
  })
  console.log(result)
  return result
}

for (let i = 0; i < 10; i++) {
  // getRandomSet(1)
  // getRandomSet(2)
  getRandomSet(3)
}
