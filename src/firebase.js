import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDkcBd3Yr3st844rkuQ1AGISho7I0xTvbk",
  authDomain: "fusionbites-2c03a.firebaseapp.com",
  projectId: "fusionbites-2c03a",
  storageBucket: "fusionbites-2c03a.firebasestorage.app",
  messagingSenderId: "920268707146",
  appId: "1:920268707146:web:0bc8b6bba83263bceeddb3",
  measurementId: "G-42JCX8MSXG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence);
export const db = getFirestore(app);

export default app;
