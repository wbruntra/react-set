export {
  range,
  countSets,
  makeDeck,
  isSet,
  nameThird,
  cardToggle,
  reshuffle,
  getRandomSet,
  getBoardStartingWithSet,
  removeSelected,
  serializeGame,
} from './helpers'

export { GAME_CONFIG, DIFFICULTY_CONFIG, TRAINING_CONFIG } from './game/constants'

export {
  CPU_PERFORMANCE_DATA,
  getCPUPerformanceForSets,
  calculateCPUPerformanceTime,
  formatTimeString,
  calculateDynamicCPUInterval,
  calculateIntervalFromDifficulty,
  type CPUPerformanceData,
} from './game/cpuPerformance'

export {
  createInitialSoloState,
  dealNewGame,
  updatePlayerScore,
  processFoundSet,
  handleCardClick,
  handleRedeal,
  handleStartGame,
  handleDifficultyChange,
  resetGame,
  handleDeclarationExpired,
  handleCpuFoundSet,
  findCpuSet,
  type SoloPlayer,
  type SoloPlayers,
  type SoloAction,
  type SoloGameState,
} from './game/solo'

export {
  BLANK_CARD,
  boardWithoutBlanks,
  createInitialTrainingState,
  generateTrainingBoard,
  findValidSet,
  calculateTurnTime,
  reduceCardClick,
  reduceTimeout,
  nextBoard,
  startTraining,
  resetTraining,
  initTraining,
  type TrainingMode,
  type TrainingGameState,
  type TrainingClickOutcome,
} from './game/training'

export {
  createMultiGame,
  applyJoin,
  applyFound,
  markPoint,
  applyPenalty,
  removeSet,
  multiCardClick,
  redealMulti,
  cardsOnBoard,
  dealNewBoard,
  guestCardClick,
  mergeIncomingState,
  resetLocalSelected,
  type MultiPlayer,
  type MultiPlayers,
  type MultiGameState,
  type GameAction,
} from './game/multiplayer'
