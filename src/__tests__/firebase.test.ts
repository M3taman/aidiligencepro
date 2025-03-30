import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInWithEmailAndPassword, signInAnonymously, createUserWithEmailAndPassword } from 'firebase/auth';
import { setupAdminAccount } from '../firebase';

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null
  })),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInAnonymously: vi.fn()
}));

describe('Firebase Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should attempt to sign in with admin credentials', async () => {
    // Mock successful admin sign-in
    (signInWithEmailAndPassword as any).mockResolvedValueOnce({ user: { uid: 'admin-uid' } });
    
    const result = await setupAdminAccount();
    
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should try to create admin account if it does not exist', async () => {
    // Mock failed sign-in due to user not found
    (signInWithEmailAndPassword as any).mockRejectedValueOnce({ code: 'auth/user-not-found' });
    // Mock successful account creation
    (createUserWithEmailAndPassword as any).mockResolvedValueOnce({ user: { uid: 'new-admin-uid' } });
    
    const result = await setupAdminAccount();
    
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
    expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should fall back to anonymous sign-in in development mode', async () => {
    // Mock failed admin sign-in
    (signInWithEmailAndPassword as any).mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    // Mock successful anonymous sign-in
    (signInAnonymously as any).mockResolvedValueOnce({ user: { uid: 'anon-uid' } });
    
    // Mock development environment
    vi.stubGlobal('import.meta.env', { MODE: 'development' });
    
    const result = await setupAdminAccount();
    
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
    expect(signInAnonymously).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
