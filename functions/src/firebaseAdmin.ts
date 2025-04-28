import * as admin from 'firebase-admin';
import { initializeApp, getApps } from 'firebase-admin/app';

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\n'),
};

if (!getApps().length) {
  initializeApp({
    credential: admin.credential.cert(firebaseConfig),
  });
}

export default admin;
