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

let uid: string | null = null

export const currentUser = signal<User | null>(null)

// Register/sync user with API
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

// Track auth changes
onAuthStateChanged(auth, (user) => {
  currentUser.value = user
  if (user) {
    uid = user.uid
    syncUserWithDatabase(user)
  } else {
    uid = null
  }
})

export function getUserId(): string {
  if (currentUser.value) {
    return currentUser.value.uid
  }
  if (!uid) {
    uid = localStorage.getItem('uid') || 'anon-' + Math.random().toString(36).slice(2, 8)
    localStorage.setItem('uid', uid)
  }
  return uid
}

export async function ensureAnonymousAuth(): Promise<string> {
  // If we already have a user (anonymous or Google), just return its uid
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
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')

  const cred = await signInWithPopup(auth, provider)
  currentUser.value = cred.user
  uid = cred.user.uid
  return cred.user
}

export async function handleSignOut(): Promise<void> {
  await firebaseSignOut(auth)
  currentUser.value = null
  uid = null
  localStorage.removeItem('uid')
  localStorage.removeItem('nickname')
  // Automatically re-authenticate anonymously so the app doesn't break
  await ensureAnonymousAuth()
}

export function getNickname(): string {
  if (currentUser.value && !currentUser.value.isAnonymous) {
    return currentUser.value.displayName || ''
  }
  return localStorage.getItem('nickname') || ''
}

export function setNickname(name: string) {
  localStorage.setItem('nickname', name)
}
