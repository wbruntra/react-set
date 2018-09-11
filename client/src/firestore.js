import * as firebase from 'firebase';

const config = {
  apiKey: "AIzaSyAvSp91vcvkgt9RYafRIgY8noH4NSX0P0g",
  authDomain: "isthisprime.firebaseapp.com",
  databaseURL: "https://isthisprime.firebaseio.com",
  projectId: "isthisprime",
  storageBucket: "isthisprime.appspot.com",
  messagingSenderId: "522572340456"
};

firebase.initializeApp(config);

const firestore = firebase.firestore();

const settings = { timestampsInSnapshots: true};
firestore.settings(settings);

export default firestore;
