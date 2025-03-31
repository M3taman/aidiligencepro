import { getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../../firebase';
import { IAuthService, User } from '.';
import { AuthError, AuthErrorCode } from './errors';

export class AuthService implements IAuthService {
  async initialize(): Promise<void> {
    // Initialization logic if needed
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw AuthError.fromFirebaseError(error);
    }
  }

  async signUp(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw AuthError.fromFirebaseError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw AuthError.fromFirebaseError(error);
    }
  }

  getCurrentUser(): User | null {
    const user = auth.currentUser;
    return user ? this.mapFirebaseUser(user) : null;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, (user) => {
      callback(user ? this.mapFirebaseUser(user) : null);
    });
  }

  private mapFirebaseUser(user: FirebaseUser): User {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime
      },
      getIdToken: () => user.getIdToken()
    };
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw AuthError.fromFirebaseError(error);
    }
  }
}
