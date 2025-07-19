// Test script to verify action logging functionality
const axios = require('axios')

// Simulate a game completion with action data
const testGameCompletion = async () => {
  const testData = {
    uid: 'test-user-123',
    total_time: 120, // 2 minutes
    player_won: 1, // human won
    difficulty_level: 5,
    winning_score: 12,
    data: {
      actions: [
        [4, 9.8, 'h'], // 4 sets on board, 9.8 seconds, human found it
        [3, 15.2, 'c'], // 3 sets on board, 15.2 seconds, computer found it
        [5, 7.1, 'h'], // 5 sets on board, 7.1 seconds, human found it
        [2, 22.5, 'c'], // 2 sets on board, 22.5 seconds, computer found it
      ],
    },
  }

  try {
    const response = await axios.post('http://localhost:3000/api/game', testData)
    console.log('Test game data successfully submitted:', response.status)

    // Verify data was stored correctly
    const games = await axios.get('http://localhost:3000/games')
    console.log('Games stored:', games.data)
  } catch (error) {
    console.error('Error submitting test data:', error.message)
  }
}

testGameCompletion()
