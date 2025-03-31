import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export async function validateAuth(
  req: AuthRequest, 
  res?: Response, 
  next?: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      throw new Error('Invalid authorization token format');
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    
    if (next) {
      next();
    }
    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    if (res) {
      res.status(401).json({ 
        error: 'Unauthorized',
        message: error instanceof Error ? error.message : 'Authentication failed'
      });
    }
    throw error;
  }
}
