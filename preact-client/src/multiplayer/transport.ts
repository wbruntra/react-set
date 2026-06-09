import type { GameAction, MultiGameState } from '@react-set/common'

export type Unsubscribe = () => void
export type ActionId = string

export interface GameSummary {
  id: string
  gameTitle: string
  players: Record<string, { name: string; host: boolean }>
}

export interface GameTransport {
  createGame(id: string, state: Partial<MultiGameState> & { creator_uid?: string }): Promise<void>
  updateState(id: string, partial: Partial<MultiGameState>): Promise<void>
  subscribeState(id: string, cb: (state: MultiGameState) => void): Unsubscribe
  sendAction(id: string, action: GameAction): Promise<ActionId>
  subscribeActions(id: string, cb: (action: GameAction, actionId: string) => void): Unsubscribe
  consumeAction(id: string, actionId: string): Promise<void>
  findResumable(ownerUid: string): Promise<GameSummary[]>
  deleteGame(id: string): Promise<void>
  listJoinableGames(): Promise<GameSummary[]>
}
