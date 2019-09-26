import firebase from 'firebase'
import firebaseConfig from './src/firebaseConfig'

const run = () => {
  firebase.initializeApp(firebaseConfig)
  const firestore = firebase.firestore()
  const gamesRef = firestore.collection('games')

  gamesRef
    .orderBy('__name__')
    .limit(10)
    .get()
    .then(snapshot => {
      const batch = firestore.batch()
      snapshot.docs.forEach(g => {
        const { lastUpdate } = g.data()
        if (!lastUpdate) {
          batch.delete(g.ref)
        } else {
          const updated = g.data().lastUpdate.toMillis()
          const now = new Date().getTime()
          const age = Math.round((now - updated) / 1000)
          if (age > 30) {
            console.log('Deleting:', g.id)
            batch.delete(g.ref)
          }
        }
      })
      return batch.commit().then(() => {
        console.log('Delete successful')
        process.exit()
      })
    })
}

run()
