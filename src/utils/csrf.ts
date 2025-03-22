import { toast } from 'sonner';
import * as Sentry from "@sentry/react";

class CSRFManager {
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  async getToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.token!;
    }

    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
      this.token = data.token;
      this.tokenExpiry = Date.now() + this.TOKEN_EXPIRY;
      return this.token;
    } catch (error) {
      Sentry.captureException(error);
      toast.error('Failed to initialize security token');
      throw error;
    }
  }

  private isTokenValid(): boolean {
    return this.token !== null && 
           this.tokenExpiry !== null && 
           Date.now() < this.tokenExpiry;
  }

  async addTokenToHeaders(headers: HeadersInit): Promise<HeadersInit> {
    const token = await this.getToken();
    return {
      ...headers,
      'X-CSRF-Token': token,
    };
  }
}

export const csrfManager = new CSRFManager(); 