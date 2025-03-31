import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

// --- Commenting out Firestore mock in src/tests/setup.ts ---
// // Simplified synchronous mock factory (matching src/test/setup.ts)
// vi.mock('firebase/firestore', () => ({
//   // Ensure getFirestore is explicitly mocked and exported
//   getFirestore: vi.fn(() => {
//     // console.log('Mock getFirestore called'); // Debugging
//     return {}; // Return a simple object
//   }),
//   // Ensure enableIndexedDbPersistence is explicitly mocked and exported
//   enableIndexedDbPersistence: vi.fn(() => {
//     // console.log('Mock enableIndexedDbPersistence called'); // Debugging
//     return Promise.resolve(); // Return a resolved promise
//   }),
//   // Mock other functions used by the tests
//   collection: vi.fn(),
//   doc: vi.fn((...args) => {
//       // console.log('Mock doc called with:', args); // Debugging
//       return { id: 'mock-doc-id', path: 'mock/path' }; // Return a basic mock doc ref
//   }),
//   setDoc: vi.fn(() => Promise.resolve()),
//   getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => undefined })), // Default mock for getDoc
//   getDocs: vi.fn(() => Promise.resolve({ empty: true, docs: [], size: 0 })), // Default mock for getDocs
//   query: vi.fn(),
//   where: vi.fn(),
//   orderBy: vi.fn(),
//   limit: vi.fn(),
//   addDoc: vi.fn(), // Added addDoc
//   updateDoc: vi.fn(), // Added updateDoc
//   deleteDoc: vi.fn(), // Added deleteDoc
//   // Mock Timestamp if necessary (using basic structure)
//   Timestamp: {
//     now: vi.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
//     fromDate: vi.fn((date: Date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })),
//     toDate: vi.fn((ts: { seconds: number }) => new Date(ts.seconds * 1000)),
//   }
// }));
// --- End Commenting out ---


// Mock Sentry
vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  BrowserTracing: vi.fn(),
  Replay: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    // Provide a default reportId for useParams used in ReportDetailPage
    useParams: () => ({ reportId: 'test-report-id' }),
    useLocation: () => ({ pathname: '/' }),
  };
});

// Mock environment variables
vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key');
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test-auth-domain');
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project-id');
vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test-storage-bucket');
vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', 'test-sender-id');
vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id');
vi.stubEnv('VITE_SENTRY_DSN', 'test-sentry-dsn');

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
