export interface GameState {
  deck: string[]
  board: string[]
}

export interface Player {
  score: number
  color: string
  name: string
}

export interface MultiplayerPlayer extends Player {
  uid: string
  host: boolean
}

interface PlayerInfo {
  score: number
  color: string
}

interface MultiPlayerInfo extends PlayerInfo {
  host: boolean
  uid: string
}

export interface Players {
  [key: string]: PlayerInfo
}

export interface MultiPlayers {
  [key: string]: MultiPlayerInfo
}

export interface CommonState extends GameState {
  selected: string[]
  started: boolean
  myName: string
  gameOver: string
  setFound: boolean
  declarer: null | string
  undeclareId?: number
  timeDeclared?: number
}

interface SoloState extends CommonState {
  players: Players
  startTime: Date
  cpuTurnInterval: number
  cpuFound?: string[]
  difficulty?: number
  cpuTimer?: number
  cpuAnimation?: number
}

export interface MultiState extends CommonState {
  players: MultiPlayers
  created: boolean
}

export interface Action {
  type: string
  payload: any
}
