import { useState, useEffect, useCallback } from 'react';
import app from '../firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ReportGenerationOptions, DueDiligenceReportType, ESGRatings, StockAnalysis, Alert } from '../types';

interface MCPClient {
  executeResource: (name: string, params: Record<string, unknown>) => Promise<unknown>;
  callTool: (name: string, params: Record<string, unknown>) => Promise<unknown>;
  subscribe: (callback: (data: unknown) => void) => void;
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
    const functions = getFunctions(app);

    // Create MCP client instance
    const mcpClient: MCPClient = {
      executeResource: async (name: string, params: Record<string, unknown>): Promise<unknown> => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
          const executeResourceFn = httpsCallable(functions, 'mcpExecuteResource');
          const result = await executeResourceFn({ name, params });
          return result.data;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setState(prev => ({ ...prev, loading: false, error: errorMessage }));
          throw error;
        }
      },

      callTool: async (name: string, params: Record<string, unknown>): Promise<unknown> => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
          const callToolFn = httpsCallable(functions, 'mcpCallTool');
          const result = await callToolFn({ name, params });
          setState(prev => ({ ...prev, loading: false, connected: true }));
          return result.data;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setState(prev => ({ ...prev, loading: false, error: errorMessage }));
          throw error;
        }
      },

      subscribe: (_callback: (data: unknown) => void) => {
        // WebSocket connection for real-time updates (currently not implemented)
        console.warn("WebSocket subscription is not yet implemented.");
        return () => {}; // Return a no-op unsubscribe function
      }
    };

    setClient(mcpClient);
  }, []);

  const analyzeStock = useCallback(async (symbol: string, period: string = '1d'): Promise<StockAnalysis> => {
    if (!client) throw new Error('MCP client not initialized');
    return client.executeResource('stock_analysis', { symbol, period }) as Promise<StockAnalysis>;
  }, [client]);

  const generateDueDiligenceReport = useCallback(async (companyName: string, options: ReportGenerationOptions = {}): Promise<DueDiligenceReportType> => {
    if (!client) throw new Error('MCP client not initialized');
    return client.callTool('due_diligence_report', { companyName, ...options }) as Promise<DueDiligenceReportType>;
  }, [client]);

  const getRealTimeAlerts = useCallback(async (portfolioId: string): Promise<{ alerts: Alert[] }> => {
    if (!client) throw new Error('MCP client not initialized');
    return client.executeResource('real_time_alerts', { portfolioId }) as Promise<{ alerts: Alert[] }>;
  }, [client]);

  const getESGRatings = useCallback(async (symbol: string): Promise<ESGRatings> => {
    if (!client) throw new Error('MCP client not initialized');
    return client.executeResource('esg_ratings', { symbol }) as Promise<ESGRatings>;
  }, [client]);

  const getSECFilings = useCallback(async (symbol: string, filingType: string = '10-K'): Promise<unknown> => {
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
