import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyABbCv-N5W1j1wETdW6DRQBNnAuF3RWWqg",
  authDomain: "ai-diligence.firebaseapp.com",
  projectId: "ai-diligence",
  storageBucket: "ai-diligence.firebasestorage.app",
  messagingSenderId: "1039760524298",
  appId: "1:1039760524298:web:9f4b62b372f86e18e5cbf3"
};

console.log('Firebase config:', firebaseConfig);

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;