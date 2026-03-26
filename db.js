const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrg6IszzBHPIYgFwaCZj97VF-IMFgl538",
  authDomain: "kahna-bakes.firebaseapp.com",
  projectId: "kahna-bakes",
  storageBucket: "kahna-bakes.firebasestorage.app",
  messagingSenderId: "446378437558",
  appId: "1:446378437558:web:3126dbc29bd62c6b786f17",
  measurementId: "G-6EVTH12TE5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = db;
