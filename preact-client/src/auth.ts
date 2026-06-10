import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from './firebaseConfig'
import { signal } from '@preact/signals'

const IS_WS = import.meta.env.VITE_TRANSPORT === 'websocket'

let uid: string | null = null

export const currentUser = signal<User | null>(null)

async function syncUserWithDatabase(user: User) {
  try {
    const res = await fetch(`/api/user/${user.uid}`)
    if (res.status === 404) {
      console.log('User not registered in DB, registering...')
      await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          info: {
            displayName: user.displayName || localStorage.getItem('nickname') || 'anonymous',
            email: user.email || '',
            uid: user.uid,
            isAnonymous: user.isAnonymous,
          },
        }),
      })
      console.log('User registered in DB successfully')
    }
  } catch (err) {
    console.error('Error syncing user with database:', err)
  }
}

if (!IS_WS) {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    if (user) {
      uid = user.uid
      syncUserWithDatabase(user)
    } else {
      uid = null
    }
  })
}

export function getUserId(): string {
  if (!IS_WS && currentUser.value) {
    return currentUser.value.uid
  }
  if (!uid) {
    uid = localStorage.getItem('uid') || 'anon-' + Math.random().toString(36).slice(2, 8)
    localStorage.setItem('uid', uid)
  }
  return uid
}

export async function ensureAnonymousAuth(): Promise<string> {
  if (IS_WS) {
    return getUserId()
  }

  if (auth.currentUser) {
    currentUser.value = auth.currentUser
    uid = auth.currentUser.uid
    return uid
  }

  try {
    const cred = await signInAnonymously(auth)
    currentUser.value = cred.user
    uid = cred.user.uid
    return uid
  } catch (e) {
    console.error('Anonymous auth failed, falling back to local UID', e)
    return getUserId()
  }
}

export async function handleGoogleSignIn(): Promise<User> {
  if (IS_WS) throw new Error('Google sign-in not available in WebSocket mode')

  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')

  const cred = await signInWithPopup(auth, provider)
  currentUser.value = cred.user
  uid = cred.user.uid
  return cred.user
}

export async function handleSignOut(): Promise<void> {
  if (!IS_WS) {
    await firebaseSignOut(auth)
  }
  currentUser.value = null
  uid = null
  localStorage.removeItem('uid')
  localStorage.removeItem('nickname')
  if (!IS_WS) {
    await ensureAnonymousAuth()
  }
}

export function getNickname(): string {
  if (!IS_WS && currentUser.value && !currentUser.value.isAnonymous) {
    return currentUser.value.displayName || ''
  }
  return localStorage.getItem('nickname') || ''
}

export function setNickname(name: string) {
  localStorage.setItem('nickname', name)
}
