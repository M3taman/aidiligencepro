import { AuthService } from './firebase.js';
import { AuthError, AuthErrorCode } from './errors';

// Main auth service interface
export interface IAuthService {
  initialize(): Promise<void>;
  signIn(email: string, password: string): Promise<User>;
  signUp(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
  sendPasswordResetEmail(email: string): Promise<void>;
}

// Singleton auth service instance
let authService: IAuthService;

export const getAuthService = (): IAuthService => {
  if (!authService) {
    authService = new AuthService();
  }
  return authService;
};

// User type definition
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  getIdToken(): Promise<string>;
}

// Utility function for handling auth errors
export const handleAuthError = (error: unknown): AuthError => {
  if (error instanceof AuthError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AuthError(
      error.message,
      AuthErrorCode.UNKNOWN,
      error
    );
  }

  return new AuthError(
    'Unknown authentication error',
    AuthErrorCode.UNKNOWN,
    error
  );
};
