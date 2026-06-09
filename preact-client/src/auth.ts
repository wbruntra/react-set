import { signInAnonymously } from 'firebase/auth'
import { auth } from './firebaseConfig'

let uid: string | null = null

export function getUserId(): string {
  if (!uid) {
    uid = localStorage.getItem('uid') || 'anon-' + Math.random().toString(36).slice(2, 8)
    localStorage.setItem('uid', uid)
  }
  return uid
}

export async function ensureAnonymousAuth(): Promise<string> {
  if (auth.currentUser) {
    uid = auth.currentUser.uid
    return uid
  }

  try {
    const cred = await signInAnonymously(auth)
    uid = cred.user.uid
    return uid
  } catch {
    return getUserId()
  }
}

export function getNickname(): string {
  return localStorage.getItem('nickname') || ''
}

export function setNickname(name: string) {
  localStorage.setItem('nickname', name)
}
