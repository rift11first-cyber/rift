import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {

  apiKey: "AIzaSyBQRmn-kQf2EUx9BDzEc5ruJ7KcYc755-U",

  authDomain: "zync-a5d3d.firebaseapp.com",

  projectId: "zync-a5d3d",

  storageBucket: "zync-a5d3d.firebasestorage.app",

  messagingSenderId: "60497371828",

  appId: "1:60497371828:web:bc06a85477335703ebede1",

  measurementId: "G-M73BE43CBW"

};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set auth persistence to remember user for extended period
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

export default app;
