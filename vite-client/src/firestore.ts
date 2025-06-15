import 'firebase/compat/auth'
import 'firebase/compat/firestore'

import firebase from 'firebase/compat/app'
import firebaseConfig from './firebaseConfig'

firebase.initializeApp(firebaseConfig)

const firestore = firebase.firestore()

export default firestore
