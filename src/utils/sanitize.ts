import DOMPurify from 'dompurify';
import { z } from 'zod';

// Configuration for DOMPurify
const purifyConfig = {
  ALLOWED_TAGS: [], // Strip all HTML tags
  ALLOWED_ATTR: [], // Strip all attributes
  SANITIZE_DOM: true,
  WHOLE_DOCUMENT: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM: false,
};

// Sanitize string input
export function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input, purifyConfig).trim();
}

// Sanitize object recursively
export function sanitizeObject<T extends Record<string, any>>(input: T): T {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

// Sanitize form data before validation
export function sanitizeFormData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const sanitizedData = typeof data === 'object' && data !== null
    ? sanitizeObject(data as Record<string, any>)
    : data;

  return schema.parse(sanitizedData);
}

// Sanitize URL parameters
export function sanitizeUrlParams(params: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    sanitized[key] = sanitizeString(value);
  }

  return sanitized;
}

// Sanitize search query
export function sanitizeSearchQuery(query: string): string {
  return sanitizeString(query)
    .replace(/[<>]/g, '') // Remove potential SQL injection characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
} 