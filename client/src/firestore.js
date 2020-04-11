import * as firebase from 'firebase/app'
import 'firebase/firestore'
import firebaseConfig from './firebaseConfig'
import 'firebase/auth'

firebase.initializeApp(firebaseConfig)
// firebase.analytics()

const firestore = firebase.firestore()

export default firestore
