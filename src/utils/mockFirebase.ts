// Mock implementation of Firebase auth and Firestore for testing
import { toast } from 'sonner';

// Mock user data
const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  getIdToken: async () => 'mock-id-token',
  delete: async () => {
    toast.success('User deleted successfully');
    return Promise.resolve();
  }
};

// Mock auth
export const mockAuth = {
  currentUser: null as any,
  async signInWithEmailAndPassword(email: string, password: string) {
    if (password === 'wrong') {
      throw new Error('Invalid credentials');
    }
    mockAuth.currentUser = mockUser;
    return { user: mockUser };
  },
  async createUserWithEmailAndPassword(email: string, password: string) {
    mockAuth.currentUser = mockUser;
    return { user: mockUser };
  },
  async sendPasswordResetEmail(email: string) {
    return Promise.resolve();
  },
  async signOut() {
    mockAuth.currentUser = null;
    return Promise.resolve();
  }
};

// Mock Firestore data
const mockData: Record<string, Record<string, any>> = {
  userSettings: {},
  userProfiles: {}
};

// Mock Firestore document reference
class MockDocumentReference {
  private collection: string;
  private id: string;

  constructor(collection: string, id: string) {
    this.collection = collection;
    this.id = id;
  }

  async get() {
    const data = mockData[this.collection]?.[this.id];
    return {
      exists: () => !!data,
      data: () => data || null
    };
  }

  async set(data: any) {
    if (!mockData[this.collection]) {
      mockData[this.collection] = {};
    }
    mockData[this.collection][this.id] = data;
    return Promise.resolve();
  }

  async delete() {
    if (mockData[this.collection]?.[this.id]) {
      delete mockData[this.collection][this.id];
    }
    return Promise.resolve();
  }
}

// Mock Firestore collection reference
class MockCollectionReference {
  private collection: string;

  constructor(collection: string) {
    this.collection = collection;
  }

  doc(id: string) {
    return new MockDocumentReference(this.collection, id);
  }
}

// Mock Firestore
export const mockFirestore = {
  collection(name: string) {
    return new MockCollectionReference(name);
  }
};

// Helper function to enable mock mode
export const enableMockMode = () => {
  // This function would be called to switch to mock mode
  toast.info('Mock mode enabled for testing');
  return {
    auth: mockAuth,
    db: mockFirestore
  };
};

// Helper function to reset mock data
export const resetMockData = () => {
  Object.keys(mockData).forEach(collection => {
    mockData[collection] = {};
  });
  mockAuth.currentUser = null;
}; 