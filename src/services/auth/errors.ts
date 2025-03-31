export enum AuthErrorCode {
  INVALID_EMAIL = 'auth/invalid-email',
  USER_DISABLED = 'auth/user-disabled',
  USER_NOT_FOUND = 'auth/user-not-found',
  WRONG_PASSWORD = 'auth/wrong-password',
  EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  OPERATION_NOT_ALLOWED = 'auth/operation-not-allowed',
  WEAK_PASSWORD = 'auth/weak-password',
  NETWORK_ERROR = 'auth/network-request-failed',
  TOO_MANY_REQUESTS = 'auth/too-many-requests',
  UNKNOWN = 'auth/unknown-error',
  CONTEXT_NOT_INITIALIZED = 'auth/context-not-initialized',
  SESSION_EXPIRED = 'auth/session-expired'
}

export class AuthError extends Error {
  constructor(
    message: string, 
    public readonly code: AuthErrorCode,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'AuthError';
  }
  
  static isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError;
  }

  static fromFirebaseError(error: any): AuthError {
    const code = Object.values(AuthErrorCode).includes(error?.code)
      ? error.code as AuthErrorCode
      : AuthErrorCode.UNKNOWN;
      
    return new AuthError(
      error?.message || 'Authentication failed',
      code,
      error
    );
  }
}
