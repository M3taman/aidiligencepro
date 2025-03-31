import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';

interface RateLimitData {
  count: number;
  firstRequest: number;
}

const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100
};

export const rateLimiter = onRequest(
  { cors: true },
  async (request, response) => {
    const processRequest = async () => {
      try {
        const ip = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
        const path = request.path;
        const key = `rate_limit:${path}:${ip}`;

        const db = admin.firestore();
        const ref = db.collection('rateLimits').doc(key);
        
        const snapshot = await ref.get();
        const current = snapshot.data() as RateLimitData || { 
          count: 0, 
          firstRequest: Date.now() 
        };

        if (Date.now() - current.firstRequest > RATE_LIMIT.WINDOW_MS) {
          await ref.set({
            count: 1,
            firstRequest: Date.now()
          });
        } else if (current.count >= RATE_LIMIT.MAX_REQUESTS) {
          response.status(429).json({
            error: 'Too many requests',
            message: `You have exceeded ${RATE_LIMIT.MAX_REQUESTS} requests per 15 minutes`
          });
          return false;
        } else {
          await ref.update({
            count: admin.firestore.FieldValue.increment(1)
          });
        }
        return true;
      } catch (error) {
        console.error('Rate limiter error:', error);
        return true; // Fail open
      }
    };

    const shouldProceed = await processRequest();
    if (shouldProceed) {
      response.status(200).json({ rateLimitChecked: true });
    }
  }
);
