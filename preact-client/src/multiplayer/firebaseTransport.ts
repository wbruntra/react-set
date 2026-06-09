import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentReference,
} from 'firebase/firestore'
import { firestore } from '../firebaseConfig'
import type { GameTransport, GameSummary, Unsubscribe, ActionId } from './transport'
import type { GameAction, MultiGameState } from '@react-set/common'

export function createFirebaseTransport(): GameTransport {
  function gameDoc(id: string): DocumentReference {
    return doc(firestore, 'games', id)
  }

  function actionsCollection(id: string) {
    return collection(firestore, 'games', id, 'actions')
  }

  async function createGame(
    id: string,
    state: Partial<MultiGameState> & { creator_uid?: string },
  ): Promise<void> {
    await setDoc(gameDoc(id), {
      ...state,
      lastUpdate: serverTimestamp(),
    })
  }

  async function updateState(id: string, partial: Partial<MultiGameState>): Promise<void> {
    await updateDoc(gameDoc(id), {
      ...partial,
      lastUpdate: serverTimestamp(),
    } as any)
  }

  function subscribeState(id: string, cb: (state: MultiGameState) => void): Unsubscribe {
    return onSnapshot(gameDoc(id), (snap) => {
      if (snap.exists()) {
        cb(snap.data() as MultiGameState)
      }
    })
  }

  async function sendAction(id: string, action: GameAction): Promise<ActionId> {
    const ref = await addDoc(actionsCollection(id), {
      ...action,
      created: serverTimestamp(),
    })
    return ref.id
  }

  function subscribeActions(
    id: string,
    cb: (action: GameAction, actionId: string) => void,
  ): Unsubscribe {
    return onSnapshot(actionsCollection(id), (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          cb(change.doc.data() as GameAction, change.doc.id)
        }
      })
    })
  }

  async function consumeAction(id: string, actionId: string): Promise<void> {
    await deleteDoc(doc(actionsCollection(id), actionId))
  }

  async function findResumable(ownerUid: string): Promise<GameSummary[]> {
    const q = query(collection(firestore, 'games'), where('creator_uid', '==', ownerUid))
    const snap = await getDocs(q)
    const results: GameSummary[] = []
    snap.forEach((d) => {
      results.push({
        id: d.id,
        gameTitle: d.id,
        players: d.data().players || {},
      })
    })
    return results
  }

  async function listJoinableGames(): Promise<GameSummary[]> {
    const q = query(collection(firestore, 'games'), orderBy('lastUpdate', 'desc'), limit(50))
    const snap = await getDocs(q)
    const results: GameSummary[] = []
    snap.forEach((d) => {
      const data = d.data()
      if (data.gameStarted) return
      results.push({
        id: d.id,
        gameTitle: d.id,
        players: data.players || {},
      })
    })
    return results
  }

  async function deleteGame(id: string): Promise<void> {
    await deleteDoc(gameDoc(id))
  }

  return {
    createGame,
    updateState,
    subscribeState,
    sendAction,
    subscribeActions,
    consumeAction,
    findResumable,
    deleteGame,
    listJoinableGames,
  }
}
