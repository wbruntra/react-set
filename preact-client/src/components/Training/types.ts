// Training types now live in the shared package; re-exported here so existing
// `./types` imports keep working.
export type { TrainingMode, TrainingGameState as GameState } from '@react-set/common'
