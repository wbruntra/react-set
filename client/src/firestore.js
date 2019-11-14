import * as firebase from 'firebase/app'
import 'firebase/firestore'
import firebaseConfig from './firebaseConfig'

firebase.initializeApp(firebaseConfig)
// firebase.analytics()

const firestore = firebase.firestore()

export default firestore
