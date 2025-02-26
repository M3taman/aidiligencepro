import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB6LmONvgVBzBoJ2Ibni7hsptJFbVJsDTo",
  authDomain: "aidiligence-pro.firebaseapp.com",
  projectId: "aidiligence-pro",
  storageBucket: "aidiligence-pro.appspot.com",
  messagingSenderId: "850893025484",
  appId: "1:850893025484:web:3f4b62b372f86e18e5cbf3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
