import { toast } from 'sonner';
import * as Sentry from "@sentry/react";
import { csrfManager } from './csrf';
import { sanitizeFormData, sanitizeUrlParams } from './sanitize';
import { z } from 'zod';

interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // in milliseconds
}

class RateLimiter {
  private requests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.config.timeWindow);
    
    if (this.requests.length >= this.config.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

// Create rate limiters for different endpoints
const reportLimiter = new RateLimiter({ maxRequests: 10, timeWindow: 60000 }); // 10 requests per minute
const authLimiter = new RateLimiter({ maxRequests: 5, timeWindow: 60000 }); // 5 requests per minute

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Check rate limiting based on endpoint
  const limiter = endpoint.includes('/reports') ? reportLimiter : authLimiter;
  if (!limiter.canMakeRequest()) {
    throw new ApiError('Rate limit exceeded. Please try again later.');
  }

  try {
    // Sanitize URL parameters if present
    const url = new URL(endpoint, window.location.origin);
    const params = Object.fromEntries(url.searchParams.entries());
    const sanitizedParams = sanitizeUrlParams(params);
    url.search = new URLSearchParams(sanitizedParams).toString();

    // Add CSRF token to headers
    const headers = await csrfManager.addTokenToHeaders({
      'Content-Type': 'application/json',
      ...options.headers,
    });

    const response = await fetch(url.toString(), {
      ...options,
      headers,
      credentials: 'include', // Include cookies for CSRF
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.message || 'An error occurred',
        response.status,
        error.code
      );
    }

    return response.json();
  } catch (error) {
    // Log error to Sentry
    Sentry.captureException(error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError('Network error occurred');
  }
}

// API endpoints with validation
export const API = {
  reports: {
    list: () => apiRequest('/api/reports'),
    get: (id: string) => apiRequest(`/api/reports/${sanitizeString(id)}`),
    create: (data: unknown, schema: z.ZodSchema) => {
      const sanitizedData = sanitizeFormData(schema, data);
      return apiRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify(sanitizedData),
      });
    },
    update: (id: string, data: unknown, schema: z.ZodSchema) => {
      const sanitizedData = sanitizeFormData(schema, data);
      return apiRequest(`/api/reports/${sanitizeString(id)}`, {
        method: 'PUT',
        body: JSON.stringify(sanitizedData),
      });
    },
    delete: (id: string) => apiRequest(`/api/reports/${sanitizeString(id)}`, {
      method: 'DELETE',
    }),
  },
  auth: {
    login: (credentials: unknown, schema: z.ZodSchema) => {
      const sanitizedData = sanitizeFormData(schema, credentials);
      return apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(sanitizedData),
      });
    },
    register: (data: unknown, schema: z.ZodSchema) => {
      const sanitizedData = sanitizeFormData(schema, data);
      return apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(sanitizedData),
      });
    },
    resetPassword: (email: string) => {
      const sanitizedEmail = sanitizeString(email);
      return apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email: sanitizedEmail }),
      });
    },
  },
};

// Error handling utility
export function handleApiError(error: unknown): void {
  if (error instanceof ApiError) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
} 