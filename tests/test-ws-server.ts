import { GAME_CONFIG } from '@react-set/common'

const URL = 'ws://localhost:5002/ws'

function connect(label: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL)
    ws.onopen = () => {
      console.log(`[${label}] connected`)
      resolve(ws)
    }
    ws.onerror = (e) => reject(new Error(`${label} connection error`))
    ws.onclose = () => console.log(`[${label}] disconnected`)
  })
}

function sendAndWait(ws: WebSocket, msg: Record<string, any>, timeout = 5000): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestId = String(Math.random().toString(36).slice(2))
    const timer = setTimeout(() => reject(new Error(`Timeout on ${msg.type}`)), timeout)

    const handler = (event: MessageEvent) => {
      const resp = JSON.parse(event.data as string)
      if (resp.requestId === requestId) {
        clearTimeout(timer)
        ws.removeEventListener('message', handler)
        if (resp.type === 'error') {
          reject(new Error(resp.message))
        } else {
          resolve(resp)
        }
      }
    }

    ws.addEventListener('message', handler)
    ws.send(JSON.stringify({ ...msg, requestId }))
  })
}

function waitForMessage(ws: WebSocket, type: string, timeout = 5000): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${type}`)), timeout)
    const handler = (event: MessageEvent) => {
      const resp = JSON.parse(event.data as string)
      if (resp.type === type) {
        clearTimeout(timer)
        ws.removeEventListener('message', handler)
        resolve(resp)
      }
    }
    ws.addEventListener('message', handler)
  })
}

async function main() {
  console.log('=== WebSocket Game Server Tests ===\n')

  // --- Create game ---
  console.log('1. Creating game...')
  const host = await connect('host')
  const hostPlayers = {
    alice: {
      name: 'alice',
      color: GAME_CONFIG.colors[0],
      score: 0,
      host: true,
      uid: 'test-uid-1',
    },
  }
  const board = [
    '0000',
    '0111',
    '0222',
    '1000',
    '1111',
    '1222',
    '2000',
    '2111',
    '2222',
    '0001',
    '0112',
    '0220',
  ]
  const deck = ['1001', '1112', '1220', '2001', '2112', '2220']

  const createResp = await sendAndWait(host, {
    type: 'createGame',
    gameId: 'Test Game',
    state: {
      board,
      deck,
      selected: [],
      players: hostPlayers,
      declarer: null,
      setFound: false,
      gameStarted: false,
      gameOver: null,
    },
    creator_uid: 'test-uid-1',
  })
  const gameCode = createResp.gameId
  console.log(`   Game created, code: ${gameCode}`)

  // --- Subscribe host to actions ---
  await sendAndWait(host, { type: 'subscribeActions', gameId: gameCode })
  console.log('   Host subscribed to actions')

  // --- Guest connects and joins ---
  console.log('\n2. Guest joins...')
  const guest = await connect('guest')

  // Subscribe guest to state and actions
  const stateMsg = await sendAndWait(guest, { type: 'subscribeState', gameId: gameCode })
  console.log(
    `   Guest received state: ${stateMsg.state.board.length} cards, ${Object.keys(stateMsg.state.players).length} player(s)`,
  )

  await sendAndWait(guest, { type: 'subscribeActions', gameId: gameCode }).catch(() => {})
  console.log('   Guest subscribed to actions')

  // Guest sends join action
  const actionResp = await sendAndWait(guest, {
    type: 'sendAction',
    gameId: gameCode,
    action: { type: 'join', payload: { name: 'bob' } },
  })
  console.log(`   Join action sent, actionId: ${actionResp.actionId}`)

  // Host receives the join action
  const joinAction = await waitForMessage(host, 'actionReceived')
  console.log(
    `   Host received action: ${joinAction.action.type} from ${joinAction.action.payload.name}`,
  )

  // Host consumes the action
  await sendAndWait(host, {
    type: 'consumeAction',
    gameId: gameCode,
    actionId: joinAction.actionId,
  })
  console.log('   Action consumed by host')

  // Guest sees action consumed
  const consumedMsg = await waitForMessage(guest, 'actionConsumed')
  console.log(`   Guest sees action consumed: actionId=${consumedMsg.actionId}`)

  // Host updates state with new player
  hostPlayers.bob = { name: 'bob', color: GAME_CONFIG.colors[1], score: 0, host: false }
  sendAndWait(host, {
    type: 'updateState',
    gameId: gameCode,
    partial: { players: hostPlayers },
  }).catch(() => {})

  // Guest receives updated state
  const updatedState = await waitForMessage(guest, 'stateUpdate')
  console.log(
    `   Guest received updated state with ${Object.keys(updatedState.state.players).length} player(s)`,
  )

  // --- Start game ---
  console.log('\n3. Starting game...')
  sendAndWait(host, {
    type: 'updateState',
    gameId: gameCode,
    partial: { gameStarted: true },
  }).catch(() => {})
  const startMsg = await waitForMessage(guest, 'stateUpdate')
  console.log(`   Game started: gameStarted=${startMsg.state.gameStarted}`)

  // --- Guest finds a set ---
  console.log('\n4. Guest finds a set...')
  const foundResp = await sendAndWait(guest, {
    type: 'sendAction',
    gameId: gameCode,
    action: { type: 'found', payload: { name: 'bob', selected: ['0000', '1111', '2222'] } },
  })
  console.log(`   Found action sent, actionId: ${foundResp.actionId}`)

  // Host receives found action
  const foundAction = await waitForMessage(host, 'actionReceived')
  console.log(`   Host received found action from ${foundAction.action.payload.name}`)

  // Host consumes and updates state (simulate removeSet)
  hostPlayers.bob.score = 1
  await sendAndWait(host, {
    type: 'consumeAction',
    gameId: gameCode,
    actionId: foundAction.actionId,
  })
  sendAndWait(host, {
    type: 'updateState',
    gameId: gameCode,
    partial: {
      players: hostPlayers,
      declarer: null,
      setFound: false,
      selected: [],
    },
  }).catch(() => {})

  const postSetState = await waitForMessage(guest, 'stateUpdate')
  console.log(`   Guest sees bob score: ${postSetState.state.players.bob.score}`)

  // --- List joinable games ---
  console.log('\n5. Listing joinable games...')
  const guest2 = await connect('guest2')
  const listResp = await sendAndWait(guest2, { type: 'listJoinableGames' })
  console.log(`   Found ${listResp.games.length} joinable game(s)`)
  // Should be 0 since game started
  console.log(
    `   Expected 0 (game already started): ${listResp.games.length === 0 ? 'PASS' : 'FAIL'}`,
  )

  // --- Find resumable ---
  console.log('\n6. Finding resumable games...')
  const resumeResp = await sendAndWait(host, { type: 'findResumable', ownerUid: 'test-uid-1' })
  console.log(`   Found ${resumeResp.games.length} resumable game(s)`)

  // --- Delete game ---
  console.log('\n7. Deleting game...')
  await sendAndWait(host, { type: 'deleteGame', gameId: gameCode })
  console.log('   Game deleted')

  const delMsg = await waitForMessage(guest, 'gameDeleted')
  console.log(`   Guest notified: gameDeleted`)

  // --- Cleanup ---
  host.close()
  guest.close()
  guest2.close()

  console.log('\n=== All tests complete ===')
  setTimeout(() => process.exit(0), 500)
}

main().catch((err) => {
  console.error('TEST FAILED:', err.message)
  process.exit(1)
})
