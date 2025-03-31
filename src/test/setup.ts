import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// Enable fake timers
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

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

// --- VERY Simple Firestore Mock ---
vi.mock('firebase/firestore', () => {
  // console.log('Applying simplified Firestore mock in src/test/setup.ts'); // Debugging line
  return {
    getFirestore: vi.fn(() => {
      // console.log('Simplified mock getFirestore called'); // Debugging line
      return {}; // Simplest possible mock instance
    }),
    enableIndexedDbPersistence: vi.fn(() => Promise.resolve()),
    collection: vi.fn((db, path) => ({ // Mock collection to return path info
      path: path,
      // Add other mock methods if needed
    })),
    // Mock doc to return a structured object that getDoc might expect
    doc: vi.fn((db, collectionPath, docId) => {
      // console.log(`Mock doc called: db=${db}, collectionPath=${collectionPath}, docId=${docId}`); // Debugging
      return {
        _key: { path: { segments: [collectionPath, docId] } }, // Mimic Firestore internal structure minimally
        id: docId,
        path: `${collectionPath}/${docId}`,
        // Add other mock properties/methods if needed
      };
    }),
    setDoc: vi.fn(() => Promise.resolve()),
    // Simplify getDoc mock - ignore input, return default non-existent. Tests will override.
    getDoc: vi.fn(() => {
        // console.log('Global setup getDoc mock returning non-existent'); // Debugging
        return Promise.resolve({ exists: () => false, data: () => undefined });
    }),
    getDocs: vi.fn(() => Promise.resolve({ empty: true, docs: [], size: 0 })),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    Timestamp: { // Keep basic Timestamp mock
      now: vi.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
      fromDate: vi.fn((date: Date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })),
      toDate: vi.fn((ts: { seconds: number }) => new Date(ts.seconds * 1000)),
    }
  };
});
// --- End Simple Firestore Mock ---

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  }
}));

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
