import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence only in production or when explicitly requested
// This avoids the 'failed-precondition' errors during development with HMR
if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_PERSISTENCE === 'true') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required for persistence
      console.log('Persistence not supported by this browser');
    } else {
      console.log('Offline persistence error:', err);
    }
  });
}

// Admin credentials for testing
const ADMIN_EMAIL = 'admin@aidiligencepro.com';
const ADMIN_PASSWORD = 'AdminSecurePass@2025'; // Updated more secure password

// Function to create admin account if it doesn't exist
export const setupAdminAccount = async () => {
  // Initialize authentication state to prevent UI errors
  let isAuthenticated = false;
  
  // First try to sign in with the admin credentials
  try {
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('Admin signed in successfully');
    isAuthenticated = true;
  } catch (error) {
    console.error('Error checking admin account:', error);
    
    // If sign-in fails, try to create the account
    try {
      await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      console.log('Admin account created successfully');
      isAuthenticated = true;
    } catch (createError) {
      console.error('Error creating admin account:', createError);
      
      // Finally, try anonymous sign-in as a last resort
      try {
        // Only attempt anonymous sign-in in development or when explicitly enabled
        if (import.meta.env.MODE === 'development' || !import.meta.env.PROD || import.meta.env.VITE_ALLOW_ANONYMOUS === 'true') {
          await signInAnonymously(auth);
          console.log('Signed in anonymously for testing');
          isAuthenticated = true;
        } else {
          console.log('Anonymous sign-in not allowed in production');
        }
      } catch (anonError) {
        console.error('Anonymous sign-in failed:', anonError);
      }
    }
  }
  
  return isAuthenticated;
};

// Allow anonymous sign-in for demo purposes
export const signInAnonymousUser = async () => {
  try {
    await signInAnonymously(auth);
    return true;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    return false;
  }
};

// Call setupAdminAccount on app initialization
setupAdminAccount().then(success => {
  if (success) {
    console.log('Authentication setup completed successfully');
  } else {
    console.warn('Authentication setup completed with issues - some features may be limited');
  }
});

export { auth, db, storage };
