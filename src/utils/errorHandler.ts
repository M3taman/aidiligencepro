import { FirebaseError } from 'firebase/app';

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export class ErrorHandler {
  static handleFirebaseError(error: FirebaseError): AppError {
    const errorMap: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'permission-denied': 'You do not have permission to perform this action.',
      'unavailable': 'Service temporarily unavailable. Please try again.',
      'deadline-exceeded': 'Request timed out. Please try again.',
    };

    return {
      code: error.code,
      message: errorMap[error.code] || error.message || 'An unexpected error occurred.',
      details: error
    };
  }

  static handleGenericError(error: Error | unknown): AppError {
    if (error instanceof FirebaseError) {
      return this.handleFirebaseError(error);
    }

    const errorObj = error as Error;
    return {
      code: 'unknown',
      message: errorObj?.message || 'An unexpected error occurred.',
      details: error
    };
  }

  static logError(error: AppError, context?: string) {
    console.error(`[${context || 'App'}] Error:`, error);
    
    // In production, send to external logging service
    if (import.meta.env.PROD) {
      // TODO: Send to Sentry, LogRocket, or other logging service
      // Example: Sentry.captureException(error.details, { tags: { context } });
    }
  }
}

export default ErrorHandler;