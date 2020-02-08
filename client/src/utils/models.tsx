export interface GameState {
  deck: string[]
  board: string[]
}

interface PlayerInfo {
  score: number
  color: string
}

export interface Players {
  [key: string]: PlayerInfo
}
