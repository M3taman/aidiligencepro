import { useState, useEffect, useCallback } from react;
import app from ../firebase;
import { getFunctions, httpsCallable } from firebase/functions;
import { ReportGenerationOptions, DueDiligenceReportType, ESGRatings, StockAnalysis, Alert } from ../types;

interface MCPState {
  connected: boolean;
  loading: boolean;
  error: string | null;
}

export const useMCP = () => {
  const [state, setState] = useState<MCPState>({ connected: false, loading: false, error: null });

  useEffect(() => {
    setState(prev => ({ ...prev, connected: true }));
  }, []);

  const functions = getFunctions(app);
  const executeResourceFn = httpsCallable(functions, mcpExecuteResource);
  const callToolFn = httpsCallable(functions, mcpCallTool);
  const realTimeFn = httpsCallable(functions, mcpRealTime);

  // Maps old names -> server resources
  const executeResource = useCallback(async (name: string, params: Record<string, unknown>): Promise<unknown> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      let payload: Record<string, unknown> = {};
      switch (name) {
        case stock_analysis: // old -> stock_data
          payload = { resource: stock_data, symbol: String(params.symbol ?? ) };
          break;
        case news:
          payload = { resource: news, symbol: String(params.symbol ?? ) };
          break;
        case sec_filings:
          payload = { resource: sec_filings, symbol: String(params.symbol ?? ) };
          break;
        case esg_ratings: // map to metrics for now
          payload = { resource: metrics, symbol: String(params.symbol ?? ) };
          break;
        case overview:
          payload = { resource: overview, symbol: String(params.symbol ?? ) };
          break;
        case real_time_alerts:
          // Use realtime endpoint instead of resource
          const rt = await realTimeFn({});
          setState(prev => ({ ...prev, loading: false }));
          return rt.data;
        default:
          // Fallback: if a symbol + resource were provided, pass through
          payload = {
            resource: String((params as any)?.resource ?? name),
            symbol: String((params as any)?.symbol ?? )
          };
      }
      const result = await executeResourceFn(payload);
      setState(prev => ({ ...prev, loading: false }));
      return result.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : Unknown
