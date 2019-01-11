const firebase = require('firebase');
const config = {
  apiKey: 'AIzaSyAvSp91vcvkgt9RYafRIgY8noH4NSX0P0g',
  authDomain: 'isthisprime.firebaseapp.com',
  databaseURL: 'https://isthisprime.firebaseio.com',
  projectId: 'isthisprime',
  storageBucket: 'isthisprime.appspot.com',
  messagingSenderId: '522572340456',
};

firebase.initializeApp(config);

const firestore = firebase.firestore();

const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

function deleteCollection(db, collectionPath, batchSize) {
  var collectionRef = db.collection(collectionPath);
  var query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize, resolve, reject);
  });
}

function deleteQueryBatch(db, query, batchSize, resolve, reject) {
  query
    .get()
    .then(snapshot => {
      // When there are no documents left, we are done
      if (snapshot.size === 0) {
        return 0;
      }

      // Delete documents in a batch
      var batch = db.batch();
      snapshot.docs.forEach(doc => {
        console.log('Deleting:', doc.id);
        batch.delete(doc.ref);
      });

      return batch.commit().then(() => {
        return snapshot.size;
      });
    })
    .then(numDeleted => {
      if (numDeleted === 0) {
        resolve();
        return;
      }

      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(db, query, batchSize, resolve, reject);
      });
    })
    .catch(reject);
}

// deleteCollection(firestore, 'games/foo/actions', 20);

const gamesRef = firestore.collection('games');
const query = gamesRef
  .orderBy('__name__')
  .limit(10)
  .get()
  .then(snapshot => {
    const batch = firestore.batch();
    snapshot.docs.forEach(g => {
      const updated = g.data().lastUpdate.toMillis();
      const now = new Date().getTime();
      const age = Math.round((now - updated) / 1000);
      if (age > 30) {
        console.log('Deleting:', g.id);
        batch.delete(g.ref);
      }
    });
    return batch.commit().then(() => {
      console.log('Delete successful');
    });
  });

// return new Promise((resolve, reject) => {
//   deleteQueryBatch(db, query, batchSize, resolve, reject);
// });

// games.forEach(g => {
//   console.log('​g', g);
// });
