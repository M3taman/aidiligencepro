import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Import the functions we want to mock directly
// Import the function under test FIRST
import { setupAdminAccount } from '../firebase';
// Import the functions we want to mock
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, getAuth } from 'firebase/auth';

// Mock the entire firebase/auth module, explicitly returning mocks
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })), // Mock getAuth as well if needed by setupAdminAccount implicitly
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInAnonymously: vi.fn(),
}));

describe('Firebase Authentication', () => {
  const originalEnv = { ...import.meta.env }; // Store original env for resetting

  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
    // Reset environment to original state before each test
    vi.stubGlobal('import.meta', { env: { ...originalEnv } });
  });

  afterEach(() => {
    vi.unstubAllGlobals(); // Clean up global stubs
    // No need to reset modules if we aren't dynamically importing inside tests
  });

  it('should attempt to sign in with admin credentials', async () => {
    // Mock successful admin sign-in
    vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({ user: { uid: 'admin-uid' } } as any);

    const result = await setupAdminAccount();

    expect(signInWithEmailAndPassword).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should try to create admin account if it does not exist', async () => {
    // Mock failed sign-in due to user not found
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce({ code: 'auth/user-not-found' });
    // Mock successful account creation
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({ user: { uid: 'new-admin-uid' } } as any);

    const result = await setupAdminAccount();

    expect(signInWithEmailAndPassword).toHaveBeenCalled();
    expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should fall back to anonymous sign-in in development mode', async () => {
    // --- Setup Mocks and Stubs FIRST ---
    // Mock failed admin sign-in
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    // Mock failed admin creation
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
    // Mock successful anonymous sign-in
    vi.mocked(signInAnonymously).mockResolvedValueOnce({ user: { uid: 'anon-uid' } } as any);

    // Stub environment specifically for this test
    vi.stubGlobal('import.meta', {
      env: {
        ...originalEnv, // Use stored original env
        MODE: 'development',
        PROD: false, // Ensure PROD is false
        // VITE_ALLOW_ANONYMOUS: 'true' // Add this if the check requires it explicitly
      }
    });

    // --- Call the function under test ---
    const result = await setupAdminAccount();

    // --- Assertions ---
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
    expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    expect(signInAnonymously).toHaveBeenCalled(); // This is the key check
    expect(result).toBe(true);
  });
});
