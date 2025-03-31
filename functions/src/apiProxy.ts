import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { https } from 'firebase-functions/v2';
import { validateAuth } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimiter.js';

admin.initializeApp();

export const apiProxy = https.onRequest(
  { 
    cors: true,
    minInstances: 1,
    maxInstances: 10 
  },
  async (req, res) => {
    // Validate request method
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      // Verify authentication
      await validateAuth(req);
      
      // Validate request body
      if (!req.body || typeof req.body !== 'object') {
        res.status(400).json({ error: 'Invalid request body' });
        return;
      }

      // Log incoming request
      functions.logger.info('API Proxy Request:', {
        endpoint: req.path,
        headers: req.headers,
        body: req.body 
      });

      // Forward request to AI API
      const response = await axios.post(
        'https://api.aiml.com/v1/chat/completions',
        req.body,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.AI_API_KEY}`,
            'X-Request-ID': req.header('x-request-id') || ''
          },
          timeout: 10000
        }
      );

      // Forward response back to client
      res.status(response.status).json(response.data);
      
      // Log successful response
      functions.logger.info('API Proxy Success:', {
        status: response.status,
        data: response.data
      });
    } catch (error) {
      functions.logger.error('API Proxy Error:', error);
      
      const status = error.response?.status || 500;
      const message = error.response?.data?.error?.message || 
                     'Failed to process request';
      
      res.status(status).json({ 
        error: message,
        code: error.code 
      });
    }
  }
);
