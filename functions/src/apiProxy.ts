import * as functions from 'firebase-functions';
import admin from './firebaseAdmin';
import axios, { isAxiosError } from 'axios';
import { https } from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import { validateAuth } from './middleware/auth.js';

const AIML_API_KEY = defineSecret("AIML_API_KEY");

export const apiProxy = https.onRequest(
  { 
    cors: true,
    minInstances: 1,
    maxInstances: 10,
    secrets: [AIML_API_KEY]
  },
  async (req, res) => {
    // Validate request method
    if (req.method !== 'POST') {
      functions.logger.warn('API Proxy: Method Not Allowed', { method: req.method });
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      // Verify authentication (type assertion to avoid express version conflicts)
      await validateAuth(req as any);
      
      // Validate request body
      if (!req.body || typeof req.body !== 'object') {
        functions.logger.warn('API Proxy: Invalid request body', { body: req.body });
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
            'Authorization': `Bearer ${AIML_API_KEY.value()}`,
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
    } catch (error: unknown) {
      functions.logger.error('API Proxy Error:', error);
      
      let status = 500;
      let message = 'Failed to process request';
      let code = 'UNKNOWN_ERROR';

      if (isAxiosError(error)) {
        status = error.response?.status || 500;
        message = error.response?.data?.error?.message || message;
        code = error.code || code;
      } else if (error instanceof Error) {
        message = error.message;
        code = 'AUTH_ERROR';
      }
      
      res.status(status).json({ 
        error: message,
        code: code
      });
    }
  }
);
