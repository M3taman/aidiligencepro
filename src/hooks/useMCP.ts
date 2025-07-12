import { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface MCPClient {
  executeResource: (name: string, params: any) => Promise<any>;
  callTool: (name: string, params: any) => Promise<any>;
  subscribe: (callback: (data: any) => void) => void;
}

interface MCPState {
  connected: boolean;
  loading: boolean;
  error: string | null;
}

export const useMCP = () => {
  const [state, setState] = useState<MCPState>({
    connected: false,
    loading: false,
    error: null
  });

  const [client, setClient] = useState<MCPClient | null>(null);

  useEffect(() => {
    // Initialize Firebase if not already done
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    const app = initializeApp(firebaseConfig);
    const functions = getFunctions(app);

    // Create MCP client instance
    const mcpClient: MCPClient = {
      executeResource: async (name: string, params: any) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
          const executeResourceFn = httpsCallable(functions, 'mcpExecuteResource');
          const result = await executeResourceFn({ name, params });
          setState(prev => ({ ...prev, loading: false, connected: true }));
          return result.data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setState(prev => ({ ...prev, loading: false, error: errorMessage }));
          throw error;
        }
      },

      callTool: async (name: string, params: any) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
          const callToolFn = httpsCallable(functions, 'mcpCallTool');
          const result = await callToolFn({ name, params });
          setState(prev => ({ ...prev, loading: false, connected: true }));
          return result.data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setState(prev => ({ ...prev, loading: false, error: errorMessage }));
          throw error;
        }
      },

      subscribe: (callback: (data: any) => void) => {
        // WebSocket connection for real-time updates
        const ws = new WebSocket(`wss://${firebaseConfig.authDomain}/mcp-stream`);
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          callback(data);
        };
        return () => ws.close();
      }
    };

    setClient(mcpClient);
  }, []);

  const analyzeStock = useCallback(async (symbol: string, period: string = '1d') => {
    if (!client) throw new Error('MCP client not initialized');
    return client.executeResource('stock_analysis', { symbol, period });
  }, [client]);

  const generateDueDiligenceReport = useCallback(async (companyName: string, options: any = {}) => {
    if (!client) throw new Error('MCP client not initialized');
    return client.callTool('due_diligence_report', { companyName, ...options });
  }, [client]);

  const getRealTimeAlerts = useCallback(async (portfolioId: string) => {
    if (!client) throw new Error('MCP client not initialized');
    return client.executeResource('real_time_alerts', { portfolioId });
  }, [client]);

  const getESGRatings = useCallback(async (symbol: string) => {
    if (!client) throw new Error('MCP client not initialized');
    return client.executeResource('esg_ratings', { symbol });
  }, [client]);

  const getSECFilings = useCallback(async (symbol: string, filingType: string = '10-K') => {
    if (!client) throw new Error('MCP client not initialized');
    return client.executeResource('sec_filings', { symbol, filingType });
  }, [client]);

  return {
    state,
    client,
    // Core MCP functions
    analyzeStock,
    generateDueDiligenceReport,
    getRealTimeAlerts,
    getESGRatings,
    getSECFilings
  };
};