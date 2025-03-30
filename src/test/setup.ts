import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('firebase/app', () => {
  return {
    initializeApp: vi.fn(() => ({})),
  };
});

vi.mock('firebase/auth', () => {
  return {
    getAuth: vi.fn(() => ({
      currentUser: null,
    })),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInAnonymously: vi.fn(),
    onAuthStateChanged: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn(),
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    enableIndexedDbPersistence: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
  };
});

vi.mock('firebase/storage', () => {
  return {
    getStorage: vi.fn(() => ({})),
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn(),
  };
});

// Mock environment variables
vi.stubGlobal('import.meta', {
  env: {
    MODE: 'test',
    VITE_FIREBASE_API_KEY: 'test-api-key',
    VITE_FIREBASE_AUTH_DOMAIN: 'test-auth-domain',
    VITE_FIREBASE_PROJECT_ID: 'test-project-id',
    VITE_FIREBASE_STORAGE_BUCKET: 'test-storage-bucket',
    VITE_FIREBASE_MESSAGING_SENDER_ID: 'test-messaging-sender-id',
    VITE_FIREBASE_APP_ID: 'test-app-id',
    VITE_FIREBASE_MEASUREMENT_ID: 'test-measurement-id',
    VITE_ENABLE_PERSISTENCE: 'false',
    PROD: false,
  },
});
