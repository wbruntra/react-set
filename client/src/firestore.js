// import * as firebase from 'firebase';
import firebase from 'firebase/app'
import 'firebase/firestore'
import firebaseConfig from './firebaseConfig'

firebase.initializeApp(firebaseConfig)
// firebase.analytics()

const firestore = firebase.firestore()

// const settings = { timestampsInSnapshots: true };
// firestore.settings(settings);

export default firestore
