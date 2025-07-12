import * as functions from 'firebase-functions';
import { auth } from '../firebaseAdmin';

export const validateAuth = async (req: functions.https.Request) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    (req as any).user = decodedToken; // Attach user to request
  } catch (error) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication failed', error);
  }
};
