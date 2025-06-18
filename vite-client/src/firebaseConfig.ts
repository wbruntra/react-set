// Modern Firebase v9+ configuration
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCLA_RFXrPvBdN_vrApCUlj28a82ownuzg',
  authDomain: 'fire-set.firebaseapp.com',
  databaseURL: 'https://fire-set.firebaseio.com',
  projectId: 'fire-set',
  storageBucket: 'fire-set.firebasestorage.app',
  messagingSenderId: '958559518798',
  appId: '1:958559518798:web:ec451bbfb4ac03f30ec31f',
  measurementId: 'G-FCHHM3FEZE',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const firestore = getFirestore(app)

export default firebaseConfig
