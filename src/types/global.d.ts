// Global augmentation for window.recaptchaVerifier using Firebase types
declare global {
  import type { RecaptchaVerifier } from 'firebase/auth';

  interface Window {
    // Use the Firebase RecaptchaVerifier type for strong typing
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export {};
